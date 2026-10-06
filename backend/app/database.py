"""
Database connection setup using SQLAlchemy.
Uses SQLite by default for easy local development (no separate DB server needed).
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# SQLite database file lives inside the backend folder
DATABASE_URL = "sqlite:///./shopwave.db"

# connect_args is SQLite-specific: allows multiple threads to share a connection
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

# Each request gets its own session; auto-commit is off so we control transactions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """
    FastAPI dependency that yields a database session per request.
    Always closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
