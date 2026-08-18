"""
ScholarMind AI – Authentication Router
========================================
Handles all authentication operations:
  - POST /auth/register → Create a new user account
  - POST /auth/login    → Authenticate and receive JWT
  - POST /auth/google   → Google OAuth Identity authentication
  - POST /auth/logout   → Client-side token invalidation
  - GET  /auth/me       → Fetch current user profile
  - PUT  /auth/me       → Update current user profile
"""

import os
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_active_user
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    GoogleAuthRequest,
    UserUpdate,
    Token,
    UserResponse,
)
from app.services import auth_service
from app.models.user import User

logger = logging.getLogger("scholarmind.routers.auth")
router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Register endpoint — validates uniqueness of email and username."""

    existing_email = await auth_service.get_user_by_email(db, email=user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    existing_username = await auth_service.get_user_by_username(db, username=user_in.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This username is already taken. Please choose another.",
        )

    try:
        new_user = await auth_service.create_user(db, user_in)
        return UserResponse.model_validate(new_user)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(ve))
    except Exception as exc:
        logger.error(f"Registration failed for {user_in.email}: {exc}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while creating your account.")


@router.post(
    "/login",
    response_model=Token,
    summary="Login and receive access token",
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """Login with JSON body (email + password)."""

    user: Optional[User] = await auth_service.get_user_by_email(db, email=credentials.email)

    if not user or not user.hashed_password or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/google",
    response_model=Token,
    summary="Google OAuth Sign-In",
)
async def google_auth(
    payload: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
) -> Token:
    """
    Authenticates user using Google ID Token via Google Identity Services token info endpoint.
    Creates or updates the user profile in PostgreSQL and returns ScholarMind JWT.
    """
    google_token = payload.id_token.strip()

    # Validate Google ID Token with Google API tokeninfo endpoint
    url = f"https://oauth2.googleapis.com/tokeninfo?id_token={google_token}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.get(url)
        if res.status_code != 200:
            logger.error(f"Google token validation failed: {res.text}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Google Token.")

        google_user_data = res.json()

    google_id = google_user_data.get("sub")
    email = google_user_data.get("email")
    full_name = google_user_data.get("name") or google_user_data.get("given_name") or email.split("@")[0]
    avatar_url = google_user_data.get("picture")

    if not google_id or not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incomplete Google user profile.")

    # Create or retrieve user record
    user = await auth_service.create_or_get_google_user(
        db, google_id=google_id, email=email, full_name=full_name, avatar_url=avatar_url
    )

    access_token = create_access_token(data={"sub": str(user.id)})

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", summary="Logout current user")
async def logout() -> dict:
    """Stateless JWT logout endpoint."""
    return {"success": True, "message": "You have been logged out successfully."}


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Returns the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse, summary="Update current user profile")
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Update authenticated user's profile."""

    if user_update.email and user_update.email.strip().lower() != current_user.email.lower():
        existing = await auth_service.get_user_by_email(db, email=user_update.email)
        if existing and str(existing.id) != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email address is already in use by another account.",
            )

    updated_user = await auth_service.update_user(db, current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    return UserResponse.model_validate(updated_user)
