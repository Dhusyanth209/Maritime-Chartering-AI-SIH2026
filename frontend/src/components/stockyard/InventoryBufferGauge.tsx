import React from "react";
import { AlertTriangle, CheckCircle2, Flame, Layers } from "lucide-react";
import { StockyardStatusResponse } from "../../types/fleet";

interface InventoryBufferGaugeProps {
  stockyard: StockyardStatusResponse;
  onStockChange: (newStock: number) => void;
}

export const InventoryBufferGauge: React.FC<InventoryBufferGaugeProps> = ({
  stockyard,
  onStockChange
}) => {
  const isCritical = stockyard.status_level === "critical";
  const isWarning = stockyard.status_level === "warning";

  // Percentage relative to 60 days max gauge
  const gaugePct = Math.min(100, Math.max(5, (stockyard.current_buffer_days / 50.0) * 100.0));
  const redlinePct = (stockyard.critical_cushion_days / 50.0) * 100.0;

  return (
    <div className="panel-sentinel p-5 flex flex-col justify-between h-full shadow-lg">
      <div>
        {/* Panel Title */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Stockyard Horizon
            </h2>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isCritical
              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
              : isWarning
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
          }`}>
            {isCritical ? "CRITICAL REDLINE" : isWarning ? "BUFFER WARNING" : "OPTIMAL CUSHION"}
          </span>
        </div>

        {/* Big Metric Display */}
        <div className="mt-4 flex items-baseline justify-between">
          <div>
            <span className="text-3xl font-black text-white">{stockyard.current_buffer_days.toFixed(1)}</span>
            <span className="text-xs font-semibold text-slate-400 ml-1.5">Days Buffer</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-300">
              {stockyard.current_stock_mt.toLocaleString()} MT
            </span>
            <span className="text-[10px] text-slate-500 block">Total Met Coal Stock</span>
          </div>
        </div>

        {/* Visual Gauge Bar with Critical Redline Barrier */}
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1.5">
            <span>0d</span>
            <span className="text-rose-400 font-bold">15d Redline Barrier</span>
            <span>50d+</span>
          </div>
          <div className="relative w-full h-3.5 bg-[#0A0E17] rounded-full overflow-hidden border border-[#1E293B]">
            {/* Critical Redline Mark */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-rose-500 z-10"
              style={{ left: `${redlinePct}%` }}
              title="15.0 Days Critical Threshold"
            />
            {/* Progress Fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical
                  ? "bg-rose-500"
                  : isWarning
                  ? "bg-gradient-to-r from-rose-500 to-amber-500"
                  : "bg-gradient-to-r from-amber-500 via-blue-500 to-emerald-500"
              }`}
              style={{ width: `${gaugePct}%` }}
            />
          </div>
        </div>

        {/* Burn Rate Monitor */}
        <div className="mt-5 space-y-2.5 bg-[#0A0E17]/60 p-3.5 rounded-xl border border-[#1E293B]/70 text-xs">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Blast Furnace Burn (κ):</span>
            </div>
            <span className="font-mono font-bold text-slate-200">
              {stockyard.daily_burn_rate_mt.toLocaleString()} MT / day
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Net Safe Cushion:</span>
            <span className={`font-mono font-bold ${
              stockyard.net_cushion_days <= 0 ? "text-rose-400" : "text-emerald-400"
            }`}>
              {stockyard.net_cushion_days > 0 ? `+${stockyard.net_cushion_days.toFixed(1)} Days` : `${stockyard.net_cushion_days.toFixed(1)} Days`}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Transit Slack (T_slack):</span>
            <span className="font-mono text-slate-300">
              {stockyard.slack_hours.toFixed(0)} Hours
            </span>
          </div>
        </div>

        {/* Dynamic Velocity Clamp Indicator */}
        <div className="mt-4 p-3 rounded-xl border transition-all text-xs flex items-start space-x-2.5 bg-[#0A0E17]/80 border-[#1E293B]">
          {stockyard.is_clamped_by_stockyard ? (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-400 block">Plant Safety Clamping Active</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stockyard cushion breached. Transit speed clamped to maximum velocity (25 kn) to prevent blast furnace shutdown.
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-400 block">Port Delay Bound (JIT Mode)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Stockyard buffer is healthy. Speed is purely governed by roadstead queue synchronization and Admiralty slow-steaming.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Interactive Stockyard Level Slider for Simulation */}
      <div className="mt-6 pt-4 border-t border-[#1E293B]">
        <div className="flex justify-between text-xs text-slate-400 mb-1.5">
          <span>Simulate Stock Level:</span>
          <span className="font-mono font-bold text-slate-200">
            {stockyard.current_stock_mt.toLocaleString()} MT
          </span>
        </div>
        <input
          type="range"
          min={60000}
          max={450000}
          step={10000}
          value={stockyard.current_stock_mt}
          onChange={(e) => onStockChange(Number(e.target.value))}
          className="w-full accent-blue-500 bg-[#0A0E17] h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Depleted (60k MT)</span>
          <span>Baseline (350k MT)</span>
          <span>Full (450k MT)</span>
        </div>
      </div>
    </div>
  );
};
