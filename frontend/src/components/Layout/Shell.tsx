import React, { useState } from 'react';
import { HeaderTopBar } from './HeaderTopBar';
import { OceanRadarMap } from '../cockpit/OceanRadarMap';
import { TrajectoryCurve } from '../cockpit/TrajectoryCurve';
import { AuditDossierModal } from '../audit/AuditDossierModal';
import { PORT_REGISTRY, VesselItinerary } from '../../types/fleet';
import {
  Anchor,
  ArrowRight,
  Layers,
  Database,
  CheckCircle2,
  Ship,
  Compass,
  Check,
  Radio,
  Gauge,
  Clock,
  Wifi,
  Waves,
  Loader2,
  X,
} from 'lucide-react';

const FLEET_DATA: VesselItinerary[] = [
  {
    id: 'V1',
    name: 'MV Bharat Pride',
    origin: 'Port Hedland',
    destination: 'Paradip Port',
    cargoMt: 160000,
    distanceNm: 5600,
    baseSpeedKn: 14.5,
    jitSpeedKn: 10.7,
    fuelSavedMt: 387.8,
    demurrageSavedInrLakhs: 195.9,
    etaHours: 523.4,
    lat: 16.5,
    lon: 84.8,
    status: 'OPTIMAL',
    currentDraftMeters: 15.8,
    engineLoadPercent: 62,
    laytimeConsumedHours: 18.4,
    commGatewayStatus: 'Inmarsat-C Maritime SES-4 (Online 99.8%)',
    imoNumber: 'IMO 9481234 / MMSI 419001234',
  },
  {
    id: 'V2',
    name: 'MV Vizag Pioneer',
    origin: 'Gladstone',
    destination: 'Krishnapatnam Port',
    cargoMt: 150000,
    distanceNm: 5200,
    baseSpeedKn: 14.5,
    jitSpeedKn: 11.2,
    fuelSavedMt: 298.4,
    demurrageSavedInrLakhs: 142.0,
    etaHours: 464.2,
    lat: 13.8,
    lon: 82.2,
    status: 'OPTIMAL',
    currentDraftMeters: 17.2,
    engineLoadPercent: 66,
    laytimeConsumedHours: 12.0,
    commGatewayStatus: 'Inmarsat-C Maritime SES-2 (Online 99.9%)',
    imoNumber: 'IMO 9621458 / MMSI 419002981',
  },
  {
    id: 'V3',
    name: 'MV Kalinga Sentinel',
    origin: 'Newcastle',
    destination: 'Paradip Port',
    cargoMt: 170000,
    distanceNm: 3200,
    baseSpeedKn: 14.5,
    jitSpeedKn: 10.5,
    fuelSavedMt: 180.2,
    demurrageSavedInrLakhs: 98.4,
    etaHours: 304.7,
    lat: 18.2,
    lon: 85.9,
    status: 'OPTIMAL',
    currentDraftMeters: 16.0,
    engineLoadPercent: 58,
    laytimeConsumedHours: 24.5,
    commGatewayStatus: 'Inmarsat-C Maritime SES-4 (Online 99.7%)',
    imoNumber: 'IMO 9538721 / MMSI 419003442',
  },
];

