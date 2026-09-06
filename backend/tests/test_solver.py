import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.services.iterative_projection import IterativeProjectionSolver, FleetOptimizationInput, iterative_projection_engine
from app.services.goncalves_solver import GoncalvesHJBSolver
from app.services.data_generator import FleetDataGenerator
from app.main import app

client = TestClient(app)

def test_iterative_projection_engine_direct():
    payload = FleetOptimizationInput(
        distances_nm=[5600.0, 5450.0, 2900.0],
        scheduled_berth_times_hr=[52.8, 52.8, 48.0],
        current_berth_delay_hr=12.0,
        stockyard_buffer_days=35.0
    )
    # Warm-up run for JIT / initial array allocations
    _ = iterative_projection_engine(payload)
    res = iterative_projection_engine(payload)

    assert "optimal_speeds_knots" in res
    assert len(res["optimal_speeds_knots"]) == 3
    assert res["total_fuel_saved_mt"] > 0
    assert res["total_demurrage_avoided_usd"] > 0
    assert res["solver_latency_ms"] < 15.0

    # Test direct API endpoint
    endpoint_res = client.post("/api/v1/iterative-projection", json=payload.model_dump())
    assert endpoint_res.status_code == 200
    data = endpoint_res.json()
    assert "optimal_speeds_knots" in data

def test_ip_solver_convergence_and_tie_breaking():
    solver = IterativeProjectionSolver(n_scenarios=500, max_iterations=50)
    distances = np.array([5600.0, 5450.0, 2900.0])
    speeds = np.array([14.5, 14.5, 14.5])

    res = solver.solve(distances, speeds)

    assert "v_ip_knots" in res
    assert len(res["v_ip_knots"]) == 3
    assert np.all(res["v_ip_knots"] >= 10.0)
    assert np.all(res["v_ip_knots"] <= 25.0)

    # Verify tie-breaking subdifferentials sum to 1.0 (probability distribution)
    theta = np.array(res["theta_subdifferentials"])
    assert np.isclose(np.sum(theta), 1.0, atol=1e-4)
    assert res["iterations_completed"] == 50
    assert res["scenarios_evaluated"] == 500

def test_solver_latency_benchmark_sub_15ms():
    solver = IterativeProjectionSolver(n_scenarios=500, max_iterations=50)
    distances = np.array([5600.0, 5450.0, 2900.0])
    speeds = np.array([14.5, 14.5, 14.5])

    # Warm-up
    _ = solver.solve(distances, speeds)

    latencies = []
    for _ in range(10):
        res = solver.solve(distances, speeds)
        latencies.append(res["solver_latency_ms"])

    mean_latency = float(np.mean(latencies))
    print(f"\n[BENCHMARK] Mean Iterative Projection Latency: {mean_latency:.2f} ms")
    assert mean_latency < 15.0, f"Mean latency {mean_latency} ms exceeded 15 ms target!"

def test_stockyard_denominator_safety_and_clamping():
    solver = IterativeProjectionSolver(n_scenarios=500, max_iterations=50)
    distances = np.array([5600.0, 5450.0, 2900.0])
    speeds = np.array([14.5, 14.5, 14.5])

    # Case A: Stockyard buffer depleted (below critical 15 days)
    # Burn rate = 8000 MT/day => 15 days = 120,000 MT. Provide only 80,000 MT.
    res_depleted = solver.solve(
        distances_nm=distances,
        baseline_speeds_knots=speeds,
        stockyard_stock_mt=80000.0,
        stockyard_burn_rate_mt=8000.0,
        critical_cushion_days=15.0
    )

    # Clamping must immediately force maximum speed (25.0 kn) without ZeroDivisionError
    assert np.all(res_depleted["v_clamped_knots"] == 25.0)
    assert all(res_depleted["clamping_active"])

    # Case B: Healthy stockyard buffer (350,000 MT ~ 43.75 days)
    res_healthy = solver.solve(
        distances_nm=distances,
        baseline_speeds_knots=speeds,
        stockyard_stock_mt=350000.0,
        stockyard_burn_rate_mt=8000.0,
        critical_cushion_days=15.0
    )
    # Virtual Arrival slow-steaming should be preserved
    assert not any(res_healthy["clamping_active"])

def test_goncalves_hjb_stopping_threshold():
    hjb = GoncalvesHJBSolver()
    res = hjb.evaluate(current_spot=18.5, volatility=0.35)

    assert "optimal_stopping_s_star" in res
    assert res["optimal_stopping_s_star"] > 0.0
    # Tail risk bound R_inf = k_d / r = 450 / 0.05 = 9000
    assert res["tail_risk_bound_r_inf"] == 9000.0
    assert res["action"] in ["COMMIT_NOW", "DEFER_CHARTER"]
    assert res["gamma_2"] > 1.0

def test_api_optimize_fleet_endpoint():
    payload = {
        "vessels": [
            {
                "id": "MV-01",
                "name": "MV Bharat Pride",
                "dwt_mt": 180000.0,
                "cargo_mt": 160000.0,
                "origin": "Gladstone (Australia)",
                "destination_port": "paradip",
                "distance_nm": 5600.0,
                "current_speed_knots": 14.5
            }
        ],
        "destination_port": "paradip",
        "bunker_price_usd": 620.0,
        "demurrage_daily_rate_usd": 28500.0,
        "stockyard_stock_mt": 350000.0,
        "stockyard_burn_rate_mt": 8000.0,
        "critical_cushion_days": 15.0,
        "macro_spot_rate_usd_mt": 18.50
    }
    response = client.post("/api/v1/optimize-fleet", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert len(data["vessels"]) == 1
    assert data["fleet_aggregates"]["total_fuel_saved_usd"] > 0
    assert data["solver_metadata"]["latency_ms"] < 15.0
    assert len(data["audit_signature"]) == 64  # SHA-256 length

def test_api_inventory_and_telemetry_endpoints():
    # Inventory status
    inv_res = client.get("/api/v1/inventory/status")
    assert inv_res.status_code == 200
    inv_data = inv_res.json()
    assert inv_data["current_buffer_days"] > inv_data["critical_cushion_days"]

    # Port telemetry
    tel_res = client.get("/api/v1/telemetry/ports")
    assert tel_res.status_code == 200
    tel_data = tel_res.json()
    assert "paradip" in tel_data["ports"]
    assert "vizag" in tel_data["ports"]
    assert "dhamra" in tel_data["ports"]

def test_api_audit_dossier_export():
    dossier_payload = {
        "optimization_result": {
            "test_key": "test_val",
            "fleet_savings": 120000.0
        },
        "authorized_role": "Chief Procurement Officer - SAIL/RINL",
        "tender_reference": "SAIL/MO-COAL/2026-Q3/009",
        "department": "Raw Materials & Bulk Maritime Logistics Wing"
    }
    res = client.post("/api/v1/audit/export-dossier", json=dossier_payload)
    assert res.status_code == 200
    data = res.json()

    assert data["status"] == "success"
    assert data["dossier_id"].startswith("CVC-CAG-DOSSIER-")
    assert len(data["sha256_signature"]) == 64
    assert "gfr_compliance" in data["legal_framework"]
