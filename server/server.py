"""
Demo Controller Flask Server

This server acts as a bridge between the demo-controller (remote phone interface)
and the demo-site (display behind glass). It maintains the global demo state and
relays controller inputs to the demo site in real-time using WebSocket connections.

Architecture:
    - demo-controller: React app hosted on GitHub Pages for phone access
    - server: Flask + Socket.IO bridge (this file) that manages state
    - demo-site: React app displaying CS demonstrations behind glass

Communication Flow:
    controller (phone) -> WebSocket -> server -> WebSocket -> demo-site (display)

The server tracks which demo is active, which slide is displayed, and relays
user inputs like navigation and logic gate toggles.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import logging
import os
from datetime import datetime
from database import log_interaction, get_interaction_logs, clear_old_logs
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configuration
class Config:
    """Flask application configuration loaded from environment variables."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default-dev-secret-key') # Added default
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    # Use a secure list of origins in production, '*' for development
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    #CORS_ORIGINS = '*'


# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": Config.CORS_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize SocketIO with settings optimized for persistent connections
socketio = SocketIO(
    app,
    cors_allowed_origins=Config.CORS_ORIGINS,
    async_mode='threading',
    logger=True, # Set to True to see SocketIO pings/pongs and connection events
    engineio_logger=True,
    # These defaults ensure timely disconnect detection (Heartbeat Mechanism)
    # ping_timeout=60,
    # ping_interval=25
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Security headers middleware
@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    # Only use Strict-Transport-Security if running over HTTPS
    # response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

# --- Global Demo State and Socket Tracking ---
# The server maintains a single source of truth for the demo state, which is
# synchronized to both the controller and the demo-site via WebSocket events.
# Only one controller can be active at a time to prevent conflicts.

# Global state object shared between controller and demo-site
demo_state = {
    'status': 'idle',           # Current status: 'idle', 'playing', 'paused', 'sorting', 'home'
    'current_demo': None,       # Active demo: 'logic-gates', 'searching-sorting', or None
    'current_slide': 0,         # Current slide index within the active demo
    'speed': 1.0,               # Animation speed multiplier (for future use)
    'controller_input': {}      # Latest controller input data (e.g., logic gate values)
}

# Track the active controller's Socket.IO session ID to enforce single-controller access
active_controller_sid = None
CONTROLLER_ROOM_PREFIX = 'demo_controller_'

def reset_demo():
    """
    Reset the demo state to initial values.

    This is called when the controller disconnects or when a manual reset is requested.
    Broadcasts the reset state to all connected clients via WebSocket.
    """
    logger.info("Demo state reset.")
    demo_state['current_slide'] = 0
    demo_state['status'] = 'idle'
    demo_state['controller_input'] = {}
    demo_state['current_demo'] = None
    socketio.emit('state_update', demo_state, namespace='/')


# Error handlers (kept for completeness)
@app.errorhandler(400)
def bad_request(e):
    logger.error(f"Bad request: {e}")
    return jsonify({'success': False, 'error': 'Bad request'}), 400

@app.errorhandler(404)
def not_found(e):
    logger.error(f"Not found: {e}")
    return jsonify({'success': False, 'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.errorhandler(Exception)
def handle_exception(e):
    logger.exception(f"Unhandled exception: {e}")
    return jsonify({'success': False, 'error': 'An unexpected error occurred'}), 500

# ----------------------------------------------------------------------
# SOCKET.IO EVENT HANDLERS (for Controller and Animation Site)
# ----------------------------------------------------------------------

# --- 1. Connection/Disconnection Logging ---

@socketio.on('connect')
def handle_connect():
    """
    Handle new WebSocket connections.

    Both the controller (phone) and demo-site (display) connect to this server.
    The first connection is designated as the active controller. Subsequent
    connections are treated as auxiliary (typically the demo-site).

    Connection lifecycle:
        1. Client connects via WebSocket
        2. If no active controller, designate this as the active controller
        3. Send welcome message and current demo state
        4. Log connection to database for analytics

    Note: For a more robust solution, clients should send an 'identify' event
    to explicitly declare their role (controller vs. demo-site).
    """
    global active_controller_sid

    # If this is the first controller connecting, track it
    if active_controller_sid is None:
        active_controller_sid = request.sid
        client_ip = request.remote_addr

        logger.info(f"[LOG: CONTROLLER CONNECT] New controller connected. SID: {request.sid}, IP: {client_ip}")
        # Log interaction to database for analytics
        log_interaction('connect', f'Controller connected from {client_ip} (SID: {request.sid})')

        # Send confirmation and current state to the newly connected controller
        emit('server_message', {'data': f'Welcome, Controller {request.sid[:4]}...'})
        emit('state_update', demo_state)
    else:
        # If a controller is already active, this is likely the demo-site or a duplicate connection
        logger.warning(f"Secondary connection attempted (SID: {request.sid}). Active controller is {active_controller_sid}.")
        emit('server_message', {'data': 'A controller is already active. This connection is auxiliary.'})


@socketio.on('disconnect')
def handle_disconnect():
    """
    Handle WebSocket disconnections.

    Disconnections can be triggered by:
        - User closing the controller app
        - Network interruption
        - Heartbeat timeout (client unresponsive)

    If the active controller disconnects, reset the demo state and clear
    the active controller tracking to allow a new controller to connect.

    Note: Socket.IO automatically removes the client from all rooms on disconnect.
    """
    global active_controller_sid

    session_id = request.sid

    if session_id == active_controller_sid:
        logger.info(f"[LOG: CONTROLLER DISCONNECT] Primary controller disconnected. SID: {session_id}")
        # Log disconnection to database for analytics
        log_interaction('disconnect', f'Controller disconnected (SID: {session_id})')

        # Clear active controller tracking and reset the demo state
        active_controller_sid = None
        reset_demo()
    else:
        # This was an auxiliary connection (demo-site or duplicate)
        logger.info(f"Auxiliary connection disconnected. SID: {session_id}")


# --- 2. Controller Input Handler (Unified Event) ---

@socketio.on('controller_input')
def handle_controller_input(data):
    """
    Handle all controller input events from the demo-controller.

    This is the main event handler for all user interactions from the phone controller.
    It updates the global demo state based on the action and broadcasts changes to all
    connected clients (including the demo-site display).

    Supported actions:
        - navigate: Move between slides (next/prev)
        - set_demo: Switch to a different demo
        - reset_animation: Reset the current animation
        - start_sorting: Begin sorting animation
        - logic_gates_input: Update logic gate input values
        - navigate_to_home: Return to home screen

    Args:
        data (dict): Controller input data containing:
            - action (str): The action to perform
            - payload (dict): Action-specific data
            - timestamp (int): Client timestamp for deduplication

    Security:
        Only the active controller (identified by session ID) can send inputs.
        Unauthorized inputs are ignored and logged as warnings.
    """
    if request.sid != active_controller_sid:
        logger.warning(f"Ignoring input from unauthorized SID: {request.sid}")
        return

    try:
        action = data.get('action')
        payload = data.get('payload', {})

        logger.info(f"[LOG: INPUT] Received input -> Action: {action}, Payload: {payload}")

        # Update demo_state based on action
        # Navigation between slides with wraparound logic
        if action == 'navigate':
            direction = payload.get('direction')
            # Update controller_input so the frontend can react to navigation
            demo_state['controller_input'] = {
                'action': action,
                'payload': payload,
                'timestamp': data.get('timestamp')
            }

            # Navigate through slides with wraparound at demo boundaries
            match direction:
                case 'next':
                    # Logic Gates demo has 8 slides (0-7)
                    if demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 7:
                        demo_state['current_slide'] = 0  # Wrap to beginning
                    # Searching/Sorting demo has 33 slides (0-32)
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 32:
                        demo_state['current_slide'] = 0  # Wrap to beginning
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] += 1
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']
                case 'prev':
                    # Wrap backwards from first slide to last slide
                    if demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 7  # Wrap to end
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 32  # Wrap to end
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] = max(0, demo_state['current_slide'] - 1)
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']

        # Reset animation to initial state
        elif action == 'reset_animation':
            demo_state['status'] = 'playing'

        # Start the sorting visualization
        elif action == 'start_sorting':
            demo_state['status'] = 'sorting'

        # Switch to a different demo
        elif action == 'set_demo':
            new_demo = payload.get('demo')
            # 1. Clean up from previous demo room if necessary
            if demo_state['current_demo']:
                leave_room(CONTROLLER_ROOM_PREFIX + demo_state['current_demo'])
                logger.info(f"SID {request.sid} left room: {CONTROLLER_ROOM_PREFIX + demo_state['current_demo']}")

            # 2. Join the new demo's Socket.IO room for targeted messaging
            join_room(CONTROLLER_ROOM_PREFIX + new_demo)
            logger.info(f"SID {request.sid} joined room: {CONTROLLER_ROOM_PREFIX + new_demo}")

            # 3. Update state to reflect the new demo
            demo_state['current_demo'] = new_demo
            demo_state['current_slide'] = 0
            demo_state['status'] = 'playing'

        # Update logic gate input values (A and B toggles)
        elif action == 'logic_gates_input':
            demo_state['controller_input'] = payload

        # Return to home screen
        elif action == 'navigate_to_home':
            # Clean up from current demo room
            if demo_state['current_demo']:
                leave_room(CONTROLLER_ROOM_PREFIX + demo_state['current_demo'])
                logger.info(f"SID {request.sid} left room: {CONTROLLER_ROOM_PREFIX + demo_state['current_demo']}")

            # Reset to home state
            demo_state['current_demo'] = None
            demo_state['current_slide'] = 0
            demo_state['status'] = 'home'
            demo_state['controller_input'] = {}

        # Broadcast the updated state to all connected clients (controller and demo-site)
        socketio.emit('state_update', demo_state, namespace='/')

    except Exception as e:
        logger.error(f"Error processing controller input: {e}")
        # Send error message back to the client for debugging
        emit('server_message', {'data': f'Error processing input: {e}'})

# ----------------------------------------------------------------------
# TRADITIONAL FLASK ROUTES (for Health Checks, Logs, etc.)
# ----------------------------------------------------------------------

# ----------------------------------------------------------------------
# REST API Endpoints (Traditional HTTP Routes)
# ----------------------------------------------------------------------

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Get the current demo state.

    Returns:
        JSON object with current demo state including status, current_demo,
        current_slide, speed, and controller_input.

    Example response:
        {
            "status": "playing",
            "current_demo": "logic-gates",
            "current_slide": 3,
            "speed": 1.0,
            "controller_input": {"inputA": true, "inputB": false}
        }
    """
    return jsonify(demo_state)

@app.route('/api/reset', methods=['POST'])
def reset_demo_route():
    """
    Manually reset the demo state to initial values.

    This is useful for external scripts or manual intervention.
    The reset is also broadcast to all connected clients via WebSocket.

    Returns:
        JSON object with success status and updated state.
    """
    reset_demo()
    return jsonify({'success': True, 'state': demo_state})

@socketio.on('request_state')
def handle_state_request():
    """
    Handle state request from demo-site.

    The demo-site requests the current state when it first connects or needs
    to resynchronize. This sends the current demo_state to the requesting client.
    """
    try:
        emit('state_update', demo_state)
    except Exception as e:
        logger.error(f'Error handling state request: {e}')

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for monitoring and deployment systems.

    Returns:
        JSON object indicating the server is healthy and running.
    """
    return jsonify({'status': 'healthy'})

@app.route('/api/interaction-log', methods=['GET'])
def get_interaction_log():
    """
    Retrieve interaction logs from the database.

    Query parameters:
        limit (int): Maximum number of logs to retrieve (default: 100)

    Returns:
        JSON object containing:
            - success (bool): Whether the request succeeded
            - log (list): List of log entries with id, event_type, timestamp, and details
            - count (int): Number of log entries returned

    Example:
        GET /api/interaction-log?limit=50
    """
    try:
        limit = request.args.get('limit', 100, type=int)
        logs = get_interaction_logs(limit=limit)

        return jsonify({
            'success': True,
            'log': logs,
            'count': len(logs)
        })
    except Exception as e:
        logger.error(f"Error retrieving interaction log: {e}")
        return jsonify({
            'success': False,
            'error': str(e),
            'log': []
        }), 500

@app.route('/api/interaction-log/cleanup', methods=['POST'])
def cleanup_interaction_logs():
    """
    Delete old interaction logs from the database.

    This is useful for maintaining database size and GDPR compliance.

    Query parameters:
        days (int): Delete logs older than this many days (default: 30)

    Returns:
        JSON object with success status and message.

    Example:
        POST /api/interaction-log/cleanup?days=60
    """
    try:
        days = request.args.get('days', 30, type=int)
        success = clear_old_logs(days=days)

        if success:
            return jsonify({
                'success': True,
                'message': f'Successfully cleared logs older than {days} days'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Failed to clear logs. Check server logs for details.'
            }), 500
    except Exception as e:
        logger.error(f"Error clearing interaction logs: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == '__main__':
    logger.info("Starting Flask server on http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)