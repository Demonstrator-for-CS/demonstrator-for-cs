# Demo Controller Flask Server

This Flask server acts as a bridge between the demo controller and the demo site, handling controller input and broadcasting state updates in real-time.

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