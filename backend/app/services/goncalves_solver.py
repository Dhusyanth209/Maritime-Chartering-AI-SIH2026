import numpy as np
from typing import Dict, Any
from app.core.config import settings

class GoncalvesHJBSolver:
    """
    Continuous-Time Stochastic Optimal Stopping Engine for Dry Bulk Shipping
    based on the Gonçalves (MIT Thesis) Real Options Framework.

    Solves the Hamilton-Jacobi-Bellman (HJB) variational inequality:
    min { r V - L V,  V - (S - C) } = 0

    Analytical Optimal Stopping Boundary:
    S* = (gamma_2 / (gamma_2 - 1)) * (r + lambda - mu) * ((A + T) / r)
    Asymptotic Tail Risk Bound:
    R_inf = k_d / r
    """
    def __init__(self):
        self.r = settings.RISK_FREE_RATE_R          # 0.05
        self.lmbda = settings.JUMP_INTENSITY_LAMBDA  # 0.12
        self.mu = settings.DRIFT_MU                  # 0.02
        self.A = settings.FIXED_OVERHEAD_A          # $12,000
        self.T = settings.VOYAGE_PORT_EXPECTATION_T  # $8,500
        self.kd = settings.KD_TAIL_FACTOR           # 450.0

    def compute_gamma2(self, sigma: float = 0.35) -> float:
        """
        Solves the fundamental quadratic for the positive root gamma_2 > 1:
        0.5 * sigma^2 * gamma^2 + (mu - 0.5 * sigma^2) * gamma - (r + lambda) = 0
        """
        sigma = max(0.10, min(0.80, float(sigma)))
        a_quad = 0.5 * (sigma ** 2)
        b_quad = self.mu - 0.5 * (sigma ** 2)
        c_quad = - (self.r + self.lmbda)

        discriminant = (b_quad ** 2) - (4.0 * a_quad * c_quad)
        gamma2 = (-b_quad + np.sqrt(discriminant)) / (2.0 * a_quad)
        return float(max(1.15, gamma2))

    def evaluate(self, current_spot: float, volatility: float = 0.35) -> Dict[str, Any]:
        gamma2 = self.compute_gamma2(volatility)

        # Stopping boundary formula:
        # S* = (gamma_2 / (gamma_2 - 1)) * (r + lambda - mu) * ((A + T) / r)
        multiplier = gamma2 / (gamma2 - 1.0)
        drift_discount = self.r + self.lmbda - self.mu
        capitalized_costs = (self.A + self.T) / self.r

        # Scaled to spot freight rate per metric ton ($/MT) for Capesize bulk cargo
        raw_s_star = multiplier * drift_discount * capitalized_costs
        s_star = round(float(raw_s_star / 1000.0), 2)  # $/MT

        # Asymptotic tail risk bound: R_inf = k_d / r
        r_inf = round(float(self.kd / self.r), 2)

        if current_spot >= s_star:
            action = "COMMIT_NOW"
            rationale = (
                f"Current spot (${current_spot:.2f}/MT) exceeds HJB stopping boundary S* (${s_star:.2f}/MT). "
                f"Execute spot fixture immediately to prevent tail risk exposure (R_inf = ${r_inf:,.0f})."
            )
        else:
            action = "DEFER_CHARTER"
            rationale = (
                f"Current spot (${current_spot:.2f}/MT) is below stopping boundary S* (${s_star:.2f}/MT). "
                f"Optimal stopping theory recommends holding position to capture market trough."
            )

        return {
            "optimal_stopping_s_star": s_star,
            "current_spot_rate": round(float(current_spot), 2),
            "action": action,
            "decision_rationale": rationale,
            "tail_risk_bound_r_inf": r_inf,
            "gamma_2": round(gamma2, 4)
        }
