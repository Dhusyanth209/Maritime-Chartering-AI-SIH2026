import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_forecast_endpoint():
    res = client.get("/api/v1/forecast?route=gladstone_paradip")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "forecast" in data
    assert len(data["forecast"]["horizons"]) == 4

def test_port_dwell_status():
    res = client.get("/api/v1/port-dwell/status?port=paradip")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "port_status" in data
    assert data["port_status"]["port"] == "paradip"

def test_dispatch_optimization():
    payload = {
        "route": "gladstone_paradip",
        "cargo_mt": 160000.0,
        "arrival_window_days": 21,
        "target_inventory_days": 15,
        "current_stock_mt": 350000.0,
        "daily_plant_burn_mt": 24000.0
    }
    res = client.post("/api/v1/dispatch/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "evaluation" in data
    assert "comparison" in data["evaluation"]
    assert data["evaluation"]["economic_impact"]["net_savings_usd"] > 0

def test_audit_generation_and_verification():
    sample_decision = {
        "route": "gladstone_paradip",
        "optimal_horizon": "T+14",
        "speed_knots": 10.5,
        "savings_usd": 384000.0
    }
    # 1. Generate certificate
    gen_res = client.post("/api/v1/audit/generate", json={"decision_summary": sample_decision})
    assert gen_res.status_code == 200
    data = gen_res.json()
    assert data["status"] == "success"
    assert "signature_hash" in data
    assert data["certificate_id"].startswith("GOI-PADCE-")

    # 2. Verify certificate
    verify_res = client.post("/api/v1/audit/verify", json={
        "payload": data["audit_record"],
        "signature_hash": data["signature_hash"]
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["is_valid"] is True
