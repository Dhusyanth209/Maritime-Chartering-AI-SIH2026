from fastapi import APIRouter, Query
from typing import Optional
from app.services.ais_pipeline import AISDataPipeline
from app.models.dern_forecaster import DERNForecaster

router = APIRouter()
pipeline = AISDataPipeline()
forecaster = DERNForecaster()

@router.get("")
@router.get("/")
def get_rate_forecast(
    route: str = Query("gladstone_paradip", description="Target maritime route identifier")
):
    """
    Returns multi-horizon spot rate forecast (T+7, T+14, T+21, T+28)
    with 90% confidence intervals and historical context.
    """
    df_history = pipeline.generate_synthetic_timeseries(n_days=365)
    target_col = "spot_gladstone_paradip" if "gladstone" in route.lower() else "spot_tanjung_vizag"
    
    forecast_result = forecaster.predict(df_history, target_col=target_col)
    
    # Recent 90-day history for visualization
    history_slice = df_history.iloc[-90:][["date", "bdi", "bci", "vlsfo", target_col]].copy()
    history_slice["date"] = history_slice["date"].astype(str)
    
    return {
        "status": "success",
        "route": route,
        "forecast": forecast_result,
        "history": history_slice.to_dict(orient="records")
    }
