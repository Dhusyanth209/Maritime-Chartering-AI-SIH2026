import math
import numpy as np
from typing import Dict, Any

def calculate_goncalves_boundary(
    spot_rate_current: float = 14.50,
    daily_opex: float = 7500.0,
    port_dues: float = 2200.0,
    drift_mu: float = 0.015,
    vol_sigma: float = 0.28,
    rate_r: float = 0.05,
    risk_prem_lambda: float = 0.04,
    demurrage_day: float = 28500.0
) -> Dict[str, Any]:
    """
    Continuous-time Gonçalves HJB stopping boundary computation.
    """
    variance = vol_sigma ** 2.0
    diff = drift_mu - risk_prem_lambda - 0.5 * variance
    discriminant = (diff ** 2.0) + (2.0 * variance * rate_r)
    
    gamma2 = (-diff - math.sqrt(discriminant)) / variance
    
    opex_total = daily_opex + port_dues
    stopping_threshold_s_star = (gamma2 / (gamma2 - 1.0)) * (rate_r + risk_prem_lambda - drift_mu) * (opex_total / rate_r)
    s_star = abs(stopping_threshold_s_star)
    
    r_infinity = demurrage_day / rate_r
    should_book_now = spot_rate_current <= s_star

    return {
        "current_spot_rate": spot_rate_current,
        "s_star_threshold": round(s_star, 2),
        "asymptotic_tail_bound_usd": round(r_infinity, 2),
        "gamma2_root": round(gamma2, 4),
        "decision": "DISPATCH_TENDER_IMMEDIATELY" if should_book_now else "DEFER_CHARTER_HOLD_OPTION",
        "rationale": f"Current market rate (${spot_rate_current:.2f}) is {'below' if should_book_now else 'above'} optimal stopping boundary S* (${s_star:.2f}/MT)."
    }

class GoncalvesHJBSolver:
    def __init__(self):
        self.r = 0.05
        self.lmbda = 0.04
        self.mu = 0.015
        self.opex = 7500.0
        self.dues = 2200.0
        self.demurrage_day = 28500.0

    def evaluate(self, current_spot: float, volatility: float = 0.28) -> Dict[str, Any]:
        res = calculate_goncalves_boundary(
            spot_rate_current=current_spot,
            vol_sigma=volatility
        )
        return {
            "optimal_stopping_s_star": res["s_star_threshold"],
            "current_spot_rate": res["current_spot_rate"],
            "action": "COMMIT_NOW" if res["decision"] == "DISPATCH_TENDER_IMMEDIATELY" else "DEFER_CHARTER",
            "decision_rationale": res["rationale"],
            "tail_risk_bound_r_inf": res["asymptotic_tail_bound_usd"],
            "gamma_2": res["gamma2_root"]
        }
