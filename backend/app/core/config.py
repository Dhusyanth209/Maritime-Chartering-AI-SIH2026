from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Dict, Any

class Settings(BaseSettings):
    PROJECT_NAME: str = "PAD-CE Maritime Engine"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "2.0.0"
    
    # Financial & Maritime Defaults
    DEFAULT_DEMURRAGE_RATE_USD: float = 28500.0  # Capesize standard daily rate
    DEFAULT_ALLOWED_LAYTIME_DAYS: float = 4.0
    USD_TO_INR: float = 84.20
    ANNUAL_INVENTORY_HOLDING_PCT: float = 0.12
    FOB_COKING_COAL_USD_PER_MT: float = 265.0
    
    # VLSFO Bunker Fuel Specs
    CAPESIZE_DESIGN_SPEED_KNOTS: float = 14.5
    CAPESIZE_SLOW_STEAM_SPEED_KNOTS: float = 10.5
    CAPESIZE_DAILY_SEA_CONSUMPTION_MT: float = 42.0
    VLSFO_BASE_PRICE_USD_PER_MT: float = 620.0
    
    # Port Coordinates
    PARADIP_COORDS: Dict[str, float] = {"lat": 20.2644, "lon": 86.6806}
    VIZAG_COORDS: Dict[str, float] = {"lat": 17.6868, "lon": 83.2985}
    
    model_config = ConfigDict(case_sensitive=True)

settings = Settings()
