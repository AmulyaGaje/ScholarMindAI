"""
ScholarMind AI – Database Configuration
=========================================
Sets up the async SQLAlchemy engine, session factory, and declarative base.

Key design decisions:
  - Uses asyncpg driver for async PostgreSQL support
  - Session-per-request pattern via FastAPI dependency injection
  - expire_on_commit=False prevents lazy-loading issues after commit
  - Echo is disabled in production; enable for SQL debugging
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from typing import AsyncGenerator

from app.core.config import settings


def _get_async_database_url(url: str) -> str:
    """
    Converts a standard PostgreSQL URL to asyncpg format.
    Example:
        postgresql://user:pass@host/db
        → postgresql+asyncpg://user:pass@host/db
    """
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+asyncpg://", 1)
    return url  # Already in async format


# ── Async Engine ──────────────────────────────────────────────────────────────
engine: AsyncEngine = create_async_engine(
    _get_async_database_url(settings.DATABASE_URL),
    echo=settings.DEBUG,           # Log SQL queries in development
    pool_pre_ping=True,            # Verify connections before use
    pool_size=10,                  # Max connections in pool
    max_overflow=20,               # Extra connections allowed under load
    pool_recycle=3600,             # Recycle connections every 1 hour
)

# ── Session Factory ────────────────────────────────────────────────────────────
SessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,        # Prevent DetachedInstanceError
    autocommit=False,
    autoflush=False,
)


# ── Declarative Base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models.
    All models must inherit from this class.
    """
    pass


# ── FastAPI Dependency ────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an async database session.
    Ensures session is closed after each request, even on errors.

    Usage in router:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with SessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
