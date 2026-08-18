"""
ScholarMind AI – Integration Test Suite for Authentication Flow
================================================================
Tests password hashing, JWT generation, and full HTTP authentication lifecycle.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from main import app
from app.core.security import get_password_hash, verify_password, create_access_token, verify_token


def test_password_hashing_and_verification():
    """Verify password hashing with short and long (>72 bytes) passwords."""
    short_pass = "SecurePass@123"
    hashed = get_password_hash(short_pass)
    assert hashed != short_pass
    assert verify_password(short_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

    # Test long password (> 72 bytes)
    long_pass = "A" * 100 + "Secure@123"
    long_hashed = get_password_hash(long_pass)
    assert verify_password(long_pass, long_hashed) is True


def test_jwt_generation_and_verification():
    """Verify JWT token creation and decoding."""
    user_id = "test-uuid-12345"
    token = create_access_token(data={"sub": user_id})
    assert token is not None

    payload = verify_token(token)
    assert payload is not None
    assert payload.get("sub") == user_id


@pytest.mark.asyncio
async def test_auth_endpoints_flow():
    """Test full HTTP endpoint lifecycle (Register -> Duplicate -> Login -> Me)."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
        test_email = f"user_{unique_suffix}@scholarmind.ai"
        test_username = f"uname_{unique_suffix}"
        test_password = "Password@123"

        # 1. Register
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test Researcher",
                "username": test_username,
                "email": test_email,
                "password": test_password,
            },
        )
        assert reg_resp.status_code == 201
        reg_json = reg_resp.json()
        assert reg_json["email"] == test_email
        assert reg_json["username"] == test_username

        # 2. Duplicate Registration Check
        dup_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Test Researcher Duplicate",
                "username": test_username,
                "email": test_email,
                "password": test_password,
            },
        )
        assert dup_resp.status_code == 409

        # 3. Login Success
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": test_email,
                "password": test_password,
            },
        )
        assert login_resp.status_code == 200
        login_json = login_resp.json()
        assert "access_token" in login_json
        token = login_json["access_token"]

        # 4. Login Failure
        fail_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": test_email,
                "password": "WrongPassword123",
            },
        )
        assert fail_resp.status_code == 401

        # 5. Protected Endpoint /me
        me_resp = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_email
