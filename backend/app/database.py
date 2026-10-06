"""
Database connection setup using SQLAlchemy.
Supports both PostgreSQL (e.g. Supabase, Render, Neon) and local SQLite.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

# Read DATABASE_URL from env (for production/Supabase) or fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shopwave.db")

# Fix Heroku/Supabase legacy "postgres://" URL prefix if present
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configure engine arguments based on DB driver
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Automatically reconnects if connection drops
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


def get_db():
    """Dependency that provides a transactional database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