export const Shell: React.FC = () => {
  const [selectedPortKey, setSelectedPortKey] = useState<'PARADIP' | 'KRISHNAPATNAM'>('PARADIP');
  const [selectedVesselId, setSelectedVesselId] = useState<string>('V1');
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [isTransmitted, setIsTransmitted] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activePort = PORT_REGISTRY[selectedPortKey];
  const activeVessel = FLEET_DATA.find((v) => v.id === selectedVesselId) || FLEET_DATA[0];

  const handleTransmit = () => {
    if (isTransmitting) return;
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      setIsTransmitted(true);
      setToastMessage(
        `Directive logged: Speed clamped to ${activeVessel.jitSpeedKn} kn. Laytime countdown paused under Virtual Arrival clause.`
      );
      setTimeout(() => {
        setIsTransmitted(false);
      }, 6000);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] text-slate-900 flex flex-col font-sans">
      <HeaderTopBar
        selectedPortKey={selectedPortKey}
        onPortChange={(k) => setSelectedPortKey(k as any)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        netSavingsLakhs={228.0}
        demurrageAvoidedLakhs={195.9}
        solverLatencyMs={11.2}
      />

      <main className="flex-grow p-6 max-w-[1780px] w-full mx-auto space-y-6">
        {/* Equalized Height Grid: Left 8 Columns (Radar + Trajectory) / Right 4 Columns (Directive + Telemetry) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Columns: AIS Ocean Radar Canvas + Space-Time Trajectory Curve */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Primary AIS Radar Canvas */}
            <div className="relative h-[490px] rounded-2xl overflow-hidden shadow-sm border border-sky-200 bg-white">
              <OceanRadarMap
                port={activePort}
                vessels={FLEET_DATA}
                selectedVesselId={selectedVesselId}
                onSelectVessel={setSelectedVesselId}
                pulseTrajectory={isTransmitting || isTransmitted}
              />

              {/* Floating Port Channel Badge */}
              <div className="absolute top-3.5 left-3.5 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-sky-200 shadow-md">
                <div className="flex items-center gap-2">
                  <Anchor className="w-3.5 h-3.5 text-sky-600" />
                  <span className="font-bold text-xs text-sky-950 uppercase">{activePort.name}</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Draft Limit: <span className="text-slate-800 font-semibold">{activePort.maxDraftMeters}m</span> | Unloader:{' '}
                  <span className="text-emerald-600 font-semibold">{activePort.unloadingRateMtDay.toLocaleString()} MT/d</span>
                </p>
              </div>
            </div>

            {/* Continuous Space-Time Trajectory Scrubber */}
            <TrajectoryCurve port={activePort} vessel={activeVessel} />
          </div>

          {/* Right 4 Columns: Two Coordinated Cards Stacked Cleanly */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Card 1: Primary Flagship Directive Card */}
            <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 font-semibold">Flagship Directive</span>
                  <h2 className="text-lg font-bold text-slate-900">{activeVessel.name}</h2>
                  <span className="text-[11px] text-slate-400 font-mono">{activeVessel.origin} ➔ {activeVessel.destination}</span>
                </div>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-1 rounded-full font-mono font-bold">
                  ● VIRTUAL ARRIVAL
                </span>
              </div>

              {/* Optimal Speed Directive Banner */}
              <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-100">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Optimal JIT Cruising Speed
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-mono text-sky-950">{activeVessel.jitSpeedKn}</span>
                  <span className="text-xs font-bold text-slate-500 font-mono">KNOTS</span>
                  <span className="text-[11px] text-emerald-700 ml-auto font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Save 48.9% Fuel
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Cargo Quantity</span>
                  <span className="text-slate-800 font-bold text-xs">{activeVessel.cargoMt.toLocaleString()} MT</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Avoided Demurrage</span>
                  <span className="text-emerald-700 font-bold text-xs">₹{activeVessel.demurrageSavedInrLakhs} L</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Distance to Port</span>
                  <span className="text-slate-800 font-bold text-xs">{activeVessel.distanceNm.toLocaleString()} NM</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 text-[10px] block">Berth Arrival Window</span>
                  <span className="text-sky-700 font-bold text-xs">+{activeVessel.etaHours.toFixed(0)} Hours</span>
                </div>
              </div>

              {/* Stockyard Health Status */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-mono text-slate-600 text-[11px]">Stockyard Buffer:</span>
                </div>
                <span className="font-mono font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  18.4 Days (15d Safe)
                </span>
              </div>

              {/* Master Transmission CTA with Spinner & State */}
              <button
                onClick={handleTransmit}
                disabled={isTransmitting}
                className={`w-full py-3 rounded-xl font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                  isTransmitted
                    ? 'bg-emerald-600 text-white'
                    : isTransmitting
                    ? 'bg-sky-500 text-white cursor-wait'
                    : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99]'
                }`}
              >
                {isTransmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitting to Bridge via Inmarsat-C...</span>
                  </>
                ) : isTransmitted ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>✓ Advisory Transmitted via Inmarsat-C</span>
                  </>
                ) : (
                  <>
                    <span>Transmit Virtual Arrival Advisory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Voyage Operational Status & Telemetry Card */}
            <div className="bg-white rounded-2xl border border-sky-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sky-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Voyage Operational Telemetry
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">{activeVessel.imoNumber}</span>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Gauge className="w-3.5 h-3.5 text-sky-600" />
                    <span>Current Draft / Max:</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {activeVessel.currentDraftMeters}m / {activePort.maxDraftMeters}m
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-sky-600" />
                    <span>Engine Load (MCR):</span>
                  </div>
                  <span className="font-bold text-emerald-700">
                    {activeVessel.engineLoadPercent}% (Eco-Derated)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Layers className="w-3.5 h-3.5 text-sky-600" />
                    <span>Laytime Consumed:</span>
                  </div>
                  <span className="font-bold text-slate-800">
                    {activeVessel.laytimeConsumedHours}h / {activePort.freeLaytimeHours}h
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Wifi className="w-3.5 h-3.5 text-sky-600" />
                    <span>Satcom Gateway:</span>
                  </div>
                  <span className="font-bold text-sky-800 text-[11px]">
                    {activeVessel.commGatewayStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/50 border border-sky-100">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Waves className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sea State / Swell:</span>
                  </div>
                  <span className="font-bold text-slate-800 text-[11px]">
                    Beaufort 4 • Wave 1.8m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Section Below the Fold: Spacious & Uncluttered Fleet Details */}
        <div className="space-y-6 pt-2">
          {/* Full Fleet Manifest Table */}
          <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Ship className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-mono uppercase tracking-wider">
                    Capesize Import Fleet Manifest — Long-Haul Schedule
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any flagship row to highlight its trajectory and inspect bridge speed directives.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg font-semibold">
                Deterministic IP Optimal v* Active
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-sky-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-sky-50/70 text-slate-600 uppercase text-[10px] font-mono border-b border-sky-100">
                    <th className="py-3 px-4">Flagship Name</th>
                    <th className="py-3 px-4">Origin ➔ Destination</th>
                    <th className="py-3 px-4">Cargo (MT)</th>
                    <th className="py-3 px-4 text-red-600">Base Speed (HUAW)</th>
                    <th className="py-3 px-4 text-emerald-600">JIT Speed (Virtual Arrival)</th>
                    <th className="py-3 px-4 text-right">Fuel Saved</th>
                    <th className="py-3 px-4 text-right">Demurrage Saved</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50 font-mono">
                  {FLEET_DATA.map((v) => {
                    const isSelected = v.id === selectedVesselId;
                    return (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVesselId(v.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-100/60 font-semibold text-slate-900'
                            : 'hover:bg-sky-50/50 text-slate-700'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                          <Ship className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                          <span>{v.name}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-sky-200 text-sky-800 px-1.5 py-0.5 rounded font-mono">
                              SELECTED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-sans">
                          {v.origin} ➔ {v.destination}
                        </td>
                        <td className="py-3.5 px-4">
                          {(v.cargoMt / 1000).toFixed(0)}k MT
                        </td>
                        <td className="py-3.5 px-4 text-red-600 font-bold">
                          {v.baseSpeedKn.toFixed(1)} kn
                        </td>
                        <td className="py-3.5 px-4 text-emerald-700 font-black">
                          {v.jitSpeedKn.toFixed(1)} kn
                        </td>
                        <td className="py-3.5 px-4 text-right text-emerald-700 font-bold">
                          {v.fuelSavedMt} MT
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-900 font-black">
                          ₹{v.demurrageSavedInrLakhs.toFixed(1)} L
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            SYNCHRONIZED
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Real Options & Terminal Infrastructure Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Gonçalves Macro-Charter Real Options */}
            <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-sky-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Gonçalves Macro-Charter Stopping Boundary (HJB)
                  </h4>
                </div>
                <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-mono font-bold">
                  DISPATCH_TENDER_IMMEDIATELY
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Current Spot Rate:</span>
                  <span className="text-base font-bold text-slate-900">$14.50/MT</span>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Trigger Boundary S*:</span>
                  <span className="text-base font-bold text-emerald-700">$19.24/MT</span>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Tail Risk Bound R_∞:</span>
                  <span className="text-base font-bold text-slate-800">$9,000</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-sky-50/30 p-3 rounded-xl border border-sky-100">
                Current market freight rate ($14.50/MT) is below the continuous-time optimal stopping boundary S* ($19.24/MT). Chartering now executes at sub-equilibrium rates and avoids volatile demurrage surcharges.
              </p>
            </div>

            {/* Card 2: Port Terminal Specifications & Fairway Corridor */}
            <div className="bg-white rounded-2xl p-6 border border-sky-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-sky-100 pb-3">
                <div className="flex items-center gap-2">
                  <Anchor className="w-5 h-5 text-sky-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                    Terminal Infrastructure & Marine Specifications
                  </h4>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono font-bold">
                  {activePort.authority}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Berth Allocation:</span>
                  <span className="text-slate-900 font-bold">{activePort.berthName}</span>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Max Permissible Draft:</span>
                  <span className="text-emerald-700 font-bold">{activePort.maxDraftMeters} Meters (Cape Ready)</span>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Continuous Unload Rate:</span>
                  <span className="text-slate-900 font-bold">{activePort.unloadingRateMtDay.toLocaleString()} MT / Day</span>
                </div>
                <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-slate-500 text-[10px] block">Free Laytime Clause:</span>
                  <span className="text-slate-900 font-bold">{activePort.freeLaytimeHours} Hours Non-Reversible</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-mono">
                <span>Current Queue Depth: <strong className="text-slate-800">{activePort.currentQueueDepth} Vessels</strong></span>
                <span>Projected Queue Delay: <strong className="text-red-600">{activePort.projectedBerthDelayHours} Hours</strong></span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Oceanic Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-sky-300 shadow-2xl transition-all animate-fadeIn">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h4 className="text-xs font-bold text-slate-900 font-mono uppercase tracking-wider">
                Virtual Arrival Speed Clamped
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Sovereign Audit Dossier Modal */}
      <AuditDossierModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        vessel={activeVessel}
        port={activePort}
        auditDigest="a77a485ffc30f83416ca05bf4cc170325a70b348d4f0714b132454bf76ba2b60"
      />

      {/* Sovereign Statutory Footer */}
      <footer className="w-full bg-white border-t border-sky-100 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        COMMAND SENTINEL OS v3.0 OCEANIC • Ministry of Steel (SAIL / RINL) • CVC Circular 02/05/2022 & GFR 2017 Rule 144 Compliant
      </footer>
    </div>
  );
};
