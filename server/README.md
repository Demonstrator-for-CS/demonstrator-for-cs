# Demo Controller Flask Server

This Flask server acts as the central bridge between the demo-controller (remote phone interface) and the demo-site (display behind glass), managing state and relaying commands in real-time via WebSockets.

## Project Architecture

This project consists of three main components:

### 1. demo-controller
- **Purpose:** Remote controller accessed from users' phones
- **Technology:** React + Socket.IO client
- **Hosting:** GitHub Pages at https://demonstrator-for-cs.github.io/
- **Access:** Users scan a QR code displayed on the demo-site to access the controller
- **Functionality:** Provides UI controls for navigating demos and adjusting settings (e.g., logic gate inputs)

### 2. demo-site
- **Purpose:** Main demonstration display shown behind glass
- **Technology:** React + Socket.IO client
- **Hosting:** Typically run locally on a dedicated display machine
- **Features:**
  - Interactive CS demonstrations (Logic Gates, Searching & Sorting)
  - QR code display for controller access
  - Real-time synchronization with controller inputs
  - Animated visualizations and slide presentations

### 3. server (this directory)
- **Purpose:** Central state management and communication bridge
- **Technology:** Flask + Socket.IO + PostgreSQL (Supabase)
- **Hosting:** Render.com at https://pitt-cs-demo-server.onrender.com
- **Responsibilities:**
  - Maintain global demo state (current demo, slide index, controller inputs)
  - Relay controller commands to demo-site via WebSocket broadcasts
  - Log user interactions to database for analytics
  - Enforce single-controller access to prevent conflicts

## Communication Flow

```
User's Phone (Controller)  ←→  Server  ←→  Demo Display (Site)
       [React]                 [Flask]        [React]
    WebSocket Client      WebSocket Server   WebSocket Client
```

1. User scans QR code and accesses demo-controller on their phone
2. Controller establishes WebSocket connection to server
3. Demo-site establishes WebSocket connection to server
4. User presses buttons on controller (e.g., next slide, toggle input)
5. Controller sends command to server via `controller_input` event
6. Server updates global state and broadcasts `state_update` to all clients
7. Demo-site receives state update and reflects changes (e.g., advances to next slide)

## Installation

```bash
cd server
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Database Setup (Supabase)

This server uses Supabase for persistent interaction logging. Follow these steps:

### 1. Create a Free Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project

### 2. Create the Database Table

In your Supabase project dashboard, go to the SQL Editor and run:

```sql
CREATE TABLE interaction_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details TEXT
);

-- Add index for faster queries
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp DESC);

-- Enable Row Level Security (RLS) as a safety measure
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;

-- Allow service role (postgres user) full access
-- This policy won't affect your server since service role bypasses RLS,
-- but it's good practice for defense in depth
CREATE POLICY "Service role has full access" ON interaction_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env .env
   ```

2. Get your Supabase database credentials:
   - Go to Project Settings > Database in your Supabase dashboard
   - Scroll to "Connection string" section
   - Use the "Connection pooling" option (recommended for serverless)
   - Copy the connection parameters

3. Update `.env` with your credentials:
   ```
   user=postgres.your-project-id
   password=your-database-password
   host=aws-0-us-east-1.pooler.supabase.com
   port=6543
   dbname=postgres
   ```

### 4. Deploy to Render

When deploying to Render, add the environment variables in the Render dashboard:
- Go to your Web Service > Environment
- Add `user`, `password`, `host`, `port`, and `dbname`

## Running the Server

```bash
python server.py
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

### Logging Endpoints
- `GET /api/interaction-log` - Get interaction logs from Supabase
  - Query params: `limit` (default: 100)
- `POST /api/interaction-log/cleanup` - Clear old interaction logs
  - Query params: `days` (default: 30) - Delete logs older than this many days
  - Example: `POST /api/interaction-log/cleanup?days=60`

### WebSocket Events
- **`controller_input`** (from controller): Unified event for all controller actions
  - Actions: `navigate`, `set_demo`, `reset_animation`, `start_sorting`, `logic_gates_input`, `navigate_to_home`
- **`state_update`** (to all clients): Broadcast when demo state changes
- **`request_state`** (from demo-site): Request current state on connection
- **`server_message`** (to clients): Server notifications and debugging messages

## State Structure

The server maintains a global state object that is synchronized across all connected clients:

```json
{
  "status": "idle|playing|paused|sorting|home",
  "current_demo": "logic-gates|searching-sorting|null",
  "current_slide": 0,
  "speed": 1.0,
  "controller_input": {
    "action": "logic_gates_input",
    "payload": { "inputA": true, "inputB": false },
    "timestamp": 1638360000000
  }
}
```

### Available Demos

#### Logic Gates (8 slides, index 0-7)
- Introduction to binary and logic gates
- OR, AND, XOR, NOT gates with interactive visualizations
- Combining gates to create complex circuits
- Building a simple adder circuit
- Controller provides A/B input toggles

#### Searching & Sorting (33 slides, index 0-32)
- Binary search tree visualization
- Breadth-first search (BFS) and depth-first search (DFS)
- Finding minimum elements
- Sorting algorithms visualization
- Interactive tree exploration

## Development Notes

### File Structure
```
server/
├── server.py          # Main Flask application with Socket.IO handlers
├── database.py        # PostgreSQL interaction logging module
├── requirements.txt   # Python dependencies
├── Dockerfile         # Container configuration for deployment
├── .env.example      # Environment variable template
└── README.md         # This file
```

### Key Functions
- **`handle_connect()`**: Manages WebSocket connections and controller assignment
- **`handle_disconnect()`**: Cleanup when controller disconnects
- **`handle_controller_input(data)`**: Main event handler for all controller actions
- **`reset_demo()`**: Reset state to initial values
- **`log_interaction()`**: Log events to database for analytics

### Security Considerations
- Only the first connected client is designated as the active controller
- Controller session ID is validated for all input commands
- Database credentials are optional - server runs without logging if not configured
- CORS is configured for production origins