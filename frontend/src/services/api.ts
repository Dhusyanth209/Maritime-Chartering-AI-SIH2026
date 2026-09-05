const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface RateForecastResponse {
  status: string;
  route: string;
  forecast: {
    current_spot_usd_mt: number;
    target_route: string;
    horizons: Array<{
      horizon_days: number;
      label: string;
      mean_rate_usd_mt: number;
      lower_90_ci: number;
      upper_90_ci: number;
      confidence_score: number;
      trend: string;
    }>;
    ensemble_weights: {
      rnn_weight: number;
      lstm_weight: number;
      gru_weight: number;
    };
    model_metadata: Record<string, string>;
  };
  history: Array<{
    date: string;
    bdi: number;
    bci: number;
    vlsfo: number;
    [key: string]: any;
  }>;
}

export interface PortStatusResponse {
  status: string;
  port_status: {
    port: string;
    port_name: string;
    queue_depth: number;
    berth_capacity: number;
    congestion_index: number;
    projected_queue_wait_days: number;
    projected_total_dwell_days: number;
    allowed_laytime_days: number;
    demurrage_days: number;
    demurrage_rate_daily_usd: number;
    demurrage_risk_usd: number;
    demurrage_risk_inr_cr: number;
    clusters: Array<{
      cluster_id: number;
      label: string;
      zone_type: string;
      vessel_count: number;
      avg_speed_knots: number;
      avg_dwell_hours: number;
      center_lat: number;
      center_lon: number;
    }>;
    total_vessels_tracked: number;
  };
}

export interface AISVessel {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  speed_knots: number;
  heading: number;
  dwt: number;
  status: string;
  days_in_anchorage: number;
  cargo_mt: number;
}

export interface DispatchOptimizeResponse {
  status: string;
  route: string;
  cargo_mt: number;
  stochastic_triggers: {
    s1_star_delay_threshold: number;
    s2_star_charter_trigger: number;
    current_spot: number;
    long_run_mean: number;
    volatility_sigma: number;
    kappa_reversion: number;
    recommendation: string;
    decision_rationale: string;
  };
  port_congestion: any;
  evaluation: {
    route_key: string;
    route_name: string;
    cargo_mt: number;
    optimal_charter_window: {
      recommended_horizon: string;
      dispatch_date: string;
      estimated_arrival_date: string;
      optimal_steaming_speed_knots: number;
      projected_voyage_days: number;
      trigger_signal: string;
    };
    comparison: {
      naive_spot: any;
      period_charter: any;
      pad_ce_optimal: any;
    };
    economic_impact: {
      net_savings_usd: number;
      net_savings_inr_cr: number;
      percentage_savings: number;
      demurrage_avoided_usd: number;
      bunker_fuel_saved_mt: number;
      co2_emissions_avoided_mt: number;
    };
    shap_attribution: Array<{
      factor: string;
      delta_usd: number;
      delta_pct: number;
      impact: string;
    }>;
  };
}

export interface AuditCertificateResponse {
  status: string;
  certificate_id: string;
  signature_hash: string;
  hash_algorithm: string;
  timestamp_utc: string;
  compliance: Record<string, string>;
  audit_record: any;
}

export const api = {
  async getForecast(route: string = "gladstone_paradip"): Promise<RateForecastResponse> {
    const res = await fetch(`${API_BASE_URL}/forecast?route=${route}`);
    if (!res.ok) throw new Error("Failed to fetch rate forecast");
    return res.json();
  },

  async getPortStatus(port: string = "paradip"): Promise<PortStatusResponse> {
    const res = await fetch(`${API_BASE_URL}/port-dwell/status?port=${port}`);
    if (!res.ok) throw new Error("Failed to fetch port dwell status");
    return res.json();
  },

  async getPortAIS(port: string = "paradip"): Promise<{ status: string; port: string; vessels: AISVessel[] }> {
    const res = await fetch(`${API_BASE_URL}/port-dwell/ais?port=${port}`);
    if (!res.ok) throw new Error("Failed to fetch AIS vessels");
    return res.json();
  },

  async runDispatchOptimization(params: {
    route: string;
    cargo_mt?: number;
    arrival_window_days?: number;
  }): Promise<DispatchOptimizeResponse> {
    const res = await fetch(`${API_BASE_URL}/dispatch/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        route: params.route,
        cargo_mt: params.cargo_mt || 160000.0,
        arrival_window_days: params.arrival_window_days || 21,
        target_inventory_days: 15,
        current_stock_mt: 350000.0,
        daily_plant_burn_mt: 24000.0
      })
    });
    if (!res.ok) throw new Error("Failed to run dispatch optimization");
    return res.json();
  },

  async generateAuditReport(decisionSummary: any): Promise<AuditCertificateResponse> {
    const res = await fetch(`${API_BASE_URL}/audit/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision_summary: decisionSummary,
        authorized_officer: "Chief Chartering Officer (Ministry of Steel / SAIL)",
        department: "Raw Materials & Bulk Maritime Logistics Wing"
      })
    });
    if (!res.ok) throw new Error("Failed to generate audit certificate");
    return res.json();
  }
};
