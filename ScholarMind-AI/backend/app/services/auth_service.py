"""
ScholarMind AI – Auth Service Layer
====================================
Encapsulates all database queries and transaction handling for user management,
including local registration/login and Google OAuth identity provisioning.
"""

import uuid
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.user import User
from app.schemas.auth import UserCreate, UserUpdate
from app.core.security import get_password_hash

logger = logging.getLogger("scholarmind.auth_service")


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Finds a user by email address (case-insensitive check)."""
    try:
        result = await db.execute(select(User).where(User.email == email.strip().lower()))
        return result.scalars().first()
    except SQLAlchemyError as e:
        logger.error(f"Error querying user by email {email}: {e}")
        return None


async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Finds a user by username (case-insensitive check)."""
    try:
        result = await db.execute(select(User).where(User.username == username.strip().lower()))
        return result.scalars().first()
    except SQLAlchemyError as e:
        logger.error(f"Error querying user by username {username}: {e}")
        return None


async def get_user_by_google_id(db: AsyncSession, google_id: str) -> Optional[User]:
    """Finds a user by Google OAuth ID."""
    try:
        result = await db.execute(select(User).where(User.google_id == google_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        logger.error(f"Error querying user by google_id {google_id}: {e}")
        return None


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Finds a user by primary key UUID."""
    try:
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalars().first()
    except SQLAlchemyError as e:
        logger.error(f"Error querying user by ID {user_id}: {e}")
        return None


async def create_user(db: AsyncSession, user_in: UserCreate) -> User:
    """Hashes password and persists a new User entity to PostgreSQL."""
    hashed_pwd = get_password_hash(user_in.password)

    db_user = User(
        email=user_in.email.strip().lower(),
        username=user_in.username.strip().lower(),
        full_name=user_in.full_name.strip(),
        hashed_password=hashed_pwd,
        provider="local",
        is_active=True,
    )

    try:
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user
    except IntegrityError as ie:
        await db.rollback()
        logger.error(f"Integrity error creating user {user_in.email}: {ie}")
        raise ValueError("User with this email or username already exists.")
    except Exception as e:
        await db.rollback()
        logger.error(f"Unexpected error creating user {user_in.email}: {e}")
        raise RuntimeError("Failed to persist user to database.")


async def create_or_get_google_user(
    db: AsyncSession, google_id: str, email: str, full_name: str, avatar_url: Optional[str] = None
) -> User:
    """Finds existing user by google_id or email, or provisions a new user record for Google OAuth."""
    # 1. Search by google_id
    user = await get_user_by_google_id(db, google_id)
    if user:
        return user

    # 2. Search by email
    user = await get_user_by_email(db, email)
    if user:
        user.google_id = google_id
        if not user.avatar_url and avatar_url:
            user.avatar_url = avatar_url
        await db.commit()
        await db.refresh(user)
        return user

    # 3. Create new user
    base_username = email.split("@")[0].replace(".", "_")
    unique_username = f"{base_username}_{uuid.uuid4().hex[:6]}"

    new_user = User(
        email=email.strip().lower(),
        username=unique_username,
        full_name=full_name.strip(),
        google_id=google_id,
        provider="google",
        avatar_url=avatar_url,
        is_active=True,
        is_verified=True,
    )

    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to create Google OAuth user {email}: {e}")
        raise RuntimeError("Failed to create Google user account.")


async def update_user(db: AsyncSession, user_id: uuid.UUID, user_update: UserUpdate) -> Optional[User]:
    """Updates user profile attributes."""
    user = await get_user_by_id(db, user_id)
    if not user:
        return None

    update_data = user_update.model_dump(exclude_unset=True)
    if "email" in update_data and update_data["email"]:
        update_data["email"] = update_data["email"].strip().lower()
    if "full_name" in update_data and update_data["full_name"]:
        update_data["full_name"] = update_data["full_name"].strip()

    for field, value in update_data.items():
        setattr(user, field, value)

    try:
        await db.commit()
        await db.refresh(user)
        return user
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user {user_id}: {e}")
        raise RuntimeError("Failed to update user profile.")
