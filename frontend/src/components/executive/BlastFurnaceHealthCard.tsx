import React from "react";
import { Flame, AlertTriangle, ShieldCheck, Layers } from "lucide-react";
import { StockyardStatusResponse } from "../../types/fleet";

interface BlastFurnaceHealthCardProps {
  stockyard?: StockyardStatusResponse;
}

export const BlastFurnaceHealthCard: React.FC<BlastFurnaceHealthCardProps> = ({
  stockyard
}) => {
  const currentBufferDays = stockyard?.current_buffer_days ?? 18.4;
  const currentStockMt = stockyard?.current_stock_mt ?? 250000;
  const dailyBurnMt = stockyard?.daily_burn_rate_mt ?? 8000;
  const criticalThresholdDays = stockyard?.critical_cushion_days ?? 15.0;

  // Determine status color and label
  const isCritical = currentBufferDays <= criticalThresholdDays;
  const isWarning = !isCritical && currentBufferDays <= 16.5;
  const isSafe = !isCritical && !isWarning;

  const statusLabel = isCritical ? "CRITICAL BREACH" : isWarning ? "WARNING (<=16D)" : "SAFE BUFFER";

  // Visual bar gauge percentage (0 to 35 days scaled)
  const maxScaleDays = 35.0;
  const progressPct = Math.min(100, Math.max(8, (currentBufferDays / maxScaleDays) * 100));
  const redlinePct = (criticalThresholdDays / maxScaleDays) * 100; // ~42.8%

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Top Border Indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all ${
          isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                Plant Stockyard Monitor
              </span>
              <h2 className="text-xs font-black tracking-wider uppercase text-white">
                Blast Furnace Raw Material Health
              </h2>
            </div>
          </div>

          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center space-x-1.5 ${
              isCritical
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                : isWarning
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
            }`}
          >
            <span>●</span>
            <span>{statusLabel}</span>
          </span>
        </div>

        {/* Cushion Readout */}
        <div className="mt-5 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Stockyard Cushion
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span
                className={`text-4xl font-black font-mono ${
                  isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                }`}
              >
                {currentBufferDays.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-slate-300">Days Buffer</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Stock
            </span>
            <span className="text-base font-black font-mono text-white mt-0.5 block">
              {currentStockMt.toLocaleString()} MT
            </span>
            <span className="text-[10px] text-slate-400">Coking Coal</span>
          </div>
        </div>

        {/* Visual Progress Bar with Redline Marker */}
        <div className="mt-5">
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1.5">
            <span>0 Days</span>
            <span className="text-rose-400 font-bold flex items-center space-x-1">
              <span>▲</span>
              <span>15.0d Critical Threshold</span>
            </span>
            <span>35d Target</span>
          </div>

          <div className="relative w-full h-4 bg-[#0A0E17] rounded-full overflow-hidden border border-[#1E293B]">
            {/* Safety Boundary Marker (Red Line at 15 Days) */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-rose-500 z-20 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
              style={{ left: `${redlinePct}%` }}
              title="15.0 Days Critical Threshold"
            />

            {/* Filled Progress Bar */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : "bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Burn Rate Note & Plant Safety Badge */}
      <div className="mt-5 pt-3 border-t border-[#1E293B] space-y-2">
        <div className="flex items-center justify-between text-xs bg-[#0A0E17]/60 p-2.5 rounded-xl border border-[#1E293B]/60">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Daily Consumption:</span>
          </div>
          <span className="font-mono font-bold text-white">
            {dailyBurnMt.toLocaleString()} MT / Day
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 px-1">
          {isCritical ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-rose-300 font-semibold">
                ALERT: Clamping override active. Vessels must steam at maximum speed!
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Coking coal inflow guaranteed; stockyard redline is guarded.</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
