from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

demo_state = {
    'status': 'idle',
    'current_demo': None,
    'current_slide': 0,
    'speed': 1.0,
    'controller_input': {}
}


@app.route('/api/controller/input', methods=['POST'])
def controller_input():
    data = request.json
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
        if direction == 'next':
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

    socketio.emit('state_update', demo_state, namespace='/')

    return jsonify({'success': True, 'state': demo_state})


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
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    logger.info(f'Client connected at {timestamp}')

    # Log connection to file
    with open('interactionLog.txt', 'a') as f:
        f.write(f'Client connected: {timestamp}\n')

    emit('state_update', demo_state)


@socketio.on('disconnect')
def handle_disconnect():
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    logger.info(f'Client disconnected at {timestamp}')

    # Log disconnection to file
    with open('interactionLog.txt', 'a') as f:
        f.write(f'Client disconnected: {timestamp}\n')

    # TODO: Only send navigate_to_home when controller specifically disconnects
    # For now, commented out to avoid interfering with normal operation
    # socketio.emit('navigate_to_home', {'timestamp': timestamp}, namespace='/')


@socketio.on('request_state')
def handle_state_request():
    emit('state_update', demo_state)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})


@app.route('/api/interaction-log', methods=['GET'])
def get_interaction_log():
    try:
        with open('interactionLog.txt', 'r') as f:
            log_contents = f.read()

        # Split into lines and return as array for easier parsing
        log_lines = [line.strip() for line in log_contents.split('\n') if line.strip()]

        return jsonify({
            'success': True,
            'log': log_lines,
            'raw': log_contents
        })
    except FileNotFoundError:
        return jsonify({
            'success': True,
            'log': [],
            'raw': '',
            'message': 'No interactions logged yet'
        })


if __name__ == '__main__':
    logger.info("Starting Flask server on http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)