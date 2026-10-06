"""
FastAPI application entry point.

Registers routers, configures CORS so the React dev server can talk to the API,
creates all database tables on startup, and serves a /health endpoint.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routers import categories, products

# Import models so SQLAlchemy knows about them when creating tables
from app import models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup if they don't exist yet."""
    Base.metadata.create_all(bind=engine)
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads", exist_ok=True)
    yield
    # Nothing to clean up for SQLite


app = FastAPI(
    title="ShopWave API",
    description="E-Commerce Store and Order Management System — Week 5",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────────────
# Allow the Vite dev server (port 5173) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static files (uploaded images will be served from /uploads) ───────────
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(categories.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")


# ── Health check ──────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health():
    return {"status": "ok", "service": "ShopWave API", "version": "1.0.0"}


@app.get("/", tags=["System"])
def root():
    return {
        "message": "Welcome to ShopWave API",
        "docs": "/docs",
        "redoc": "/redoc",
    }
