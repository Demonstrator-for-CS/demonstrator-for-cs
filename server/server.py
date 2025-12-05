from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging
import os
from datetime import datetime
from threading import Timer
from database import log_interaction, get_interaction_logs, clear_old_logs
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')


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

# Initialize SocketIO with production settings
socketio = SocketIO(
    app,
    cors_allowed_origins=Config.CORS_ORIGINS,
    async_mode='threading',
    logger=False,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25
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
    response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response

demo_state = {
    'status': 'idle',
    'current_demo': None,
    'current_slide': 0,
    'speed': 1.0,
    'controller_input': {}
}

# Controller connection tracking
controller_connection = {
    'last_input_time': None,
    'is_connected': False,
    'disconnect_timer': None
}

# 2 minutes in seconds
CONTROLLER_TIMEOUT = 120

def log_controller_disconnect():
    """Log controller disconnect to Supabase after timeout"""
    global controller_connection
    try:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        logger.info(f'Controller disconnected (timeout) at {timestamp}')
        log_interaction('disconnect', f'Controller disconnected at {timestamp}')
        controller_connection['is_connected'] = False
        controller_connection['disconnect_timer'] = None
        reset_demo()
    except Exception as e:
        logger.error(f'Error logging controller disconnect: {e}')

def reset_controller_timeout():
    """Reset the disconnect timer when new input is received"""
    global controller_connection

    # Cancel existing timer if present
    if controller_connection['disconnect_timer']:
        controller_connection['disconnect_timer'].cancel()

    # Start new timer
    controller_connection['disconnect_timer'] = Timer(CONTROLLER_TIMEOUT, log_controller_disconnect)
    controller_connection['disconnect_timer'].start()

# Error handlers
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


@app.route('/api/controller/input', methods=['POST'])
def controller_input():
    global controller_connection
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        logger.info(f"Controller input received: {data}")

        # Track controller connection
        current_time = datetime.now()

        # Log connection if controller was not previously connected
        if not controller_connection['is_connected']:
            timestamp = current_time.strftime('%Y-%m-%d %H:%M:%S')
            logger.info(f'Controller connected at {timestamp}')
            log_interaction('connect', f'Controller connected at {timestamp}')
            controller_connection['is_connected'] = True

        # Update last input time and reset disconnect timer
        controller_connection['last_input_time'] = current_time
        reset_controller_timeout()

        action = data.get('action')
        payload = data.get('payload', {})

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
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 33:
                        demo_state['current_slide'] = 0
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] += 1
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']
                case 'prev':
                    if demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 7
                    elif demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 0:
                        demo_state['current_slide'] = 33
                        demo_state['status'] = 'playing' if demo_state['status'] == 'sorting' else demo_state['status']
                    else:
                        demo_state['current_slide'] = max(0, demo_state['current_slide'] - 1)
                        demo_state['status'] = 'idle' if demo_state['status'] == 'home' else demo_state['status']

        elif action == 'reset_animation':
            demo_state['status'] = 'playing'

        elif action == 'start_sorting':
            demo_state['status'] = 'sorting'

        elif action == 'set_demo':
            demo_state['current_demo'] = payload.get('demo')
            demo_state['current_slide'] = 0
            demo_state['status'] = 'playing'

        elif action == 'logic_gates_input':
            demo_state['controller_input'] = payload

        elif action == 'navigate_to_home':
            demo_state['current_demo'] = None
            demo_state['current_slide'] = 0
            demo_state['status'] = 'home'
            demo_state['controller_input'] = {}

        socketio.emit('state_update', demo_state, namespace='/')

        return jsonify({'success': True, 'state': demo_state})
    except Exception as e:
        logger.error(f"Error processing controller input: {e}")
        return jsonify({'success': False, 'error': 'Failed to process input'}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(demo_state)

@app.route('/api/reset', methods=['POST'])
def reset_demo():
    logger.info("Reset demo requested")
    demo_state['current_slide'] = 0
    demo_state['status'] = 'idle'
    demo_state['controller_input'] = {}
    socketio.emit('state_update', demo_state, namespace='/')
    return jsonify({'success': True, 'state': demo_state})

@socketio.on('connect')
def handle_connect():
    try:
        logger.info('Demo-site socket connected')
        emit('state_update', demo_state)
    except Exception as e:
        logger.error(f'Error handling connect: {e}')


@socketio.on('disconnect')
def handle_disconnect():
    try:
        logger.info('Demo-site socket disconnected')
    except Exception as e:
        logger.error(f'Error handling disconnect: {e}')


@socketio.on('request_state')
def handle_state_request():
    try:
        emit('state_update', demo_state)
    except Exception as e:
        logger.error(f'Error handling state request: {e}')

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

##TODO: Get user input to work with Adder

##TODO: Flash Pi With Newest Stuff
##TODO: Make Pi Script to Have it Autoboot the demo