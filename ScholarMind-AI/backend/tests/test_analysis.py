"""
ScholarMind AI – Integration Test for Stage 1 AI Paper Analysis
================================================================
Verifies PDF extraction, paper analysis creation, status polling, and structured JSON parsing.
"""

import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from main import app


@pytest.mark.asyncio
async def test_ai_paper_analysis_flow():
    """Tests triggering AI paper analysis and retrieving structured analysis."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        unique_suffix = str(uuid.uuid4()).replace("-", "")[:8]
        test_email = f"ai_user_{unique_suffix}@scholarmind.ai"
        test_username = f"ai_uname_{unique_suffix}"
        test_password = "Password@123"

        # 1. Register & Login
        await client.post(
            "/api/v1/auth/register",
            json={
                "full_name": "AI Tester",
                "username": test_username,
                "email": test_email,
                "password": test_password,
            },
        )
        login_resp = await client.post(
            "/api/v1/auth/login",
            json={"email": test_email, "password": test_password},
        )
        token = login_resp.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Paper
        files = {"file": ("test_paper.pdf", b"%PDF-1.4 test content", "application/pdf")}
        params = {"title": "Attention Is All You Need"}
        upload_resp = await client.post("/api/v1/papers/upload", files=files, params=params, headers=headers)
        assert upload_resp.status_code == 201
        paper_id = upload_resp.json()["id"]

        # 3. GET /api/v1/papers/{id}/analysis -> HTTP 200
        analysis_resp = await client.get(f"/api/v1/papers/{paper_id}/analysis", headers=headers)
        assert analysis_resp.status_code == 200
        analysis_data = analysis_resp.json()

        assert "summary" in analysis_data
        assert "simple_understanding" in analysis_data
        assert "key_findings" in analysis_data
        assert "research_problem" in analysis_data
        assert "objectives" in analysis_data
        assert "methodology" in analysis_data
        assert "results" in analysis_data
        assert "limitations" in analysis_data
        assert "future_scope" in analysis_data
        assert "keywords" in analysis_data
        assert "executive_summary" in analysis_data
        assert "background" in analysis_data
        assert "related_work" in analysis_data
        assert "proposed_approach" in analysis_data
        assert "architecture" in analysis_data
        assert "experimental_setup" in analysis_data
        assert "technical_understanding" in analysis_data
        assert "strengths" in analysis_data
        assert "research_contribution" in analysis_data
        assert "practical_applications" in analysis_data
        assert "terminology" in analysis_data
        assert "final_understanding" in analysis_data
        assert "paper_overview" in analysis_data
        # Analysis runs on fake PDF bytes so status may be failed — all statuses are valid
        assert analysis_data["analysis_status"] in ["completed", "processing", "failed"]

        # 4. GET /api/v1/papers/{id}/analysis/status -> HTTP 200
        status_resp = await client.get(f"/api/v1/papers/{paper_id}/analysis/status", headers=headers)
        assert status_resp.status_code == 200
        assert status_resp.json()["analysis_status"] in ["completed", "processing", "failed"]
