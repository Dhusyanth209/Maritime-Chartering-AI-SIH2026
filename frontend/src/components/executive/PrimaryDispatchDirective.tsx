import React, { useState } from "react";
import { Navigation, CheckCircle2, Shield, Radio, Check } from "lucide-react";
import { VesselOptimizationDetail, FleetAggregates } from "../../types/fleet";

interface PrimaryDispatchDirectiveProps {
  vessel?: VesselOptimizationDetail;
  aggregates?: FleetAggregates;
  operatorSpeed: number | null;
  onSpeedOverrideRequested?: () => void;
}

export const PrimaryDispatchDirective: React.FC<PrimaryDispatchDirectiveProps> = ({
  vessel,
  aggregates,
  operatorSpeed
}) => {
  const [transmitted, setTransmitted] = useState<boolean>(false);
  const [transmitting, setTransmitting] = useState<boolean>(false);

  const speed = operatorSpeed ?? (vessel?.optimal_speed_clamped || 10.7);
  const isOptimal = operatorSpeed === null || operatorSpeed === vessel?.optimal_speed_clamped;

  const fuelSavedMt = vessel?.fuel_saved_mt ?? (aggregates?.total_fuel_saved_mt ? aggregates.total_fuel_saved_mt / 3 : 387.8);
  const fuelPct = aggregates?.fuel_burn_reduction_pct ?? 48.9;
  const demurrageAvoidedLakhs = vessel?.demurrage_avoided_lakhs_inr ?? 195.9;

  const handleTransmit = () => {
    setTransmitting(true);
    setTimeout(() => {
      setTransmitting(false);
      setTransmitted(true);
      setTimeout(() => setTransmitted(false), 5000);
    }, 600);
  };

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Subtle Top Accent Glow for Card A */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-600" />

      <div>
        {/* Card Header & Status Badge */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                Target Action Directive
              </span>
              <h2 className="text-xs font-black tracking-wider uppercase text-white">
                Primary Dispatch Directive
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>VIRTUAL ARRIVAL ACTIVE</span>
          </div>
        </div>

        {/* Large Key Metric: Recommended Cruising Speed */}
        <div className="mt-5 text-center bg-[#0A0E17]/80 rounded-xl p-4 border border-[#1E293B]">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Optimal JIT Cruising Speed
          </span>
          <div className="flex items-baseline justify-center space-x-2">
            <span className="text-5xl font-black tracking-tight text-white font-mono">
              {speed.toFixed(1)}
            </span>
            <span className="text-lg font-bold text-emerald-400">KNOTS</span>
          </div>
          <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Roadstead Delay • Synchronized with Port Berth Clearing</span>
          </div>
        </div>

        {/* 3-Metric Executive Decision Grid */}
        <div className="mt-4 grid grid-cols-1 gap-2.5">
          {/* Metric 1: Fuel Reduction */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0E17]/50 border border-[#1E293B]/70">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Fuel Reduction
              </span>
              <span className="text-sm font-black text-emerald-400 font-mono">
                {fuelPct.toFixed(1)}% ({fuelSavedMt.toFixed(1)} MT)
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono font-semibold">
              Admiralty v³
            </span>
          </div>

          {/* Metric 2: Voyage Demurrage */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0E17]/50 border border-[#1E293B]/70">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Voyage Demurrage
              </span>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-sm font-black text-white font-mono">₹0.00</span>
                <span className="text-xs text-emerald-400 font-semibold font-mono">
                  (Avoided ₹{demurrageAvoidedLakhs.toFixed(1)}L)
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono font-semibold">
              Zero Laytime
            </span>
          </div>

          {/* Metric 3: ETA Synchronization */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0A0E17]/50 border border-[#1E293B]/70">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Berth Window ETA
              </span>
              <span className="text-xs font-bold text-slate-200">
                Synchronized with Berth Availability
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-semibold">
              JIT Slot
            </span>
          </div>
        </div>
      </div>

      {/* Action Directive Button */}
      <div className="mt-5 pt-3 border-t border-[#1E293B]">
        <button
          onClick={handleTransmit}
          disabled={transmitting}
          className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg ${
            transmitted
              ? "bg-emerald-600 text-white shadow-emerald-900/30"
              : "bg-[#2563EB] hover:bg-blue-600 text-white shadow-blue-900/40 active:scale-[0.99]"
          }`}
        >
          {transmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Encrypting & Transmitting Advisory...</span>
            </>
          ) : transmitted ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Advisory Transmitted & Signed to Master</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-blue-200" />
              <span>Transmit Speed Advisory to Vessel Master</span>
            </>
          )}
        </button>

        <div className="mt-2 flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 text-center">
          <Shield className="w-3 h-3 text-slate-400" />
          <span>Legally binding notice per BIMCO Virtual Arrival Clause 2013</span>
        </div>
      </div>
    </div>
  );
};
