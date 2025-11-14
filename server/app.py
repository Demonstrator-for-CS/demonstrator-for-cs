from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import logging

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
    logger.info('Client connected')
    emit('state_update', demo_state)


@socketio.on('disconnect')
def handle_disconnect():
    logger.info('Client disconnected')


@socketio.on('request_state')
def handle_state_request():
    emit('state_update', demo_state)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    logger.info("Starting Flask server on http://0.0.0.0:5000")
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)