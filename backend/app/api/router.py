from fastapi import APIRouter
from app.api.endpoints import fleet, inventory, audit

api_router = APIRouter()

api_router.include_router(fleet.router, tags=["Fleet Optimization & Telemetry"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["Stockyard Inventory"])
api_router.include_router(audit.router, prefix="/audit", tags=["CVC / CAG Digital Audit"])
