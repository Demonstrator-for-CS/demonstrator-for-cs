# Demo Controller Flask Server

This Flask server acts as a bridge between the demo controller and the demo site, handling controller input and broadcasting state updates in real-time.

## Installation

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Controller Endpoints
- `POST /api/controller/input` - Receive input from demo controller

### Demo Site Endpoints
- `GET /api/status` - Get current demo state
- `POST /api/start` - Start demo
- `POST /api/pause` - Pause demo
- `POST /api/reset` - Reset demo
- `POST /api/speed` - Set animation speed

### WebSocket
- Real-time state updates via Socket.IO on namespace `/`

## State Structure

```json
{
  "status": "idle|playing|paused",
  "current_demo": "logic-gates|searching-sorting|null",
  "current_slide": 0,
  "speed": 1.0,
  "controller_input": {}
}
```