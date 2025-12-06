"""
Database Module for Interaction Logging

This module handles persistent logging of user interactions with the demo system
using a Supabase PostgreSQL database. It tracks events like controller connections,
disconnections, and other analytics data.

Database Schema:
    Table: interaction_logs
        - id: BIGSERIAL PRIMARY KEY
        - event_type: VARCHAR(50) - Type of event (e.g., 'connect', 'disconnect')
        - timestamp: TIMESTAMPTZ - When the event occurred
        - details: TEXT - Additional event details (e.g., IP address, session ID)

Environment Variables Required:
    - DB_USER: PostgreSQL username
    - DB_PASSWORD: PostgreSQL password
    - DB_HOST: Database host address
    - DB_PORT: Database port (default: 6543 for Supabase connection pooling)
    - DB_NAME: Database name (default: postgres)

Note: If database credentials are not configured, logging will fail gracefully
      and the server will continue to operate without persistent logs.
"""

import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
import logging
import psycopg
from psycopg.rows import dict_row

load_dotenv()

logger = logging.getLogger(__name__)

# Database credentials from environment variables
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
HOST = os.getenv("DB_HOST")
PORT = os.getenv("DB_PORT", "6543")  # 6543 is Supabase's connection pooling port
DBNAME = os.getenv("DB_NAME", "postgres")

# Debug logging to help diagnose credential issues during server startup
logger.info("Database configuration check:")
logger.info(f"  DB_USER: {'SET' if USER else 'MISSING'}")
logger.info(f"  DB_PASSWORD: {'SET' if PASSWORD else 'MISSING'}")
logger.info(f"  DB_HOST: {HOST if HOST else 'MISSING'}")
logger.info(f"  DB_PORT: {PORT}")
logger.info(f"  DB_NAME: {DBNAME}")


def log_interaction(event_type: str, details: str = None):
    """
    Log an interaction event to the Supabase PostgreSQL database.

    This function is called by the server when significant events occur, such as
    controller connections and disconnections. It provides analytics data for
    understanding demo usage patterns.

    Args:
        event_type (str): Type of event (e.g., 'connect', 'disconnect', 'navigate')
        details (str, optional): Additional context about the event
            Examples:
                - 'Controller connected from 192.168.1.1 (SID: abc123)'
                - 'Demo switched to logic-gates'

    Returns:
        bool: True if logging succeeded, False if it failed or credentials missing

    Note:
        If database credentials are not configured, this function logs a warning
        and returns False, but the server continues operating normally.
    """
    # Validate that all required credentials are present
    if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
        missing = []
        if not USER: missing.append("DB_USER")
        if not PASSWORD: missing.append("DB_PASSWORD")
        if not HOST: missing.append("DB_HOST")
        if not PORT: missing.append("DB_PORT")
        if not DBNAME: missing.append("DB_NAME")
        logger.warning(f"Database credentials not configured. Missing: {', '.join(missing)}. Skipping log.")
        return False

    try:
        # Connect to database using context manager for automatic cleanup
        with psycopg.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        ) as conn:
            with conn.cursor() as cursor:
                # Insert interaction log with current timestamp
                cursor.execute(
                    """
                    INSERT INTO interaction_logs (event_type, timestamp, details)
                    VALUES (%s, %s, %s)
                    """,
                    (event_type, datetime.now(), details)
                )
                conn.commit()

        logger.info(f"Logged interaction: {event_type}")
        return True

    except Exception as e:
        logger.error(f"Failed to log interaction: {e}")
        return False


def get_interaction_logs(limit: int = 100):
    """
    Retrieve interaction logs from the Supabase PostgreSQL database.

    This function is called by the /api/interaction-log endpoint to fetch
    recent user interaction data for analytics and debugging purposes.

    Args:
        limit (int): Maximum number of logs to retrieve (default: 100)

    Returns:
        list: List of dictionaries, each containing:
            - id (int): Log entry ID
            - event_type (str): Type of event
            - timestamp (str): ISO format timestamp
            - details (str): Additional event details

        Returns empty list if database is not configured or query fails.

    Example return value:
        [
            {
                "id": 123,
                "event_type": "connect",
                "timestamp": "2025-12-06T10:30:00",
                "details": "Controller connected from 192.168.1.1"
            }
        ]
    """
    if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
        logger.warning("Database credentials not configured. Returning empty logs.")
        return []

    try:
        with psycopg.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        ) as conn:
            # Use dict_row factory to get results as dictionaries instead of tuples
            with conn.cursor(row_factory=dict_row) as cursor:
                # Retrieve logs ordered by timestamp (most recent first)
                cursor.execute(
                    """
                    SELECT id, event_type, timestamp, details
                    FROM interaction_logs
                    ORDER BY timestamp DESC
                    LIMIT %s
                    """,
                    (limit,)
                )

                results = cursor.fetchall()

        # Convert timestamp to ISO format string for JSON serialization
        logs = []
        for row in results:
            log_entry = dict(row)
            log_entry['timestamp'] = log_entry['timestamp'].isoformat()
            logs.append(log_entry)

        return logs

    except Exception as e:
        logger.error(f"Failed to retrieve interaction logs: {e}")
        return []


def clear_old_logs(days: int = 30):
    """
    Delete interaction logs older than a specified number of days.

    This function is useful for database maintenance and GDPR compliance,
    allowing you to automatically purge old analytics data.

    Args:
        days (int): Delete logs older than this many days (default: 30)

    Returns:
        bool: True if deletion succeeded, False if it failed or credentials missing

    Example:
        # Delete logs older than 60 days
        clear_old_logs(days=60)

    Note:
        The number of deleted rows is logged to the server logs for auditing.
    """
    if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
        logger.warning("Database credentials not configured. Cannot clear logs.")
        return False

    try:
        with psycopg.connect(
            user=USER,
            password=PASSWORD,
            host=HOST,
            port=PORT,
            dbname=DBNAME
        ) as conn:
            with conn.cursor() as cursor:
                # Calculate cutoff date (e.g., 30 days ago from now)
                cutoff_date = datetime.now() - timedelta(days=days)

                # Delete all logs with timestamp before the cutoff date
                cursor.execute(
                    """
                    DELETE FROM interaction_logs
                    WHERE timestamp < %s
                    """,
                    (cutoff_date,)
                )

                # Get count of deleted rows for logging
                deleted_count = cursor.rowcount
                conn.commit()

        logger.info(f"Cleared {deleted_count} logs older than {days} days")
        return True

    except Exception as e:
        logger.error(f"Failed to clear old logs: {e}")
        return False