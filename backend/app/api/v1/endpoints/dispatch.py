from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
import numpy as np

from app.services.ais_pipeline import AISDataPipeline
from app.models.dern_forecaster import DERNForecaster
from app.models.port_dbscan import PortSpatialQueueEstimator
from app.models.stochastic_solver import GoncalvesStochasticSolver
from app.services.cost_integral import VoyageCostIntegralService

router = APIRouter()
pipeline = AISDataPipeline()
forecaster = DERNForecaster()
port_estimator = PortSpatialQueueEstimator()
stochastic_solver = GoncalvesStochasticSolver()
cost_integral_service = VoyageCostIntegralService()

class DispatchOptimizationRequest(BaseModel):
    route: str = Field(default="gladstone_paradip", description="Route key")
    cargo_mt: float = Field(default=160000.0, description="Cargo volume in metric tons")
    arrival_window_days: int = Field(default=21, description="Laycan arrival horizon")
    target_inventory_days: int = Field(default=15, description="Plant inventory safety stock")
    current_stock_mt: float = Field(default=350000.0, description="Current stockpile in MT")
    daily_plant_burn_mt: float = Field(default=24000.0, description="Daily blast furnace coal consumption")

@router.post("/optimize")
def optimize_dispatch(payload: DispatchOptimizationRequest):
    """
    Executes master dispatch optimization:
    1. Multi-horizon DERN rate prediction
    2. DBSCAN AIS anchorage congestion & demurrage risk
    3. Gonçalves continuous-time stochastic boundary evaluation
    4. Master Cost Integral calculation with Slow-Steaming Admiralty fuel cubic law
    """
    port_name = "paradip" if "paradip" in payload.route.lower() else "vizag"
    target_col = "spot_gladstone_paradip" if "gladstone" in payload.route.lower() else "spot_tanjung_vizag"

    # Ingest data
    df_history = pipeline.generate_synthetic_timeseries(n_days=365)
    vessels = pipeline.generate_synthetic_ais(port_name=port_name)

    # 1. Forecast
    forecast_res = forecaster.predict(df_history, target_col=target_col)
    current_spot = forecast_res["current_spot_usd_mt"]
    horizons = forecast_res["horizons"]

    # 2. Port Dwell & Demurrage
    port_analysis = port_estimator.analyze_port(vessels, port_key=port_name)

    # 3. Volatility & Stochastic Solver
    recent_spots = df_history[target_col].iloc[-60:].values
    daily_returns = np.diff(np.log(recent_spots))
    annual_vol = float(np.std(daily_returns) * np.sqrt(365))
    long_run_mean = float(df_history[target_col].mean())

    stochastic_res = stochastic_solver.solve_optimal_triggers(
        current_spot=current_spot,
        annual_volatility=annual_vol,
        kappa=0.04,
        long_run_mean=long_run_mean,
        demurrage_daily_cost=port_analysis["demurrage_rate_daily_usd"],
        congestion_index=port_analysis["congestion_index"]
    )

    # 4. Master Landed Cost Integral
    vlsfo_price = float(df_history["vlsfo"].iloc[-1])
    evaluation = cost_integral_service.evaluate_charter_strategies(
        route_key=payload.route,
        cargo_mt=payload.cargo_mt,
        current_spot=current_spot,
        vlsfo_price=vlsfo_price,
        forecast_horizons=horizons,
        port_analysis=port_analysis,
        stochastic_analysis=stochastic_res
    )

    return {
        "status": "success",
        "route": payload.route,
        "cargo_mt": payload.cargo_mt,
        "stochastic_triggers": stochastic_res,
        "port_congestion": port_analysis,
        "evaluation": evaluation
    }
