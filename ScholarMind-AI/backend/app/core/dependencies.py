"""
ScholarMind AI – Core FastApi Dependencies
============================================
Provides authentication injection and query parameter dependencies.
Handles UUID type conversions for database lookup.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
import uuid

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_token
from app.services.auth_service import get_user_by_id
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Decodes JWT bearer token, validates claim sub UUID, and returns User instance."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
        
    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception
        
    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user = await get_user_by_id(db, user_id=user_uuid)
    if user is None:
        raise credentials_exception
        
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Verifies that authenticated user account is active."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account.",
        )
    return current_user


class PaginationParams:
    """Pagination query params helper."""
    def __init__(self, page: int = 1, limit: int = 10):
        self.page = max(1, page)
        self.limit = min(50, max(1, limit))
        self.skip = (self.page - 1) * self.limit
