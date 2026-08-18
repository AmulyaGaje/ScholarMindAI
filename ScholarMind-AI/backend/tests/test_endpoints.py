"""
ScholarMind AI – Integration Test Suite for All Core REST Endpoints
===================================================================
Tests GET /auth/me, GET /stats, GET /projects, and GET /papers.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_all_core_endpoints_200_ok():
    """Verify GET /auth/me, GET /stats, GET /projects, and GET /papers all return HTTP 200."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
        test_email = f"endpoint_user_{unique_suffix}@scholarmind.ai"
        test_username = f"uname_{unique_suffix}"
        test_password = "Password@123"

        # 1. Register
        reg_resp = await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "Endpoint Tester",
                "username": test_username,
                "email": test_email,
                "password": test_password,
            },
        )
        assert reg_resp.status_code == 201

        # 2. Login
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={
                "email": test_email,
                "password": test_password,
            },
        )
        assert login_resp.status_code == 200
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 3. GET /api/v1/auth/me -> HTTP 200
        me_resp = await client.get("/api/v1/auth/me", headers=headers)
        assert me_resp.status_code == 200
        assert me_resp.json()["email"] == test_email

        # 4. GET /api/v1/stats -> HTTP 200
        stats_resp = await client.get("/api/v1/stats", headers=headers)
        assert stats_resp.status_code == 200
        stats_json = stats_resp.json()
        assert "total_papers" in stats_json
        assert "active_projects" in stats_json
        assert "storage_used" in stats_json

        # 5. GET /api/v1/projects -> HTTP 200
        projects_resp = await client.get("/api/v1/projects", headers=headers)
        assert projects_resp.status_code == 200
        assert isinstance(projects_resp.json(), list)

        # 6. GET /api/v1/papers -> HTTP 200
        papers_resp = await client.get("/api/v1/papers", headers=headers)
        assert papers_resp.status_code == 200
        papers_json = papers_resp.json()
        assert "items" in papers_json
        assert "total" in papers_json
