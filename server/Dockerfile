FROM python:3.11-slim

# Set environment variables for Python optimization
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Render will provide PORT environment variable
EXPOSE $PORT

# Health check (Render Suggested)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:${PORT:-8000}/health')" || exit 1

# Use gunicorn with eventlet worker for SocketIO support
# Configuration optimized for production:
# - worker-class eventlet: Required for WebSocket/SocketIO support
# - workers 1: Eventlet workers should use 1 worker
# - timeout 120: Increased timeout for long-running connections
# - keepalive 5: Keep connections alive
# - access-logfile -: Log to stdout
# - error-logfile -: Log errors to stderr
CMD gunicorn \
    --worker-class eventlet \
    -w 1 \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --keep-alive 5 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    server:app