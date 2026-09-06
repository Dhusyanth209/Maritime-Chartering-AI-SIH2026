export interface VesselInput {
  id: string;
  name: string;
  dwt_mt: number;
  cargo_mt: number;
  origin: string;
  destination_port: string;
  distance_nm: number;
  current_speed_knots: number;
}

export interface VesselOptimizationDetail {
  id: string;
  name: string;
  cargo_mt: number;
  distance_nm: number;
  baseline_speed_knots: number;
  optimal_speed_ip: number;
  optimal_speed_clamped: number;
  transit_hours_baseline: number;
  transit_hours_optimal: number;
  eta_baseline_hours: number;
  eta_optimal_hours: number;
  fuel_burn_baseline_mt: number;
  fuel_burn_optimal_mt: number;
  fuel_saved_mt: number;
  fuel_saved_usd: number;
  demurrage_baseline_usd: number;
  demurrage_optimal_usd: number;
  demurrage_avoided_usd: number;
  demurrage_avoided_lakhs_inr: number;
  virtual_arrival_delay_hours: number;
}

export interface StockyardStatusResponse {
  plant_name: string;
  current_stock_mt: number;
  daily_burn_rate_mt: number;
  current_buffer_days: number;
  critical_cushion_days: number;
  net_cushion_days: number;
  slack_hours: number;
  is_clamped_by_stockyard: boolean;
  status_label: string;
  status_level: "optimal" | "warning" | "critical";
}

export interface GoncalvesEvaluation {
  optimal_stopping_s_star: number;
  current_spot_rate: number;
  action: "COMMIT_NOW" | "DEFER_CHARTER";
  decision_rationale: string;
  tail_risk_bound_r_inf: number;
  gamma_2: number;
}

export interface FeatureAttribution {
  feature: string;
  impact_usd: number;
  percentage_contribution: number;
  direction: string;
}

export interface FleetAggregates {
  vessels_optimized: number;
  total_fuel_saved_mt: number;
  total_fuel_saved_usd: number;
  total_demurrage_avoided_usd: number;
  total_demurrage_avoided_lakhs_inr: number;
  co2_emissions_avoided_mt: number;
  net_expenditure_avoided_usd: number;
  net_expenditure_avoided_lakhs_inr: number;
  fuel_burn_reduction_pct: number;
}

export interface SolverMetadata {
  algorithm: string;
  time_complexity: string;
  iterations: number;
  scenarios: number;
  latency_ms: number;
  subgradient_norm: number;
  status: string;
}

export interface OptimizationResult {
  status: string;
  destination_port: string;
  vessels: VesselOptimizationDetail[];
  fleet_aggregates: FleetAggregates;
  stockyard: StockyardStatusResponse;
  goncalves_macro_trigger: GoncalvesEvaluation;
  feature_attributions: FeatureAttribution[];
  solver_metadata: SolverMetadata;
  audit_signature: string;
}

export interface PortStatusDetail {
  port_key: string;
  name: string;
  latitude: number;
  longitude: number;
  berths: number;
  queue_depth_vessels: number;
  avg_anchorage_wait_hours: number;
  congestion_index_pct: number;
  demurrage_hazard_hourly_usd: number;
  roadstead_polygon: number[][];
  approach_channel: number[][];
  berth_locations: Array<{
    berth_id: string;
    type: string;
    status: string;
    eta_clear_hrs: number;
  }>;
}

export interface PortTelemetryResponse {
  timestamp_utc: string;
  ports: Record<string, PortStatusDetail>;
}

export interface AuditDossierResponse {
  status: string;
  dossier_id: string;
  sha256_signature: string;
  timestamp_utc: string;
  legal_framework: Record<string, string>;
  audit_proof: {
    dossier_id: string;
    authorized_signatory: string;
    tender_id: string;
    mathematical_model: string;
    optimality_condition: string;
    sha256_digest: string;
    input_snapshot: any;
  };
}
