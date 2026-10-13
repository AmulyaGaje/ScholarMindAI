"""
ScholarMind AI – FastAPI Application Entry Point
=================================================
This is the main application file that:
  - Creates the FastAPI app instance
  - Registers all routers under /api/v1
  - Configures CORS, middleware, and exception handlers
  - Handles application lifespan (startup/shutdown)

Run with:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000
"""

import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, projects, papers, history, search, bookmarks, stats, analysis, rag
from app.middleware.logging_middleware import LoggingMiddleware

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("scholarmind.main")


# ── Lifespan Context Manager ──────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handles startup and shutdown events cleanly.
    Creates upload directory and DB tables on startup.
    """
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION} [{settings.APP_ENV}]")

    # Create upload directory if missing
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info(f"📁 Upload directory ready: {settings.UPLOAD_DIR}")

    # Create DB tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables initialized")

    yield

    # Shutdown
    logger.info("🛑 ScholarMind AI shutting down...")
    await engine.dispose()
    logger.info("✅ Database connections closed")


# ── FastAPI Application ────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="Intelligent Research Paper Analysis, Knowledge Discovery, and Academic Recommendation Platform",
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)


# ── Middleware Setup ───────────────────────────────────────────────────────────
# CORS Middleware
origins = settings.ALLOWED_ORIGINS
if isinstance(origins, str):
    import json
    try:
        origins = json.loads(origins)
    except Exception:
        origins = [origins]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Request Logging Middleware
app.add_middleware(LoggingMiddleware)


# ── Exception Handlers ────────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean JSON response for validation errors."""
    logger.warning(f"Validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Request validation failed",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch-all handler for unexpected exceptions."""
    logger.exception(f"Unhandled exception on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "error": str(exc) if settings.DEBUG else "An unexpected error occurred",
        },
    )


# ── Router Registration ────────────────────────────────────────────────────────
PREFIX = settings.API_V1_STR

app.include_router(auth.router,       prefix=f"{PREFIX}/auth",      tags=["🔐 Authentication"])
app.include_router(projects.router,   prefix=f"{PREFIX}/projects",  tags=["📁 Projects"])
app.include_router(papers.router,     prefix=f"{PREFIX}/papers",    tags=["📄 Papers"])
app.include_router(analysis.router,   prefix=f"{PREFIX}/papers",    tags=["🤖 Stage 1 AI Analysis"])
app.include_router(rag.router,        prefix=f"{PREFIX}/papers",    tags=["🧠 RAG & AI Q&A"])
app.include_router(history.router,    prefix=f"{PREFIX}/history",   tags=["🕐 History"])
app.include_router(search.router,     prefix=f"{PREFIX}/search",    tags=["🔍 Search"])
app.include_router(bookmarks.router,  prefix=f"{PREFIX}/bookmarks", tags=["🔖 Bookmarks"])
app.include_router(stats.router,      prefix=f"{PREFIX}/stats",     tags=["📊 Stats"])


# ── Health & Root Endpoints ────────────────────────────────────────────────────
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint — API welcome message."""
    return {
        "success": True,
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": f"{PREFIX}/docs",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker/load balancer."""
    return {
        "success": True,
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }
