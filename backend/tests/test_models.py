import pytest
import numpy as np
import pandas as pd
import torch

from app.models.dern_forecaster import DERNArchitecture, DERNForecaster
from app.models.port_dbscan import PortSpatialQueueEstimator
from app.models.stochastic_solver import GoncalvesStochasticSolver
from app.services.cost_integral import VoyageCostIntegralService
from app.services.ais_pipeline import AISDataPipeline

def test_dern_architecture_forward_shape():
    batch_size = 4
    seq_len = 30
    input_dim = 4
    num_horizons = 4

    model = DERNArchitecture(input_dim=input_dim, hidden_dim=64, num_horizons=num_horizons)
    x = torch.randn(batch_size, seq_len, input_dim)
    mean, log_var, gate_weights = model(x)

    assert mean.shape == (batch_size, num_horizons)
    assert log_var.shape == (batch_size, num_horizons)
    assert gate_weights.shape == (batch_size, 3)
    # Check gate weights sum to 1.0 (softmax)
    assert torch.allclose(gate_weights.sum(dim=-1), torch.ones(batch_size), atol=1e-5)

def test_dern_forecaster_predictions():
    pipeline = AISDataPipeline(seed=42)
    df = pipeline.generate_synthetic_timeseries(n_days=180)
    forecaster = DERNForecaster(seq_len=20)
    res = forecaster.predict(df, target_col="spot_gladstone_paradip")

    assert "horizons" in res
    assert len(res["horizons"]) == 4
    for h in res["horizons"]:
        assert h["lower_90_ci"] <= h["mean_rate_usd_mt"] <= h["upper_90_ci"]
        assert 0.0 < h["confidence_score"] <= 1.0

def test_port_spatial_dbscan():
    pipeline = AISDataPipeline(seed=42)
    vessels = pipeline.generate_synthetic_ais(port_name="paradip", n_vessels=50)
    estimator = PortSpatialQueueEstimator(eps_deg=0.035, min_samples=3)
    res = estimator.analyze_port(vessels, port_key="paradip")

    assert res["port"] == "paradip"
    assert res["queue_depth"] >= 0
    assert 0.0 <= res["congestion_index"] <= 100.0
    assert res["demurrage_risk_usd"] >= 0.0
    assert len(res["clusters"]) > 0

def test_stochastic_solver_boundaries():
    solver = GoncalvesStochasticSolver()
    res = solver.solve_optimal_triggers(
        current_spot=18.5,
        annual_volatility=0.35,
        kappa=0.04,
        long_run_mean=17.5,
        demurrage_daily_cost=28500.0,
        congestion_index=45.0
    )

    assert res["s1_star_delay_threshold"] < res["s2_star_charter_trigger"]
    assert res["recommendation"] in ["EXECUTE_NOW", "DEFER_LAYUP", "OPTIMAL_DISPATCH_WINDOW"]

def test_admiralty_cubic_fuel_law():
    cost_service = VoyageCostIntegralService()
    # Design speed vs slow steaming
    full_speed = cost_service.calculate_fuel_consumption(speed_knots=14.5, distance_nm=5600.0)
    slow_speed = cost_service.calculate_fuel_consumption(speed_knots=10.5, distance_nm=5600.0)

    # 14.5 knots should burn ~42 MT/day
    assert 40.0 <= full_speed["daily_burn_mt"] <= 44.0
    # 10.5 knots should burn significantly less daily fuel (cubic law)
    assert slow_speed["daily_burn_mt"] < full_speed["daily_burn_mt"] * 0.45
    # Total fuel burn should be lower for slow steaming
    assert slow_speed["total_burn_mt"] < full_speed["total_burn_mt"]
