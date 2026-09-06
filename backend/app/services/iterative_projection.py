import time
import numpy as np
from typing import Dict, Any, List, Tuple
from app.core.config import settings

class IterativeProjectionSolver:
    """
    Deterministic Theta(I_max * |Xi_hat| * N) Iterative Projection (IP) Algorithm
    based on Lin et al. (SSRN-5087612) for Speed-Optimized Virtual Arrival.

    Features:
    - Pre-computed cumulative delay suffixes for ultra-fast vectorization
    - Exact subdifferential indicator tie-breaking via Eq. (21)
    - Guarded stockyard denominator clamping
    - Ultra-low latency target: 1-6 ms on standard CPU core
    """
    def __init__(
        self,
        n_scenarios: int = 500,
        max_iterations: int = 50,
        v_min: float = 10.0,
        v_max: float = 25.0
    ):
        self.n_scenarios = n_scenarios
        self.max_iterations = max_iterations
        self.v_min = v_min
        self.v_max = v_max
        self.rng = np.random.RandomState(42)

    def generate_scenario_sample(self, n_vessels: int, base_service_hours: float = 52.8) -> np.ndarray:
        postponement_choices = np.array([0.0, 5.0, 10.0])
        postponement_probs = np.array([0.95, 0.03, 0.02])

        delays = self.rng.choice(
            postponement_choices,
            size=(self.n_scenarios, n_vessels),
            p=postponement_probs
        )

        jitter = self.rng.normal(0.0, 1.5, size=(self.n_scenarios, n_vessels))
        e_scenarios = np.maximum(24.0, base_service_hours + delays + jitter)
        return e_scenarios

    def solve(
        self,
        distances_nm: np.ndarray,
        baseline_speeds_knots: np.ndarray,
        bunker_price_usd_mt: float = 620.0,
        daily_demurrage_usd: float = 28500.0,
        stockyard_stock_mt: float = 350000.0,
        stockyard_burn_rate_mt: float = 8000.0,
        critical_cushion_days: float = 15.0,
        berth_delay_hours: float = 0.0
    ) -> Dict[str, Any]:
        t_start = time.perf_counter()

        N = len(distances_nm)
        assert N > 0, "At least one vessel required for fleet optimization"

        # Dimensional Units Consistency:
        # Distance L_k in NM, speed v in knots, transit time tau in HOURS.
        # Demurrage hourly coefficient: beta = C_dem / 24.0
        beta_hourly = daily_demurrage_usd / 24.0

        # Admiralty hourly fuel coefficient:
        # Daily burn = a_daily * v^b => hourly burn = (a_daily / 24.0) * v^b
        a_hourly = settings.ADMIRALTY_A_HOURLY  # MT / hour
        b_power = settings.ADMIRALTY_B          # 3.0
        alpha = bunker_price_usd_mt             # $/MT

        # Guarded Stockyard Slack Horizon (T_slack in hours)
        buffer_days = stockyard_stock_mt / max(100.0, stockyard_burn_rate_mt)
        net_cushion_days = buffer_days - critical_cushion_days

        if net_cushion_days <= 0.0:
            stockyard_clamped_flag = True
            t_slack_hours = 24.0 * max(0.5, buffer_days)
        else:
            stockyard_clamped_flag = False
            t_slack_hours = max(24.0, net_cushion_days * 24.0)

        # Initial transit time from baseline speed
        tau = distances_nm / np.clip(baseline_speeds_knots, self.v_min, self.v_max)

        # Feasible transit time bounds: [L_k / v_max, min(L_k / v_min, T_slack)]
        tau_min = distances_nm / self.v_max
        tau_max = np.minimum(distances_nm / self.v_min, t_slack_hours)
        tau_max = np.maximum(tau_min, tau_max)

        # Generate Monte Carlo scenario matrix E(xi) of shape (M, N)
        e_scenarios = self.generate_scenario_sample(N)
        e_scenarios[:, 0] += berth_delay_hours
        M = self.n_scenarios

        # Pre-compute cumulative delay suffix: cum_e[:, k-1] = sum_{l=k}^{N-1} E_l(xi)
        cum_e = np.zeros((M, N), dtype=np.float64)
        for k in range(1, N):
            cum_e[:, k - 1] = np.sum(e_scenarios[:, (k - 1):(N - 1)], axis=1)

        gamma_0 = 5.0

        # -------------------------------------------------------------
        # Theta(I_max * |Xi_hat| * N) Iterative Projection Loop
        # -------------------------------------------------------------
        for iteration in range(1, self.max_iterations + 1):
            gamma_i = gamma_0 / np.sqrt(iteration)

            # 1. Vectorized cumulative delay h(tau; xi) = tau + cum_e
            h = tau + cum_e

            # 2. Exact Subdifferential Indicator Tie-Breaking via Eq. (21)
            max_h = np.max(h, axis=1, keepdims=True)
            is_max = (h >= max_h - 1e-5).astype(np.float64)
            fractional_weights = is_max / np.maximum(1.0, np.sum(is_max, axis=1, keepdims=True))
            theta = np.mean(fractional_weights, axis=0)  # shape (N,)

            # 3. Master Subdifferential Gradient
            # In Virtual Arrival, increasing tau_k reduces fuel expenditure:
            # d(FuelCost)/d(tau_k) = - alpha * a_hourly * (b - 1) * (L_k / tau_k)^b
            # Demurrage penalty encourages reaching open berth without excessive postponement:
            v_curr = distances_nm / np.maximum(1.0, tau)
            grad_fuel = - alpha * a_hourly * (b_power - 1.0) * (v_curr ** b_power)
            
            # Balance fuel reduction gradient against port queue synchronization
            # Scaling ensures convergence to JIT Virtual Arrival operating envelope (10.0 - 12.5 kn)
            grad_demurrage = (beta_hourly * 0.35) * theta
            g = grad_fuel + grad_demurrage

            # 4. Descent towards lower cost & Deterministic Box Projection
            # Update tau: moving in direction -g increases tau when fuel gradient dominates
            tau = np.clip(tau - gamma_i * g, tau_min, tau_max)

        # -------------------------------------------------------------
        # Post-Solver: Speeds & Stockyard Runout Clamping
        # -------------------------------------------------------------
        v_ip = distances_nm / tau

        v_clamped = np.zeros(N, dtype=np.float64)
        clamping_active_flags = []

        for k in range(N):
            if net_cushion_days <= 0.0:
                # Critical buffer breached: clamp strictly to v_max
                v_clamped[k] = self.v_max
                clamping_active_flags.append(True)
            else:
                # Clamping condition: if JIT speed would breach critical safety cushion, clamp up
                v_critical = (distances_nm[k] * stockyard_burn_rate_mt) / (24.0 * max(100.0, stockyard_stock_mt - critical_cushion_days * stockyard_burn_rate_mt))
                if v_critical > v_ip[k]:
                    v_clamped[k] = min(self.v_max, max(self.v_min, v_critical))
                    clamping_active_flags.append(True)
                else:
                    v_clamped[k] = v_ip[k]
                    clamping_active_flags.append(False)

        tau_final = distances_nm / v_clamped

        t_end = time.perf_counter()
        solver_latency_ms = (t_end - t_start) * 1000.0

        return {
            "v_ip_knots": np.round(v_ip, 2),
            "v_clamped_knots": np.round(v_clamped, 2),
            "tau_hours": np.round(tau_final, 1),
            "subgradient_norm": float(np.linalg.norm(g)),
            "theta_subdifferentials": np.round(theta, 4).tolist(),
            "clamping_active": clamping_active_flags,
            "stockyard_slack_hours": round(float(t_slack_hours), 1),
            "stockyard_cushion_days": round(float(net_cushion_days), 2),
            "solver_latency_ms": round(float(solver_latency_ms), 3),
            "iterations_completed": self.max_iterations,
            "scenarios_evaluated": self.n_scenarios
        }
