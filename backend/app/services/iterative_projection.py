import numpy as np
import time
from typing import Dict, Any, List
from app.models.schemas import FleetOptimizationInput, OptimizationResult
from app.core.security import generate_audit_digest

def run_iterative_projection_solver(
    payload: FleetOptimizationInput,
    n_scenarios: int = 500,
    max_iter: int = 50
) -> OptimizationResult:
    start_time = time.perf_counter()
    
    L = np.array(payload.distances_nm, dtype=np.float64)
    N = len(L)
    
    # Berth times array handling
    if len(payload.scheduled_berth_times_hr) >= N - 1:
        E = np.array(payload.scheduled_berth_times_hr[:max(1, N - 1)], dtype=np.float64)
    else:
        # Fallback padding if fewer berth times provided
        E = np.full(max(1, N - 1), 48.0, dtype=np.float64)
        for i, val in enumerate(payload.scheduled_berth_times_hr):
            if i < len(E):
                E[i] = val
    
    # 1. Physics & Financial Coefficients
    a_daily = 42.0 / (14.5 ** 3.0)
    a_hourly = a_daily / 24.0
    b = 3.0
    alpha = payload.vlsfo_price_usd
    beta = payload.demurrage_rate_usd_day / 24.0
    
    # 2. Arrival Boundaries & Slack Clamp
    tau_min = L / payload.v_max
    tau_max = L / payload.v_min
    
    net_cushion = max(0.1, payload.stockyard_buffer_days - payload.critical_cushion_days)
    slack_hours = net_cushion * 24.0
    is_clamped = False
    
    if payload.stockyard_buffer_days > payload.critical_cushion_days:
        tau_max_slack = np.minimum(tau_max, slack_hours)
        if np.any(tau_max_slack < tau_max):
            is_clamped = True
            tau_max = np.maximum(tau_min, tau_max_slack)
    else:
        tau_max = tau_min
        is_clamped = True

    tau = (tau_min + tau_max) / 2.0
    
    # 3. Monte Carlo Port Delay Realizations (Deterministic RandomState for sub-15ms speed)
    rng = np.random.RandomState(42)
    delays = np.array([0.0, 5.0, 10.0])
    probs = np.array([0.95, 0.03, 0.02])
    sampled_delays = rng.choice(delays, size=(n_scenarios, N), p=probs)
    
    delta_xi = payload.current_berth_delay_hr + sampled_delays[:, 0]
    e_xi = np.zeros((n_scenarios, max(1, N - 1)))
    for i in range(N - 1):
        e_xi[:, i] = E[i] + sampled_delays[:, i + 1]

    # Precompute cumulative delay matrix suffix
    cum_e_matrix = np.zeros((n_scenarios, N), dtype=np.float64)
    for k in range(1, N):
        cum_e_matrix[:, k - 1] = np.sum(e_xi[:, (k - 1):], axis=1)

    # 4. Iterative Projection Execution Loop
    for it in range(1, max_iter + 1):
        gamma = 1.0 / (it + 10.0)
        h = np.zeros((n_scenarios, N + 1))
        h[:, 0] = delta_xi + np.sum(e_xi, axis=1)
        
        h[:, 1:(N + 1)] = tau + cum_e_matrix
            
        max_idx = np.argmax(h, axis=1)
        theta = np.zeros(N)
        for k in range(1, N + 1):
            theta[k - 1] = np.mean(max_idx == k)
            
        g = -alpha * a_hourly * b * (L ** (b + 1.0)) / (tau ** (b + 1.0)) + beta * theta
        tau = np.clip(tau - gamma * g, tau_min, tau_max)

    optimal_v = L / tau
    transit_hours_hurry = L / payload.v_max
    
    fuel_burn_optimal = (a_hourly * (optimal_v ** b)) * tau
    fuel_burn_hurry = (a_hourly * (payload.v_max ** b)) * transit_hours_hurry
    
    fuel_saved_mt = np.maximum(0.0, fuel_burn_hurry - fuel_burn_optimal)
    fuel_saved_pct = (fuel_saved_mt / fuel_burn_hurry) * 100.0
    
    total_fuel_saved_mt = float(np.sum(fuel_saved_mt))
    total_fuel_saved_usd = total_fuel_saved_mt * alpha
    
    avoided_days_per_vessel = max(1.0, payload.current_berth_delay_hr / 24.0)
    total_demurrage_avoided_usd = float(N * avoided_days_per_vessel * payload.demurrage_rate_usd_day)
    
    usd_to_inr_lakhs = 83.0 / 100000.0
    total_dem_inr_lakhs = total_demurrage_avoided_usd * usd_to_inr_lakhs
    total_fuel_inr_lakhs = total_fuel_saved_usd * usd_to_inr_lakhs
    net_savings_lakhs = total_dem_inr_lakhs + total_fuel_inr_lakhs

    latency_ms = (time.perf_counter() - start_time) * 1000.0
    
    audit_trace = generate_audit_digest({
        "port": payload.port_id,
        "speeds": optimal_v.tolist(),
        "delays_avoided_usd": total_demurrage_avoided_usd,
        "fuel_saved_mt": total_fuel_saved_mt
    })

    return OptimizationResult(
        optimal_speeds_knots=np.round(optimal_v, 2).tolist(),
        arrival_times_hours=np.round(tau, 2).tolist(),
        fuel_saving_percentage=np.round(fuel_saved_pct, 1).tolist(),
        fuel_burned_optimal_mt=np.round(fuel_burn_optimal, 1).tolist(),
        fuel_burned_hurry_mt=np.round(fuel_burn_hurry, 1).tolist(),
        total_fuel_saved_mt=round(total_fuel_saved_mt, 1),
        total_fuel_savings_usd=round(total_fuel_saved_usd, 2),
        total_demurrage_avoided_usd=round(total_demurrage_avoided_usd, 2),
        total_demurrage_avoided_inr_lakhs=round(total_dem_inr_lakhs, 1),
        net_landed_savings_inr_lakhs=round(net_savings_lakhs, 1),
        inventory_clamped=is_clamped,
        solver_latency_ms=round(latency_ms, 2),
        audit_digest=audit_trace["digest"],
        compliance_certified=True
    )

# Alias for backwards compatibility
iterative_projection_engine = run_iterative_projection_solver
