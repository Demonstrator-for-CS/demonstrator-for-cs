from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging
import os
from datetime import datetime
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
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        logger.info(f"Controller input received: {data}")

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
            if direction == 'next' and demo_state['current_demo'] == 'logic-gates' and demo_state['current_slide'] == 7:
                demo_state['current_slide'] = 0
            elif direction == 'next' and demo_state['current_demo'] == 'searching-sorting' and demo_state['current_slide'] == 30:
                demo_state['current_slide'] = 0
            elif direction == 'next':
                demo_state['current_slide'] += 1
            elif direction == 'prev':
                demo_state['current_slide'] = max(0, demo_state['current_slide'] - 1)
            elif direction == 'select':
                demo_state['status'] = 'playing'

        elif action == 'play':
            demo_state['status'] = 'playing'

        elif action == 'pause':
            demo_state['status'] = 'paused'

        elif action == 'reset':
            demo_state['current_slide'] = 0
            demo_state['status'] = 'idle'

        elif action == 'set_demo':
            demo_state['current_demo'] = payload.get('demo')
            demo_state['current_slide'] = 0
            demo_state['status'] = 'idle'

        elif action == 'logic_gates_input':
            demo_state['controller_input'] = payload

        elif action == 'navigate_home':
            # Reset demo state and navigate to home
            demo_state['current_demo'] = None
            demo_state['current_slide'] = 0
            demo_state['status'] = 'idle'
            demo_state['controller_input'] = {}
            # Emit navigate_to_home event to trigger navigation on demo-site
            socketio.emit('navigate_to_home', {'timestamp': data.get('timestamp')}, namespace='/')

        socketio.emit('state_update', demo_state, namespace='/')

        return jsonify({'success': True, 'state': demo_state})
    except Exception as e:
        logger.error(f"Error processing controller input: {e}")
        return jsonify({'success': False, 'error': 'Failed to process input'}), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(demo_state)


@app.route('/api/start', methods=['POST'])
def start_demo():
    logger.info("Start demo requested")
    demo_state['status'] = 'playing'
    socketio.emit('state_update', demo_state, namespace='/')
    return jsonify({'success': True, 'state': demo_state})


@app.route('/api/pause', methods=['POST'])
def pause_demo():
    logger.info("Pause demo requested")
    demo_state['status'] = 'paused'
    socketio.emit('state_update', demo_state, namespace='/')
    return jsonify({'success': True, 'state': demo_state})


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
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        logger.info(f'Client connected at {timestamp}')

        # Log connection to Supabase
        log_interaction('connect', f'Client connected at {timestamp}')

        emit('state_update', demo_state)
    except Exception as e:
        logger.error(f'Error handling connect: {e}')


@socketio.on('disconnect')
def handle_disconnect():
    try:
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        logger.info(f'Client disconnected at {timestamp}')

        # Log disconnection to Supabase
        log_interaction('disconnect', f'Client disconnected at {timestamp}')
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
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)

##TODO: Get user input to work with Adder
##TODO: Test Render server interaction more

##TODO: Flash Pi With Newest Stuff
##TODO: Make Pi Script to Have it Autoboot the demo
