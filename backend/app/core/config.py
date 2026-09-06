from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Dict, Any, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "COMMAND SENTINEL OS"
    VERSION: str = "3.0.0"
    API_V1_STR: str = "/api/v1"

    # Operational Speed Boundaries (knots)
    V_MIN: float = 10.0
    V_MAX: float = 25.0
    V_DESIGN: float = 14.5

    # Cargo & Voyage Defaults
    DEFAULT_CARGO_MT: float = 160000.0  # Capesize nominal laden deadweight
    ALLOWED_LAYTIME_DAYS: float = 4.0
    ALLOWED_LAYTIME_HOURS: float = 96.0  # 4 days * 24 hrs

    # Demurrage Cost Structure
    DAILY_DEMURRAGE_USD: float = 28500.0  # Standard charterparty demurrage rate
    HOURLY_DEMURRAGE_USD: float = 28500.0 / 24.0  # Beta = $1,187.50 / hour

    # VLSFO Bunker Fuel Specs & Admiralty Law
    # Daily consumption = a * v^b (MT/day). At 14.5 kn ~ 42 MT/day.
    ADMIRALTY_A_DAILY: float = 42.0 / (14.5 ** 3)  # ~ 0.013777
    ADMIRALTY_A_HOURLY: float = (42.0 / (14.5 ** 3)) / 24.0  # ~ 0.000574 MT/hour
    ADMIRALTY_B: float = 3.0
    DEFAULT_VLSFO_PRICE_USD: float = 620.0  # Singapore 0.5% VLSFO $/MT

    # Industrial Stockyard Parameters (SAIL & RINL Steel Plants)
    DEFAULT_STOCKYARD_MT: float = 350000.0
    DEFAULT_BURN_RATE_MT_DAY: float = 8000.0  # kappa MT/day
    CRITICAL_CUSHION_DAYS: float = 15.0  # Redline inventory barrier
    USD_TO_INR: float = 84.20

    # Gonçalves Continuous Stopping Parameters
    RISK_FREE_RATE_R: float = 0.05
    JUMP_INTENSITY_LAMBDA: float = 0.12
    DRIFT_MU: float = 0.02
    FIXED_OVERHEAD_A: float = 12000.0
    VOYAGE_PORT_EXPECTATION_T: float = 8500.0
    KD_TAIL_FACTOR: float = 450.0

    # Port Coordinates & Berths (Indian East Coast PSU Discharging Ports)
    PORTS: Dict[str, Dict[str, Any]] = {
        "paradip": {
            "name": "Paradip Port (Odisha)",
            "lat": 20.2644,
            "lon": 86.6806,
            "berths": 4,
            "service_rate_days": 2.2,  # Average turnaround per Capesize
            "approach_channel_nm": 6.8
        },
        "vizag": {
            "name": "Visakhapatnam Port (Andhra Pradesh)",
            "lat": 17.6868,
            "lon": 83.2985,
            "berths": 3,
            "service_rate_days": 2.4,
            "approach_channel_nm": 4.5
        },
        "dhamra": {
            "name": "Dhamra Port (Odisha)",
            "lat": 20.8144,
            "lon": 86.9631,
            "berths": 2,
            "service_rate_days": 2.0,
            "approach_channel_nm": 11.2
        }
    }

    # Major Origin-Destination Corridors
    ROUTES: Dict[str, Dict[str, Any]] = {
        "gladstone_paradip": {
            "origin": "Gladstone (Australia)",
            "destination": "Paradip Port",
            "distance_nm": 5600.0
        },
        "haypoint_vizag": {
            "origin": "Hay Point (Australia)",
            "destination": "Visakhapatnam Port",
            "distance_nm": 5450.0
        },
        "tanjung_dhamra": {
            "origin": "Tanjung Bara (Indonesia)",
            "destination": "Dhamra Port",
            "distance_nm": 2900.0
        }
    }

    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
