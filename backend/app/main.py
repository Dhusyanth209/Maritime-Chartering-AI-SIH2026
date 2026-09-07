from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from app.models.schemas import FleetOptimizationInput, OptimizationResult
from app.services.iterative_projection import run_iterative_projection_solver
from app.services.goncalves_solver import calculate_goncalves_boundary
from app.core.security import generate_audit_digest

app = FastAPI(title="Command Sentinel OS v3.0 Engine", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "HEALTHY", "version": "3.0.0", "theme": "OCEANIC"}

@app.post("/api/v1/optimize-fleet", response_model=OptimizationResult)
async def optimize_fleet(payload: FleetOptimizationInput):
    return run_iterative_projection_solver(payload)

@app.post("/api/v1/iterative-projection", response_model=OptimizationResult)
async def iterative_projection_endpoint(payload: FleetOptimizationInput):
    return run_iterative_projection_solver(payload)

@app.get("/api/v1/macro/charter-signal")
async def get_macro_signal(spot_rate: float = 14.50):
    return calculate_goncalves_boundary(spot_rate_current=spot_rate)

@app.get("/api/v1/telemetry/ports")
async def get_ports_telemetry():
    return {
        "ports": [
            {
                "port_id": "PARADIP",
                "name": "Paradip Port Authority (PPA)",
                "authority": "Major Port Trust of India",
                "berths": "MCHP / Central Quay (CQ-1 & CQ-2)",
                "max_draft_meters": 16.0,
                "unloading_rate_mt_day": 45000,
                "coordinates": [20.258, 86.701],
                "queue_depth_vessels": 5,
                "projected_delay_hours": 38.5,
                "fairway_depth_meters": 16.5
            },
            {
                "port_id": "KRISHNAPATNAM",
                "name": "Adani Krishnapatnam Port (KPCL)",
                "authority": "Adani Ports and Special Economic Zone",
                "berths": "Berths 1-2 (Mechanized Deep Bulk)",
                "max_draft_meters": 18.5,
                "unloading_rate_mt_day": 65000,
                "coordinates": [14.251, 80.142],
                "queue_depth_vessels": 2,
                "projected_delay_hours": 14.0,
                "fairway_depth_meters": 19.0
            }
        ]
    }

@app.post("/api/v1/audit/export-dossier")
async def export_audit_dossier(payload: Dict[str, Any]):
    return generate_audit_digest(payload)
