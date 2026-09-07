export interface VesselItinerary {
  id: string;
  name: string;
  origin: string;
  destination: string;
  cargoMt: number;
  distanceNm: number;
  baseSpeedKn: number;
  jitSpeedKn: number;
  fuelSavedMt: number;
  demurrageSavedInrLakhs: number;
  etaHours: number;
  status: 'OPTIMAL' | 'CLAMPED' | 'HURRY_THEN_WAIT';
}

export interface PortInfrastructure {
  portId: 'PARADIP' | 'KRISHNAPATNAM';
  name: string;
  authority: string;
  berthName: string;
  maxDraftMeters: number;
  unloadingRateMtDay: number;
  outerAnchorageLatLong: [number, number];
  freeLaytimeHours: number;
  demurrageRateUsdDay: number;
  currentQueueDepth: number;
  projectedBerthDelayHours: number;
}

export const PORT_REGISTRY: Record<string, PortInfrastructure> = {
  PARADIP: {
    portId: 'PARADIP',
    name: 'Paradip Port Authority (PPA)',
    authority: 'Government of India - Major Port Trust',
    berthName: 'MCHP / Central Quay (CQ-1 & CQ-2)',
    maxDraftMeters: 16.0,
    unloadingRateMtDay: 45000,
    outerAnchorageLatLong: [20.258, 86.701],
    freeLaytimeHours: 96.0,
    demurrageRateUsdDay: 28500,
    currentQueueDepth: 5,
    projectedBerthDelayHours: 38.5,
  },
  KRISHNAPATNAM: {
    portId: 'KRISHNAPATNAM',
    name: 'Adani Krishnapatnam Port (KPCL)',
    authority: 'Adani Ports & SEZ - Deep Water Terminal',
    berthName: 'Berths 1-2 (Mechanized Deep Bulk Quay)',
    maxDraftMeters: 18.5,
    unloadingRateMtDay: 65000,
    outerAnchorageLatLong: [14.251, 80.142],
    freeLaytimeHours: 96.0,
    demurrageRateUsdDay: 28500,
    currentQueueDepth: 2,
    projectedBerthDelayHours: 14.0,
  }
};

export interface OptimizationResult {
  optimal_speeds_knots: number[];
  arrival_times_hours: number[];
  fuel_saving_percentage: number[];
  fuel_burned_optimal_mt: number[];
  fuel_burned_hurry_mt: number[];
  total_fuel_saved_mt: number;
  total_fuel_savings_usd: number;
  total_demurrage_avoided_usd: number;
  total_demurrage_avoided_inr_lakhs: number;
  net_landed_savings_inr_lakhs: number;
  inventory_clamped: boolean;
  solver_latency_ms: number;
  audit_digest: string;
  compliance_certified: boolean;
}

export interface MacroCharterSignal {
  current_spot_rate: number;
  s_star_threshold: number;
  asymptotic_tail_bound_usd: number;
  gamma2_root: number;
  decision: string;
  rationale: string;
}
