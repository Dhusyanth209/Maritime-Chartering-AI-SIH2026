from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any, Optional

class VesselInput(BaseModel):
    id: str = Field(default="MV-SAIL-01", description="Vessel identifier")
    name: str = Field(default="MV Bharat Pride", description="Vessel name")
    dwt_mt: float = Field(default=180000.0, description="Deadweight metric tons")
    cargo_mt: float = Field(default=160000.0, description="Laden coking coal MT")
    origin: str = Field(default="Gladstone (Australia)", description="Loading terminal")
    destination_port: str = Field(default="paradip", description="Discharge port key")
    distance_nm: float = Field(default=5600.0, description="Voyage distance nautical miles")
    current_speed_knots: float = Field(default=14.5, description="Current steaming velocity")

class FleetInput(BaseModel):
    vessels: List[VesselInput] = Field(default_factory=list)
    destination_port: str = Field(default="paradip")
    bunker_price_usd: float = Field(default=620.0)
    demurrage_daily_rate_usd: float = Field(default=28500.0)
    stockyard_stock_mt: float = Field(default=350000.0)
    stockyard_burn_rate_mt: float = Field(default=8000.0)
    critical_cushion_days: float = Field(default=15.0)
    macro_spot_rate_usd_mt: float = Field(default=18.50)
    v_min: float = Field(default=10.0)
    v_max: float = Field(default=25.0)
    operator_speed_override: Optional[float] = None
    berth_service_delay_hours: float = Field(default=0.0)

    model_config = ConfigDict(extra="ignore")

class VesselOptimizationDetail(BaseModel):
    id: str
    name: str
    cargo_mt: float
    distance_nm: float
    baseline_speed_knots: float
    optimal_speed_ip: float
    optimal_speed_clamped: float
    transit_hours_baseline: float
    transit_hours_optimal: float
    eta_baseline_hours: float
    eta_optimal_hours: float
    fuel_burn_baseline_mt: float
    fuel_burn_optimal_mt: float
    fuel_saved_mt: float
    fuel_saved_usd: float
    demurrage_baseline_usd: float
    demurrage_optimal_usd: float
    demurrage_avoided_usd: float
    demurrage_avoided_lakhs_inr: float
    virtual_arrival_delay_hours: float

class StockyardStatusResponse(BaseModel):
    plant_name: str
    current_stock_mt: float
    daily_burn_rate_mt: float
    current_buffer_days: float
    critical_cushion_days: float
    net_cushion_days: float
    slack_hours: float
    is_clamped_by_stockyard: bool
    status_label: str
    status_level: str  # "optimal", "warning", "critical"

class GoncalvesEvaluation(BaseModel):
    optimal_stopping_s_star: float
    current_spot_rate: float
    action: str  # "COMMIT_NOW" or "DEFER_CHARTER"
    decision_rationale: str
    tail_risk_bound_r_inf: float
    gamma_2: float

class FeatureAttribution(BaseModel):
    feature: str
    impact_usd: float
    percentage_contribution: float
    direction: str

class OptimizationResult(BaseModel):
    status: str
    destination_port: str
    vessels: List[VesselOptimizationDetail]
    fleet_aggregates: Dict[str, Any]
    stockyard: StockyardStatusResponse
    goncalves_macro_trigger: GoncalvesEvaluation
    feature_attributions: List[FeatureAttribution]
    solver_metadata: Dict[str, Any]
    audit_signature: str

class PortPolygon(BaseModel):
    type: str
    coordinates: List[List[float]]

class PortStatusDetail(BaseModel):
    port_key: str
    name: str
    latitude: float
    longitude: float
    berths: int
    queue_depth_vessels: int
    avg_anchorage_wait_hours: float
    congestion_index_pct: float
    demurrage_hazard_hourly_usd: float
    roadstead_polygon: List[List[float]]
    approach_channel: List[List[float]]
    berth_locations: List[Dict[str, Any]]

class PortTelemetryResponse(BaseModel):
    timestamp_utc: str
    ports: Dict[str, PortStatusDetail]

class AuditDossierRequest(BaseModel):
    optimization_result: Dict[str, Any]
    authorized_role: str = "Chief Procurement Officer - SAIL/RINL"
    tender_reference: str = "SAIL/MO-COAL/2026-Q3/009"
    department: str = "Raw Materials & Bulk Maritime Logistics Wing"

class AuditDossierResponse(BaseModel):
    status: str
    dossier_id: str
    sha256_signature: str
    timestamp_utc: str
    legal_framework: Dict[str, str]
    audit_proof: Dict[str, Any]
