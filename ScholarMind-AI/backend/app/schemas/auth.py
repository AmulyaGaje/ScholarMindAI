"""
ScholarMind AI – Authentication Schemas (Pydantic v2)
=====================================================
Defines all request/response schemas for authentication endpoints.
Uses Pydantic v2 with model_config for ORM compatibility.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime
import uuid
import re


# =============================================================================
# REQUEST SCHEMAS
# =============================================================================

class UserCreate(BaseModel):
    """Schema for user registration payload."""

    email: EmailStr = Field(
        ...,
        description="User's email address (must be unique)",
        json_schema_extra={"example": "researcher@university.edu"},
    )
    username: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique username (3-50 chars, alphanumeric + underscores)",
        json_schema_extra={"example": "john_doe"},
    )
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="User's full name",
        json_schema_extra={"example": "John Doe"},
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Password (8 to 128 chars, must contain uppercase, lowercase, and digit)",
        json_schema_extra={"example": "SecurePass@123"},
    )

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Ensure username contains only alphanumeric characters and underscores."""
        v_clean = v.strip()
        if not re.match(r"^[a-zA-Z0-9_]+$", v_clean):
            raise ValueError("Username may only contain letters, numbers, and underscores.")
        return v_clean.lower()

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Enforce password strength requirements (min 8, max 128, upper, lower, digit)."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if len(v) > 128:
            raise ValueError("Password must not exceed 128 characters.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        """Strip extra whitespace from full name."""
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Full name cannot be empty.")
        return cleaned


class GoogleAuthRequest(BaseModel):
    """Schema for Google Sign-In ID Token payload."""

    id_token: str = Field(..., description="Google JWT ID Token from Google Identity Services")


class UserLogin(BaseModel):
    """Schema for user login (JSON body)."""

    email: EmailStr = Field(
        ...,
        description="Registered email address",
        json_schema_extra={"example": "researcher@university.edu"},
    )
    password: str = Field(
        ...,
        min_length=1,
        description="Account password",
        json_schema_extra={"example": "SecurePass@123"},
    )


class UserUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)."""

    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = Field(None, max_length=1000)
    institution: Optional[str] = Field(None, max_length=255)


# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================

class UserResponse(BaseModel):
    """Public user profile returned to clients."""

    id: uuid.UUID
    email: str
    username: str
    full_name: str
    provider: str = "local"
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    institution: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    """JWT token response returned after successful login."""

    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="Authenticated user's profile")


class TokenData(BaseModel):
    """Internal schema for decoded JWT payload."""

    user_id: Optional[str] = None
