import pytest
from app.models.schemas import FleetOptimizationInput
from app.services.iterative_projection import run_iterative_projection_solver
from app.services.goncalves_solver import calculate_goncalves_boundary

def test_iterative_projection_deterministic_convergence():
    payload = FleetOptimizationInput(
        port_id="PARADIP",
        distances_nm=[5600.0, 5200.0, 3200.0],
        scheduled_berth_times_hr=[48.0, 48.0],
        current_berth_delay_hr=38.5,
        v_min=10.0,
        v_max=25.0,
        vlsfo_price_usd=610.0,
        demurrage_rate_usd_day=28500.0,
        stockyard_buffer_days=18.4,
        critical_cushion_days=15.0,
        daily_burn_rate_mt=8000.0
    )
    # Warm-up run for JIT allocations
    _ = run_iterative_projection_solver(payload, n_scenarios=500, max_iter=50)
    result = run_iterative_projection_solver(payload, n_scenarios=500, max_iter=50)
    
    assert len(result.optimal_speeds_knots) == 3
    assert result.solver_latency_ms < 15.0
    for spd in result.optimal_speeds_knots:
        assert 10.0 <= spd <= 25.0
    assert result.total_demurrage_avoided_usd > 0
    assert result.compliance_certified is True

def test_goncalves_hjb_stopping_threshold():
    macro = calculate_goncalves_boundary(spot_rate_current=14.50)
    assert macro["s_star_threshold"] > 0
    assert macro["asymptotic_tail_bound_usd"] > 0
    assert "decision" in macro

def test_krishnapatnam_scenario():
    payload = FleetOptimizationInput(
        port_id="KRISHNAPATNAM",
        distances_nm=[5200.0, 4800.0],
        scheduled_berth_times_hr=[36.0],
        current_berth_delay_hr=14.0,
        stockyard_buffer_days=22.0
    )
    result = run_iterative_projection_solver(payload)
    assert len(result.optimal_speeds_knots) == 2
    assert result.net_landed_savings_inr_lakhs > 0
    assert result.compliance_certified is True
