from unittest.mock import patch
from openai import OpenAIError
from backend.app.config import settings


def test_health_endpoint(client):
    """Test health check reports database connectivity."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "database_type" in data
    assert "timestamp" in data


def test_root_endpoint(client):
    """Test root endpoint information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "docs_url" in data


def test_create_agent(client):
    """Test registering a new agent with name and description."""
    payload = {
        "name": "Customer Support Sentinel",
        "description": "Monitors customer chat queue and responds to tickets."
    }
    response = client.post("/agents", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["name"] == payload["name"]
    assert data["description"] == payload["description"]
    assert data["status"] == "active"
    assert "created_at" in data
    assert "updated_at" in data


def test_create_agent_validation(client):
    """Test validation errors for empty or whitespace-only name."""
    response = client.post("/agents", json={"name": "   ", "description": "Empty name"})
    assert response.status_code == 422

    response_missing = client.post("/agents", json={"description": "Missing name"})
    assert response_missing.status_code == 422


def test_list_and_search_agents(client):
    """Test retrieving agents and searching by keyword."""
    client.post("/agents", json={"name": "Alpha Crawler", "description": "Scrapes news"})
    client.post("/agents", json={"name": "Beta Transcriber", "description": "Audio processor"})

    # List all
    res = client.get("/agents")
    assert res.status_code == 200
    agents = res.json()
    assert len(agents) >= 2

    # Search by name
    res_search = client.get("/agents?search=Alpha")
    assert res_search.status_code == 200
    results = res_search.json()
    assert any(a["name"] == "Alpha Crawler" for a in results)
    assert not any(a["name"] == "Beta Transcriber" for a in results)

    # Search by description
    res_desc = client.get("/agents?search=audio")
    assert res_desc.status_code == 200
    results_desc = res_desc.json()
    assert any(a["name"] == "Beta Transcriber" for a in results_desc)


def test_filter_by_status(client):
    """Test filtering agents by status."""
    res1 = client.post("/agents", json={"name": "Agent 1", "description": "Active agent"})
    id1 = res1.json()["id"]

    res2 = client.post("/agents", json={"name": "Agent 2", "description": "Will be inactive"})
    id2 = res2.json()["id"]
    client.patch(f"/agents/{id2}/status", json={"status": "inactive"})

    # Filter active
    res_active = client.get("/agents?status=active")
    assert res_active.status_code == 200
    active_ids = [a["id"] for a in res_active.json()]
    assert id1 in active_ids
    assert id2 not in active_ids

    # Filter inactive
    res_inactive = client.get("/agents?status=inactive")
    assert res_inactive.status_code == 200
    inactive_ids = [a["id"] for a in res_inactive.json()]
    assert id2 in inactive_ids
    assert id1 not in inactive_ids


def test_filter_invalid_status(client):
    """Test that querying with an invalid status returns 400."""
    response = client.get("/agents?status=unknown_status")
    assert response.status_code == 400


def test_get_agent_details_and_not_found(client):
    """Test retrieving single agent details and 404 for non-existent agent."""
    res = client.post("/agents", json={"name": "Inspector", "description": "Quality check"})
    agent_id = res.json()["id"]

    # Existing agent
    detail_res = client.get(f"/agents/{agent_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["name"] == "Inspector"
    assert len(detail["activities"]) >= 1

    # Non-existent agent
    missing_res = client.get("/agents/999999")
    assert missing_res.status_code == 404


def test_update_agent_status(client):
    """Test updating agent status and validating invalid status values."""
    res = client.post("/agents", json={"name": "Pipeline Bot", "description": "ETL"})
    agent_id = res.json()["id"]

    # Update to error
    patch_res = client.patch(f"/agents/{agent_id}/status", json={"status": "error"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "error"

    # Reject invalid status
    bad_patch = client.patch(f"/agents/{agent_id}/status", json={"status": "invalid_status"})
    assert bad_patch.status_code == 422

    # Verify activity was logged
    act_res = client.get(f"/agents/{agent_id}/activity")
    assert act_res.status_code == 200
    activities = act_res.json()
    assert any("error" in a["description"] for a in activities)


def test_delete_agent(client):
    """Test deleting an agent and verifying cascading activity cleanup."""
    res = client.post("/agents", json={"name": "Temporary Worker", "description": "Short-lived"})
    agent_id = res.json()["id"]

    del_res = client.delete(f"/agents/{agent_id}")
    assert del_res.status_code == 200
    assert del_res.json()["id"] == agent_id

    # Should be 404 now
    assert client.get(f"/agents/{agent_id}").status_code == 404

    # Deleting again should return 404
    assert client.delete(f"/agents/{agent_id}").status_code == 404


def test_dashboard_stats(client):
    """Test dashboard stats returns counts and recent activities."""
    res_stats = client.get("/agents/stats")
    assert res_stats.status_code == 200
    data = res_stats.json()
    assert "total" in data
    assert "active" in data
    assert "inactive" in data
    assert "error" in data
    assert "recent_activities" in data


def test_ai_summary_fallback_mode(client):
    """Test AI summary returns reliable fallback with source='fallback' when OpenAI key is cleared."""
    res = client.post("/agents", json={"name": "Summarizer Target", "description": "Health check"})
    agent_id = res.json()["id"]

    with patch.object(settings, "OPENAI_API_KEY", ""):
        summary_res = client.get(f"/agents/{agent_id}/summary")
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["agent_id"] == agent_id
        assert summary_data["source"] == "fallback"
        assert summary_data["model"] == "rule-based-fallback"
        assert len(summary_data["summary"]) > 0
        assert len(summary_data["suggested_action"]) > 0


def test_ai_summary_openai_error_handling(client):
    """Test AI summary gracefully falls back if OpenAI throws an API exception."""
    res = client.post("/agents", json={"name": "Resilience Agent", "description": "Fault tolerance test"})
    agent_id = res.json()["id"]

    with patch("backend.app.services.ai_service.OpenAI") as mock_openai:
        mock_client = mock_openai.return_value
        mock_client.chat.completions.create.side_effect = OpenAIError("Rate limit / Quota exceeded")

        summary_res = client.get(f"/agents/{agent_id}/summary")
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["source"] == "fallback"
        assert "Resilience Agent" in summary_data["summary"]
