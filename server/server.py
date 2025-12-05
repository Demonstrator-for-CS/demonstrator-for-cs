from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room # Added join_room, leave_room
import logging
import os
from datetime import datetime
from database import log_interaction, get_interaction_logs, clear_old_logs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
class Config:
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
# We will track the current active SocketIO session (SID) for the controller
# to ensure only one active controller is managed, and to associate the user
# with the active demo.

demo_state = {
    'status': 'idle',
    'current_demo': None,
    'current_slide': 0,
    'speed': 1.0,
    'controller_input': {}
}

active_controller_sid = None
CONTROLLER_ROOM_PREFIX = 'demo_controller_'

def reset_demo():
    """Reset the demo state."""
    logger.info("Demo state reset.")
    demo_state['current_slide'] = 0
    demo_state['status'] = 'idle'
    demo_state['controller_input'] = {}
    demo_state['current_demo'] = None # Explicitly clear demo
    socketio.emit('state_update', demo_state, namespace='/')
    # Note: State updates to the local animation site are handled separately
    # (e.g., via another socket connection not shown here).


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

# --- 1. Connection/Disconnection Logging (Reliable) ---

@socketio.on('connect')
def handle_connect():
    """Logs connection and tracks the active controller."""
    global active_controller_sid

    # We differentiate connections here: one for the controller, one for the animation site.
    # We assume the initial connection is from the controller client.
    # For a robust solution, the client should send an 'identify' message.

    # If this is the first controller connecting, track it.
    if active_controller_sid is None:
        active_controller_sid = request.sid

        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        client_ip = request.remote_addr

        logger.info(f"[LOG: CONTROLLER CONNECT] New controller connected. SID: {request.sid}, IP: {client_ip}")
        # Log interaction to database
        log_interaction('connect', f'Controller connected from {client_ip} (SID: {request.sid})')

        # Send confirmation and current state
        emit('server_message', {'data': f'Welcome, Controller {request.sid[:4]}...'})
        emit('state_update', demo_state)
    else:
        # If a controller is already active, tell this new connection to wait or ignore it.
        logger.warning(f"Secondary connection attempted (SID: {request.sid}). Active controller is {active_controller_sid}.")
        emit('server_message', {'data': 'A controller is already active. This connection is auxiliary.'})


@socketio.on('disconnect')
def handle_disconnect():
    """Logs disconnection (triggered by clean exit OR heartbeat timeout)."""
    global active_controller_sid

    session_id = request.sid
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if session_id == active_controller_sid:
        logger.info(f"[LOG: CONTROLLER DISCONNECT] Primary controller disconnected. SID: {session_id}")
        # Log interaction to database
        log_interaction('disconnect', f'Controller disconnected (SID: {session_id})')

        # Clear active controller tracking and reset the demo state
        active_controller_sid = None
        reset_demo()
    else:
        logger.info(f"Auxiliary connection disconnected. SID: {session_id}")

    # Remove the socket from all rooms it may have joined
    # Note: SocketIO does this automatically on disconnect, but we clean up our own state.


# --- 2. Controller Input Handler (Unified Event) ---

@socketio.on('controller_input')
def handle_controller_input(data):
    """
    Receives all control commands from the React client.
    This replaces the old /api/controller/input POST route.
    """
    if request.sid != active_controller_sid:
        logger.warning(f"Ignoring input from unauthorized SID: {request.sid}")
        return

    try:
        action = data.get('action')
        payload = data.get('payload', {})

        logger.info(f"[LOG: INPUT] Received input -> Action: {action}, Payload: {payload}")

        # Update demo_state based on action
        if action == 'navigate':
            direction = payload.get('direction')
            # Update controller_input so the frontend can react to navigation
            demo_state['controller_input'] = {
                'action': action,
                'payload': payload,
                'timestamp': data.get('timestamp')
            }

            match direction:
                case 'next':
                    if demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 7:
                        demo_state['current_slide'] = 0
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 32:
                        demo_state['current_slide'] = 0
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] += 1
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']
                case 'prev':
                    if demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 7
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 32
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] = max(0, demo_state['current_slide'] - 1)
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']

        elif action == 'reset_animation':
            demo_state['status'] = 'playing'

        elif action == 'start_sorting':
            demo_state['status'] = 'sorting'

        elif action == 'set_demo':
            new_demo = payload.get('demo')
            # 1. Clean up from previous room if necessary
            if demo_state['current_demo']:
                leave_room(CONTROLLER_ROOM_PREFIX + demo_state['current_demo'])
                logger.info(f"SID {request.sid} left room: {CONTROLLER_ROOM_PREFIX + demo_state['current_demo']}")

            # 2. Join the new room
            join_room(CONTROLLER_ROOM_PREFIX + new_demo)
            logger.info(f"SID {request.sid} joined room: {CONTROLLER_ROOM_PREFIX + new_demo}")

            # 3. Update state
            demo_state['current_demo'] = new_demo
            demo_state['current_slide'] = 0
            demo_state['status'] = 'playing'

        elif action == 'logic_gates_input':
            demo_state['controller_input'] = payload

        elif action == 'navigate_to_home':
            # Clean up from current room
            if demo_state['current_demo']:
                leave_room(CONTROLLER_ROOM_PREFIX + demo_state['current_demo'])
                logger.info(f"SID {request.sid} left room: {CONTROLLER_ROOM_PREFIX + demo_state['current_demo']}")

            demo_state['current_demo'] = None
            demo_state['current_slide'] = 0
            demo_state['status'] = 'home'
            demo_state['controller_input'] = {}

        # Broadcast the updated state to all subscribed clients
        socketio.emit('state_update', demo_state, namespace='/')

        # Example of sending a specific state update to the Logic Gates controller room only:
        # if action == 'logic_gates_input':
        #    socketio.emit('logic_gates_state', {'output': compute_logic_output(payload)},
        #                   room=CONTROLLER_ROOM_PREFIX + 'logic-gates')


    except Exception as e:
        logger.error(f"Error processing controller input: {e}")
        # Optionally send an error back to the client
        emit('server_message', {'data': f'Error processing input: {e}'})

# ----------------------------------------------------------------------
# TRADITIONAL FLASK ROUTES (for Health Checks, Logs, etc.)
# ----------------------------------------------------------------------

# REMOVED: @app.route('/api/controller/input', methods=['POST'])
# The logic for this is now entirely in handle_controller_input SocketIO event

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(demo_state)

# This route remains useful for manual/external state resets
@app.route('/api/reset', methods=['POST'])
def reset_demo_route():
    reset_demo()
    return jsonify({'success': True, 'state': demo_state})


# Other existing routes for animation site clients (kept for completeness)
@socketio.on('request_state')
def handle_state_request():
    try:
        emit('state_update', demo_state)
    except Exception as e:
        logger.error(f'Error handling state request: {e}')

# Health and Log Routes (kept for completeness)
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/interaction-log', methods=['GET'])
def get_interaction_log():
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
    Clear old interaction logs.
    Query params:
        - days: Delete logs older than this many days (default: 30)
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