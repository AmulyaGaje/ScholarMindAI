"""
ScholarMind AI – Security & Password Hashing Module
====================================================
Provides robust password hashing, verification, and JWT token management.
Designed for Python 3.13 and passlib/bcrypt compatibility. Handles long passwords
(>72 bytes) safely by pre-hashing using SHA-256 before passing to bcrypt.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import hashlib
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

# ── Initialize Passlib CryptContext ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"


def _prepare_password(password: str) -> str:
    """
    Bcrypt has a strict 72-byte maximum password length limit.
    If the password string exceeds 72 bytes when UTF-8 encoded, pre-hash it using SHA-256.
    This guarantees safe, fixed-length (64-char hex) input for bcrypt without throwing ValueError.
    """
    if not password:
        return password
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > 72:
        return hashlib.sha256(password_bytes).hexdigest()
    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a stored hash.
    Safely catches any hashing/passlib errors and returns False instead of throwing HTTP 500.
    """
    try:
        if not plain_password or not hashed_password:
            return False
        prepared = _prepare_password(plain_password)
        return pwd_context.verify(prepared, hashed_password)
    except Exception:
        # Prevent server crashes on invalid format / hash mismatches
        return False


def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password using bcrypt.
    Pre-hashes inputs over 72 bytes to prevent bcrypt ValueError exceptions.
    """
    if not password:
        raise ValueError("Password cannot be empty")
    prepared = _prepare_password(password)
    return pwd_context.hash(prepared)


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a JWT access token containing standard claims (sub, exp).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decodes and validates a JWT token string.
    Returns the payload dictionary if valid, or None if expired/invalid.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
