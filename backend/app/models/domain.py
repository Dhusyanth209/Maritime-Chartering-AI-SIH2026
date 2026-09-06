from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class VesselDispatch:
    id: str
    name: str
    dwt_mt: float
    cargo_mt: float
    origin: str
    destination_port: str
    distance_nm: float
    current_speed_knots: float = 14.5
    optimal_speed_knots: float = 11.0
    clamped_speed_knots: float = 11.0
    initial_eta_hours: float = 0.0
    optimal_eta_hours: float = 0.0
    fuel_saved_mt: float = 0.0
    fuel_saved_usd: float = 0.0
    demurrage_avoided_usd: float = 0.0

@dataclass
class StockyardProfile:
    plant_id: str
    plant_name: str
    current_stock_mt: float
    daily_burn_rate_mt: float
    critical_cushion_days: float
    buffer_days: float
    days_to_critical: float
    slack_hours: float
    clamping_active: bool = False

@dataclass
class ScenarioDistribution:
    n_scenarios: int = 500
    p_0: float = 0.95   # 0 days postponement probability
    p_5: float = 0.03   # 5 days postponement probability
    p_10: float = 0.02  # 10 days postponement probability
