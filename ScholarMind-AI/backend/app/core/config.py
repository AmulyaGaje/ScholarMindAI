"""
ScholarMind AI – Application Configuration
==========================================
Uses pydantic-settings to load configuration from environment variables or .env file.
All sensitive values must be provided via environment variables in production.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """
    Central settings class for ScholarMind AI backend.
    Values are loaded from environment variables (case-sensitive).
    Falls back to .env file if present.
    """

    # ── Application ──────────────────────────────────────────────────────────
    APP_NAME: str = "ScholarMind AI"
    APP_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ── Security ─────────────────────────────────────────────────────────────
    SECRET_KEY: str = "dev_secret_key_change_this_in_production_must_be_32_chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://scholarmind_user:password@localhost:5432/scholarmind_db"

    # ── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # ── File Upload ───────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_MIME_TYPES: List[str] = ["application/pdf"]

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── AI Analysis ───────────────────────────────────────────────────────────
    LLM_PROVIDER: str = "gemini"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "gemini-1.5-flash"


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache()
def get_settings() -> Settings:
    """
    Returns cached Settings instance.
    Using lru_cache ensures the .env file is only read once.
    """
    return Settings()


# Global settings instance (importable anywhere)
settings = get_settings()
