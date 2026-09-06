from fastapi import APIRouter, Query
from app.models.schemas import StockyardStatusResponse
from app.services.data_generator import FleetDataGenerator
from app.core.config import settings

router = APIRouter()

@router.get("/status", response_model=StockyardStatusResponse)
def get_inventory_status(
    stock_mt: float = Query(default=settings.DEFAULT_STOCKYARD_MT),
    burn_rate_mt: float = Query(default=settings.DEFAULT_BURN_RATE_MT_DAY),
    critical_days: float = Query(default=settings.CRITICAL_CUSHION_DAYS)
):
    return FleetDataGenerator.compute_stockyard_status(
        stock_mt=stock_mt,
        burn_rate_mt=burn_rate_mt,
        critical_days=critical_days
    )
