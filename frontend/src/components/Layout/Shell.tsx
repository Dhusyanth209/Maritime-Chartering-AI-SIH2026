import React, { useState } from 'react';
import { HeaderTopBar } from './HeaderTopBar';
import { OceanRadarMap } from '../cockpit/OceanRadarMap';
import { TrajectoryCurve } from '../cockpit/TrajectoryCurve';
import { AuditDossierModal } from '../audit/AuditDossierModal';
import { PORT_REGISTRY, VesselItinerary } from '../../types/fleet';
import { Anchor, ArrowRight, Layers, Database, CheckCircle2, Ship, Compass, Check } from 'lucide-react';

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
  },
];

export const Shell: React.FC = () => {
  const [selectedPortKey, setSelectedPortKey] = useState<'PARADIP' | 'KRISHNAPATNAM'>('PARADIP');
  const [selectedVesselId, setSelectedVesselId] = useState<string>('V1');
  const [showTrajectory, setShowTrajectory] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [transmitted, setTransmitted] = useState<boolean>(false);

  const activePort = PORT_REGISTRY[selectedPortKey];
  const activeVessel = FLEET_DATA.find((v) => v.id === selectedVesselId) || FLEET_DATA[0];

  const handleTransmit = () => {
    setTransmitted(true);
    setTimeout(() => setTransmitted(false), 3500);
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
        {/* Tier 2 & Tier 3: Primary Split (70% Radar Canvas / 30% Actionable Drawer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Columns: AIS Ocean Radar Canvas */}
          <div className="lg:col-span-8 relative h-[680px] rounded-2xl overflow-hidden shadow-sm border border-sky-200 bg-white">
            <OceanRadarMap
              port={activePort}
              vessels={FLEET_DATA}
              selectedVesselId={selectedVesselId}
              onSelectVessel={setSelectedVesselId}
            />

            {/* Floating Port Channel Badge */}
            <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-sky-200 shadow-md">
              <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-sky-600" />
                <span className="font-bold text-xs text-sky-950 uppercase">{activePort.name}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Draft Limit: <span className="text-slate-800 font-semibold">{activePort.maxDraftMeters}m</span> | Unloader:{' '}
                <span className="text-emerald-600 font-semibold">{activePort.unloadingRateMtDay.toLocaleString()} MT/day</span>
              </p>
            </div>

            {/* Toggle Space-Time Trajectory Drawer */}
            <button
              onClick={() => setShowTrajectory(!showTrajectory)}
              className="absolute bottom-4 left-4 z-20 bg-white/95 hover:bg-white text-sky-950 border border-sky-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all hover:border-sky-400"
            >
              <Layers className="w-4 h-4 text-sky-600" />
              <span>{showTrajectory ? 'Hide Trajectory Curve' : 'Inspect Trajectory Profile (L × t)'}</span>
            </button>
          </div>

          {/* Right 4 Columns: Focused Vessel Directive Drawer */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-sky-200 p-6 shadow-sm flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-sky-100 pb-3 mb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 font-semibold">Flagship Focus</span>
                    <h2 className="text-xl font-bold text-slate-900">{activeVessel.name}</h2>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-mono font-bold">
                    ● VIRTUAL ARRIVAL ACTIVE
                  </span>
                </div>

                {/* Cruising Speed Recommendation */}
                <div className="mb-5 bg-sky-50/70 p-4 rounded-xl border border-sky-100">
                  <span className="text-[11px] font-mono text-slate-500 uppercase block mb-1">
                    Optimal Speed Directive
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold font-mono text-sky-950">{activeVessel.jitSpeedKn}</span>
                    <span className="text-sm font-bold text-slate-500 font-mono">KNOTS</span>
                    <span className="text-xs text-emerald-700 ml-auto font-semibold">Save 48.9% Fuel</span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Cargo Quantity</span>
                    <span className="text-slate-800 font-bold text-sm">{activeVessel.cargoMt.toLocaleString()} MT</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Avoided Demurrage</span>
                    <span className="text-emerald-700 font-bold text-sm">₹{activeVessel.demurrageSavedInrLakhs} L</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Distance to Port</span>
                    <span className="text-slate-800 font-bold text-sm">{activeVessel.distanceNm.toLocaleString()} NM</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-slate-400 text-[10px] block">Berth Arrival Window</span>
                    <span className="text-sky-700 font-bold text-sm">+{activeVessel.etaHours.toFixed(0)} Hours</span>
                  </div>
                </div>

                {/* Stockyard Health Status */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-500" />
                    <span className="font-mono text-slate-600">Stockyard Cushion:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    18.4 Days (15d Safe)
                  </span>
                </div>
              </div>

              <button
                onClick={handleTransmit}
                className={`w-full py-3.5 rounded-xl font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                  transmitted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sky-600 hover:bg-sky-500 text-white active:scale-[0.99]'
                }`}
              >
                {transmitted ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Speed Directive Signed & Transmitted to Bridge</span>
                  </>
                ) : (
                  <>
                    <span>Transmit Virtual Arrival Advisory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Continuous Space-Time Trajectory Scrubber */}
            {showTrajectory && (
              <div className="transition-all animate-fadeIn">
                <TrajectoryCurve port={activePort} vessel={activeVessel} />
              </div>
            )}
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
