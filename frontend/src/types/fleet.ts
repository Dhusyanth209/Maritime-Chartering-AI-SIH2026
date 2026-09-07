export interface PortInfrastructure {
  portId: 'PARADIP' | 'KRISHNAPATNAM';
  name: string;
  authority: string;
  berthName: string;
  maxDraftMeters: number;
  unloadingRateMtDay: number;
  latitude: number;
  longitude: number;
  anchorageRadiusNm: number;
  approachDepthMeters: number;
  freeLaytimeHours: number;
  demurrageRateUsdDay: number;
  currentQueueDepth: number;
  projectedBerthDelayHours: number;
}

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
  lat: number;
  lon: number;
  status: 'OPTIMAL' | 'CLAMPED' | 'HURRY_THEN_WAIT';
}

export const PORT_REGISTRY: Record<'PARADIP' | 'KRISHNAPATNAM', PortInfrastructure> = {
  PARADIP: {
    portId: 'PARADIP',
    name: 'Paradip Port Authority (PPA)',
    authority: 'Govt. of India — Major Port Trust',
    berthName: 'MCHP / Central Quay (CQ-1/CQ-2)',
    maxDraftMeters: 16.0,
    unloadingRateMtDay: 45000,
    latitude: 20.264,
    longitude: 86.687,
    anchorageRadiusNm: 3.2,
    approachDepthMeters: 16.5,
    freeLaytimeHours: 96.0,
    demurrageRateUsdDay: 28500,
    currentQueueDepth: 5,
    projectedBerthDelayHours: 38.5,
  },
  KRISHNAPATNAM: {
    portId: 'KRISHNAPATNAM',
    name: 'Adani Krishnapatnam Port (KPCL)',
    authority: 'Adani Ports & SEZ Ltd. — Deep Bulk Hub',
    berthName: 'Berths 1-2 (Mechanized Deep Bulk Quay)',
    maxDraftMeters: 18.5,
    unloadingRateMtDay: 65000,
    latitude: 14.249,
    longitude: 80.130,
    anchorageRadiusNm: 2.8,
    approachDepthMeters: 19.0,
    freeLaytimeHours: 96.0,
    demurrageRateUsdDay: 28500,
    currentQueueDepth: 2,
    projectedBerthDelayHours: 14.0,
  },
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
