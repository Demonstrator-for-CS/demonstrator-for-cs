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
PORT = os.getenv("DB_PORT", "6543")
DBNAME = os.getenv("DB_NAME", "postgres")


def log_interaction(event_type: str, details: str = None):
    """
    Log an interaction event to Supabase PostgreSQL database.

    Args:
        event_type: Type of event (e.g., 'connect', 'disconnect')
        details: Optional additional details about the event
    """
    if not all([USER, PASSWORD, HOST, PORT, DBNAME]):
        logger.warning("Database credentials not configured. Skipping log.")
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
                # Insert interaction log
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
    Retrieve interaction logs from Supabase PostgreSQL database.

    Args:
        limit: Maximum number of logs to retrieve (default: 100)

    Returns:
        List of interaction log entries, or empty list if database not configured
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
            # Use dict_row to get results as dictionaries
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
    Delete logs older than specified number of days.

    Args:
        days: Delete logs older than this many days (default: 30)
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
                # Calculate cutoff date
                cutoff_date = datetime.now() - timedelta(days=days)

                # Delete old logs
                cursor.execute(
                    """
                    DELETE FROM interaction_logs
                    WHERE timestamp < %s
                    """,
                    (cutoff_date,)
                )

                deleted_count = cursor.rowcount
                conn.commit()

        logger.info(f"Cleared {deleted_count} logs older than {days} days")
        return True

    except Exception as e:
        logger.error(f"Failed to clear old logs: {e}")
        return False