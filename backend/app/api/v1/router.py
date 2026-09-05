from fastapi import APIRouter
from app.api.v1.endpoints import forecast, port_dwell, dispatch, audit

api_router = APIRouter()

api_router.include_router(forecast.router, prefix="/forecast", tags=["Rate Forecasting"])
api_router.include_router(port_dwell.router, prefix="/port-dwell", tags=["Port AIS & Dwell"])
api_router.include_router(dispatch.router, prefix="/dispatch", tags=["Charter Optimization"])
api_router.include_router(audit.router, prefix="/audit", tags=["CVC/CAG Audit"])
