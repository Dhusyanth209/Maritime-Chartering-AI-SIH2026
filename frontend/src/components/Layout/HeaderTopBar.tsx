import React from "react";
import { ShieldCheck, Cpu, Anchor, Navigation, Clock } from "lucide-react";
import { FleetAggregates, SolverMetadata } from "../../types/fleet";

interface HeaderTopBarProps {
  aggregates?: FleetAggregates;
  solverMeta?: SolverMetadata;
  selectedPort: string;
  onPortChange: (port: string) => void;
  viewMode: "canvas" | "radar";
  onViewModeChange: (mode: "canvas" | "radar") => void;
  optimizing: boolean;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  aggregates,
  solverMeta,
  selectedPort,
  onPortChange,
  viewMode,
  onViewModeChange,
  optimizing
}) => {
  return (
    <header className="w-full bg-[#0A0E17]/95 border-b border-[#1E293B] sticky top-0 z-50 backdrop-blur-md px-6 py-3">
      <div className="max-w-[1720px] mx-auto flex flex-col xl:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Role Identity */}
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/20 to-emerald-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
            <Anchor className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-black tracking-wider text-white">COMMAND SENTINEL OS</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md">
                v3.0 Production
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-300">Active Identity:</span>
              <span>Chief Procurement Officer — SAIL / RINL Logistics</span>
            </div>
          </div>
        </div>

        {/* Center: Global KPI Badges */}
        {aggregates && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#161F30]/80 border border-[#1E293B] rounded-xl px-3.5 py-1.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Demurrage Avoided</span>
              <span className="text-sm font-black text-emerald-400">
                ₹{aggregates.total_demurrage_avoided_lakhs_inr.toFixed(1)} Lakhs
              </span>
            </div>

            <div className="bg-[#161F30]/80 border border-[#1E293B] rounded-xl px-3.5 py-1.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Fuel Burn Saved</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-sm font-black text-emerald-400">{aggregates.total_fuel_saved_mt} MT</span>
                <span className="text-[10px] text-emerald-500/90 font-bold">(-{aggregates.fuel_burn_reduction_pct}%)</span>
              </div>
            </div>

            <div className="bg-[#161F30]/80 border border-[#1E293B] rounded-xl px-3.5 py-1.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Decarbonization</span>
              <span className="text-sm font-black text-blue-400">
                🌱 -{aggregates.co2_emissions_avoided_mt} MT CO₂
              </span>
            </div>

            <div className="bg-[#161F30]/80 border border-[#1E293B] rounded-xl px-3.5 py-1.5 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Net Expenditure Saved</span>
              <span className="text-sm font-black text-white">
                ₹{aggregates.net_expenditure_avoided_lakhs_inr.toFixed(1)} Lakhs
              </span>
            </div>
          </div>
        )}

        {/* Right: Latency Badge, Port Selector & View Toggle */}
        <div className="flex items-center space-x-3 w-full xl:w-auto justify-end">
          {/* Solver Latency Badge */}
          <div className="flex items-center space-x-1.5 bg-[#161F30] border border-[#1E293B] px-3 py-1.5 rounded-xl text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">IP Engine:</span>
            <span className={`font-bold ${optimizing ? "text-amber-400 animate-pulse" : "text-emerald-400"}`}>
              {solverMeta ? `${solverMeta.latency_ms} ms` : "Active"}
            </span>
          </div>

          {/* Destination Port Selector */}
          <select
            value={selectedPort}
            onChange={(e) => onPortChange(e.target.value)}
            className="bg-[#161F30] border border-[#1E293B] text-xs font-bold text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="paradip">Paradip Port (Odisha - SAIL)</option>
            <option value="vizag">Visakhapatnam (Vizag - RINL)</option>
            <option value="dhamra">Dhamra Port (Odisha - Concession)</option>
          </select>

          {/* Dual-View Toggle */}
          <div className="flex items-center bg-[#161F30] p-1 rounded-xl border border-[#1E293B]">
            <button
              onClick={() => onViewModeChange("canvas")}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "canvas" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Distance-Time</span>
            </button>
            <button
              onClick={() => onViewModeChange("radar")}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "radar" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              <Navigation className="w-3 h-3" />
              <span>AIS Radar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
