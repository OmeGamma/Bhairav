import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_video_analyze():
    response = client.post("/api/v1/ai/video/analyze", json={"camera_id": "TEST-CAM"})
    assert response.status_code == 200
    data = response.json()
    assert data["camera_id"] == "TEST-CAM"
    assert "detections" in data
    assert "event" in data

def test_document_analyze():
    response = client.post("/api/v1/ai/document/analyze", json={"document_id": "TEST-DOC"})
    assert response.status_code == 200
    data = response.json()
    assert data["document_id"] == "TEST-DOC"
    assert "extracted_text" in data

def test_identity_analyze():
    response = client.post("/api/v1/ai/identity/analyze", json={"verification_id": "TEST-ID"})
    assert response.status_code == 200
    data = response.json()
    assert data["verification_id"] == "TEST-ID"
    assert data["status"] == "REVIEW_REQUIRED"

def test_network_analyze():
    response = client.post("/api/v1/ai/network/analyze", json={"entity_id": "TEST-ENTITY"})
    assert response.status_code == 200
    data = response.json()
    assert data["entity_id"] == "TEST-ENTITY"
    assert len(data["indicators"]) > 0

def test_welfare_analyze():
    response = client.post("/api/v1/ai/welfare/analyze", json={"personnel_id": "TEST-PERS"})
    assert response.status_code == 200
    data = response.json()
    assert data["personnel_id"] == "TEST-PERS"
    assert data["status"] == "SUPPORT RECOMMENDED"

def test_assistant_chat():
    response = client.post("/api/v1/ai/chat", json={"query": "Test query"})
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "key_information" in data

def test_voice_synthesize():
    response = client.post("/api/v1/ai/voice/synthesize", json={"text": "Hello"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
