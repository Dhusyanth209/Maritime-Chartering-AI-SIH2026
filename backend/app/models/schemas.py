from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional

class FleetOptimizationInput(BaseModel):
    port_id: str = Field("PARADIP", description="Target port: PARADIP, KRISHNAPATNAM")
    distances_nm: List[float] = Field(..., description="Vessel distances in nautical miles")
    scheduled_berth_times_hr: List[float] = Field(..., description="Scheduled discharging hours per vessel")
    current_berth_delay_hr: float = Field(38.5, description="Active backlog queue delay at destination berth")
    v_min: float = Field(10.0, description="Minimum operational speed (knots)")
    v_max: float = Field(25.0, description="Technical maximum speed (knots)")
    vlsfo_price_usd: float = Field(610.0, description="Current Singapore VLSFO price ($/MT)")
    demurrage_rate_usd_day: float = Field(28500.0, description="Daily demurrage fine clause ($/day)")
    stockyard_buffer_days: float = Field(18.4, description="Current plant coal buffer (days)")
    critical_cushion_days: float = Field(15.0, description="Mandatory safety threshold (days)")
    daily_burn_rate_mt: float = Field(8000.0, description="Plant consumption rate (MT/day)")

class OptimizationResult(BaseModel):
    optimal_speeds_knots: List[float]
    arrival_times_hours: List[float]
    fuel_saving_percentage: List[float]
    fuel_burned_optimal_mt: List[float]
    fuel_burned_hurry_mt: List[float]
    total_fuel_saved_mt: float
    total_fuel_savings_usd: float
    total_demurrage_avoided_usd: float
    total_demurrage_avoided_inr_lakhs: float
    net_landed_savings_inr_lakhs: float
    inventory_clamped: bool
    solver_latency_ms: float
    audit_digest: str
    compliance_certified: bool

# Complementary Models for Rich Telemetry
class VesselInput(BaseModel):
    id: str = Field(default="MV-SAIL-01", description="Vessel identifier")
    name: str = Field(default="MV Bharat Pride", description="Vessel name")
    dwt_mt: float = Field(default=180000.0, description="Deadweight metric tons")
    cargo_mt: float = Field(default=160000.0, description="Laden coking coal MT")
    origin: str = Field(default="Gladstone (Australia)", description="Loading terminal")
    destination_port: str = Field(default="paradip", description="Discharge port key")
    distance_nm: float = Field(default=5600.0, description="Voyage distance nautical miles")
    current_speed_knots: float = Field(default=14.5, description="Current steaming velocity")

class PortStatusDetail(BaseModel):
    port_id: str
    name: str
    authority: str
    berths: str
    max_draft_meters: float
    unloading_rate_mt_day: int
    coordinates: List[float]
    queue_depth_vessels: int
    projected_delay_hours: float
    fairway_depth_meters: float
