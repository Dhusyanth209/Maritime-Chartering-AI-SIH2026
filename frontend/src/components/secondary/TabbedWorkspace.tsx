import React, { useState } from "react";
import { Ship, Sliders, BrainCircuit, RotateCcw, AlertCircle, Compass, ShieldCheck } from "lucide-react";
import {
  VesselOptimizationDetail,
  FeatureAttribution,
  GoncalvesEvaluation,
  StockyardStatusResponse
} from "../../types/fleet";

interface TabbedWorkspaceProps {
  vessels: VesselOptimizationDetail[];
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
  // What-if simulator props
  berthDelayHours: number;
  bunkerPrice: number;
  stockyardStock: number;
  operatorSpeed: number | null;
  onDelayChange: (delayHrs: number) => void;
  onBunkerChange: (price: number) => void;
  onStockyardChange: (stock: number) => void;
  onSpeedChange: (speed: number) => void;
  onResetSpeed: () => void;
  // XAI props
  attributions: FeatureAttribution[];
  goncalves: GoncalvesEvaluation;
  stockyard?: StockyardStatusResponse;
}

export const TabbedWorkspace: React.FC<TabbedWorkspaceProps> = ({
  vessels,
  selectedVesselId,
  onSelectVessel,
  berthDelayHours,
  bunkerPrice,
  stockyardStock,
  operatorSpeed,
  onDelayChange,
  onBunkerChange,
  onStockyardChange,
  onSpeedChange,
  onResetSpeed,
  attributions,
  goncalves,
  stockyard
}) => {
  const [activeTab, setActiveTab] = useState<"manifest" | "sandbox" | "xai">("manifest");

  // Selected vessel detail
  const activeVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];
  const currentSpeed = operatorSpeed ?? (activeVessel?.optimal_speed_clamped || 10.7);

  // What-if delta calculations
  const baselineCost = 18.50 * (activeVessel?.cargo_mt || 160000);
  const demurrageImpactUsd = (berthDelayHours / 24.0) * 28500.0;
  const bunkerDeltaUsd = ((bunkerPrice - 620.0) * (activeVessel?.fuel_saved_mt || 387.8));

  return (
    <div className="w-full bg-[#111827] border border-[#1E293B] rounded-2xl shadow-xl overflow-hidden mt-6">
      {/* Tab Navigation Header */}
      <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0E1523] px-6">
        <div className="flex space-x-2">
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab("manifest")}
            className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "manifest"
                ? "border-[#2563EB] text-white bg-blue-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Ship className="w-4 h-4 text-blue-400" />
            <span>Active Fleet Manifest ({vessels.length} Vessels)</span>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab("sandbox")}
            className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "sandbox"
                ? "border-[#2563EB] text-white bg-blue-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>What-If Scenario Sandbox</span>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab("xai")}
            className={`flex items-center space-x-2 py-4 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "xai"
                ? "border-[#2563EB] text-white bg-blue-500/5"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-emerald-400" />
            <span>Algorithmic Transparency & XAI Proofs</span>
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 hidden md:block">
          Details on Demand • PRISMA 2023 Progressive Disclosure
        </span>
      </div>

      {/* Tab Content Body */}
      <div className="p-6">
        {/* ==================== TAB 1: FLEET MANIFEST ==================== */}
        {activeTab === "manifest" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Capesize Long-Haul Fleet Manifest & Dynamic Speeds
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any vessel row to highlight and inspect its space-time trajectory in the primary canvas.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                Deterministic IP Optimal v* Active
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#0A0E17] text-slate-400 uppercase text-[10px] font-mono border-b border-[#1E293B]">
                    <th className="py-3 px-4">Vessel Name</th>
                    <th className="py-3 px-4">Voyage Distance</th>
                    <th className="py-3 px-4">Cargo (MT)</th>
                    <th className="py-3 px-4 text-rose-400">HUAW Speed</th>
                    <th className="py-3 px-4 text-emerald-400">JIT Speed</th>
                    <th className="py-3 px-4 text-right">Fuel Saved</th>
                    <th className="py-3 px-4 text-right">Demurrage Saved</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B] bg-[#0E1726]/40">
                  {vessels.map((v) => {
                    const isSelected = v.id === selectedVesselId;
                    return (
                      <tr
                        key={v.id}
                        onClick={() => onSelectVessel(v.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-600/15 border-l-4 border-l-blue-500"
                            : "hover:bg-[#162133]/60"
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-white flex items-center space-x-2">
                          <Ship className={`w-4 h-4 ${isSelected ? "text-blue-400" : "text-slate-400"}`} />
                          <span>{v.name}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                              FOCUS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {v.distance_nm.toLocaleString()} NM
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {(v.cargo_mt / 1000).toFixed(0)}k MT
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                          {v.baseline_speed_knots.toFixed(1)} kn
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-400">
                          {v.optimal_speed_clamped.toFixed(1)} kn
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-emerald-400 font-bold">
                          {v.fuel_saved_mt.toFixed(1)} MT
                        </td>
                        <td className="py-3.5 px-4 font-mono text-right text-white font-black">
                          ₹{v.demurrage_avoided_lakhs_inr.toFixed(1)} Lakhs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
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
        )}

        {/* ==================== TAB 2: WHAT-IF SANDBOX ==================== */}
        {activeTab === "sandbox" && (
          <div className="space-y-6">
            <div className="bg-[#0A0E17]/60 p-4 rounded-xl border border-[#1E293B] flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Isolated What-If Simulation Sandbox
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Parameters adjusted here simulate operational variations without altering live bridge directives or signed audit records.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Environmental & Port Controls */}
              <div className="space-y-5 bg-[#0A0E17]/80 p-5 rounded-xl border border-[#1E293B]">
                {/* 1. Port Slippage */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Port Berth Turnaround Slippage:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {berthDelayHours > 0 ? `+${berthDelayHours.toFixed(1)} Hours` : "0.0h (Nominal Schedule)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={48}
                    step={2}
                    value={berthDelayHours}
                    onChange={(e) => onDelayChange(Number(e.target.value))}
                    className="w-full accent-amber-400 bg-[#1E293B] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>0h (On Schedule)</span>
                    <span>+24h (1 Day Delay)</span>
                    <span>+48h (Severe Congestion)</span>
                  </div>
                </div>

                {/* 2. Bunker Price */}
                <div className="space-y-1.5 pt-3 border-t border-[#1E293B]">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">VLSFO Bunker Fuel Price:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ${bunkerPrice.toFixed(0)} / MT
                    </span>
                  </div>
                  <input
                    type="range"
                    min={450}
                    max={900}
                    step={10}
                    value={bunkerPrice}
                    onChange={(e) => onBunkerChange(Number(e.target.value))}
                    className="w-full accent-blue-500 bg-[#1E293B] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>$450/MT</span>
                    <span>$620/MT (Current Singapore Benchmark)</span>
                    <span>$900/MT (Energy Shock)</span>
                  </div>
                </div>

                {/* 3. Stockyard Level */}
                <div className="space-y-1.5 pt-3 border-t border-[#1E293B]">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">Stockyard Coal Inventory:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {stockyardStock.toLocaleString()} MT ({(stockyardStock / 8000).toFixed(1)} Days)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={80000}
                    max={450000}
                    step={10000}
                    value={stockyardStock}
                    onChange={(e) => onStockyardChange(Number(e.target.value))}
                    className="w-full accent-purple-500 bg-[#1E293B] h-2 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span className="text-rose-400 font-bold">80k MT (10d - Critical Breach)</span>
                    <span>250k MT</span>
                    <span>450k MT (Surplus)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Fleet Velocity Override & Landed Cost Delta */}
              <div className="space-y-5 bg-[#0A0E17]/80 p-5 rounded-xl border border-[#1E293B] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Manual Fleet Velocity Override
                    </span>
                    {operatorSpeed !== null && (
                      <button
                        onClick={onResetSpeed}
                        className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset to Solver Target</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Selected Override Speed:</span>
                      <span className="font-mono text-base font-black text-white">
                        {currentSpeed.toFixed(1)} knots
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10.0}
                      max={25.0}
                      step={0.1}
                      value={currentSpeed}
                      onChange={(e) => onSpeedChange(Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-[#1E293B] h-2 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>10.0 kn (Floor)</span>
                      <span className="text-emerald-400 font-bold">10.7 kn (PAD-CE IP Target)</span>
                      <span className="text-rose-400">14.5 kn (HUAW)</span>
                      <span>25.0 kn (Max)</span>
                    </div>
                  </div>
                </div>

                {/* Landed Cost Sensitivity Matrix */}
                <div className="bg-[#111827] p-4 rounded-xl border border-[#1E293B] space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                    Simulated Voyage Cost Sensitivity Delta
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Demurrage Exposure:</span>
                      <span className={`font-mono font-bold ${demurrageImpactUsd > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        +${demurrageImpactUsd.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Bunker Delta Impact:</span>
                      <span className={`font-mono font-bold ${bunkerDeltaUsd > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                        {bunkerDeltaUsd >= 0 ? `+$${bunkerDeltaUsd.toFixed(0)}` : `-$${Math.abs(bunkerDeltaUsd).toFixed(0)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: XAI PROOFS & TRANSPARENCY ==================== */}
        {activeTab === "xai" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Plain-Language Reasoning */}
              <div className="bg-[#0A0E17]/80 p-5 rounded-xl border border-[#1E293B] space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Operational Rationale & Port Queue Logic
                  </h4>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed">
                  <span className="font-bold text-emerald-300 block mb-1">
                    Why 10.7 Knots?
                  </span>
                  Port queuing telemetry projects a 38-hour discharge congestion at Paradip Coal Berth 1 & 2. Steaming at 10.7 knots saves 387.8 MT of fuel (Admiralty cubic consumption law) and ensures the vessel arrives precisely as the berth clears, eliminating $28,500/day outer roadstead demurrage penalties.
                </div>

                <div className="p-3.5 rounded-xl bg-[#111827] border border-[#1E293B] text-xs text-slate-300 space-y-1.5">
                  <span className="font-bold text-blue-400 block">
                    Gonçalves Optimal Stopping Decision (HJB Trigger)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mt-1">
                    <div>
                      <span className="text-slate-400">Trigger Threshold (S*):</span>
                      <span className="text-white font-bold ml-1">${goncalves.optimal_stopping_s_star.toFixed(2)}/MT</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Tail Risk (R_∞):</span>
                      <span className="text-rose-400 font-bold ml-1">${goncalves.tail_risk_bound_r_inf.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {goncalves.decision_rationale}
                  </p>
                </div>
              </div>

              {/* Card 2: Subdifferential Feature Attribution */}
              <div className="bg-[#0A0E17]/80 p-5 rounded-xl border border-[#1E293B] space-y-3">
                <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
                  <BrainCircuit className="w-4 h-4 text-blue-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-white">
                    Subdifferential Cost Factor Decomposition
                  </h4>
                </div>

                <div className="space-y-3 mt-2">
                  {attributions.map((attr, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-300 font-medium truncate max-w-[220px]">
                          {attr.feature}
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {attr.percentage_contribution}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1E293B] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                          style={{ width: `${Math.max(8, attr.percentage_contribution)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>{attr.direction}</span>
                        <span className="font-mono">+${(attr.impact_usd / 1000).toFixed(0)}k impact</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Regulatory Closed-Form Mathematical Proof Viewer */}
            <div className="bg-[#0A0E17] p-5 rounded-xl border border-[#1E293B] space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-[#1E293B]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Closed-Form Mathematical Formulation (Auditor Scrutiny Verification)
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 bg-[#111827] rounded-lg border border-[#1E293B] space-y-1">
                  <span className="text-slate-400 text-[10px] block font-sans font-bold uppercase">
                    1. Iterative Projection Subdifferential Gradient
                  </span>
                  <div className="text-emerald-400 font-mono text-xs py-1">
                    g = -α · a_hourly · b · (L^(b+1)) / (τ^(b+1)) + β · θ
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Guarantees balancing of Admiralty cubic fuel burn against port demurrage subdifferential indicators θ across 500 stochastic scenarios.
                  </p>
                </div>

                <div className="p-3 bg-[#111827] rounded-lg border border-[#1E293B] space-y-1">
                  <span className="text-slate-400 text-[10px] block font-sans font-bold uppercase">
                    2. Blast Furnace Runout Clamping Invariant
                  </span>
                  <div className="text-blue-400 font-mono text-xs py-1">
                    τ_max = max(τ_min, min(τ_max, (I(t) - I_crit) · 24 / κ))
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">
                    Guarantees continuous plant operation by capping transit time to available stockyard cushion without division-by-zero.
                  </p>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 border-t border-[#1E293B] flex items-center justify-between">
                <span>Deterministic complexity: Θ(I_max · |Ξ| · N) • Total iterations: 50 • Monte Carlo realization size: 500</span>
                <span className="text-emerald-400 font-bold">CVC Circular 02/05/2022 Compliant</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
