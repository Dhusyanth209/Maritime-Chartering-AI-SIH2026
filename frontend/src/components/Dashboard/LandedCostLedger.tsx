import React from "react";

interface LandedCostLedgerProps {
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
  onGenerateAudit: () => void;
  auditLoading: boolean;
}

export const LandedCostLedger: React.FC<LandedCostLedgerProps> = ({
  evaluation,
  onGenerateAudit,
  auditLoading
}) => {
  const { comparison, economic_impact, optimal_charter_window, shap_attribution } = evaluation;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
      {/* Top Banner: Economic Savings & Optimal Recommendation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-xl font-black text-white tracking-wide">
              Master Landed Cost Ledger & Decision Optimization
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous-Time Integral Evaluation • Gonçalves Optimal Stopping • Admiralty Speed Optimization
          </p>
        </div>

        {/* Big Savings Metric & 1-Click Audit Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-emerald-950/70 border border-emerald-500/40 px-4 py-2.5 rounded-xl shadow-inner">
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Net Savings</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-black text-white">₹{economic_impact.net_savings_inr_cr} Cr</span>
              <span className="text-xs font-semibold text-emerald-400">(${economic_impact.net_savings_usd.toLocaleString()})</span>
              <span className="text-xs font-extrabold text-emerald-300">({economic_impact.percentage_savings.toFixed(1)}%)</span>
            </div>
          </div>

          <button
            onClick={onGenerateAudit}
            disabled={auditLoading}
            className="flex items-center space-x-2 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            <span>📜</span>
            <span>{auditLoading ? "Signing Cryptographic Hash..." : "Generate GFR 2017 Audit Certificate"}</span>
          </button>
        </div>
      </div>

      {/* 3-Way Comparative Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Strategy 1: Naive Spot Booking */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Strategy A</span>
              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Baseline</span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mt-1">Naive Spot Booking (Day 0)</h4>
            <div className="text-2xl font-black text-slate-300 mt-2">
              ${comparison.naive_spot.cost_per_mt_usd.toFixed(2)}
              <span className="text-xs font-normal text-slate-400"> /MT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total: ${comparison.naive_spot.total_landed_cost_usd.toLocaleString()}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span>Freight:</span>
                <span className="text-slate-200 font-mono">${comparison.naive_spot.freight_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bunker Fuel (14.5 kn):</span>
                <span className="text-slate-200 font-mono">${comparison.naive_spot.bunker_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Demurrage Risk:</span>
                <span className="text-rose-400 font-mono font-semibold">${comparison.naive_spot.demurrage_risk_usd.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
            Unmitigated anchorage queue delay
          </div>
        </div>

        {/* Strategy 2: Period Time Charter */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Strategy B</span>
              <span className="text-[10px] font-semibold bg-slate-800 text-sky-400 px-2 py-0.5 rounded">Hedging</span>
            </div>
            <h4 className="text-sm font-bold text-slate-200 mt-1">Period Time Charter (6-Month)</h4>
            <div className="text-2xl font-black text-slate-200 mt-2">
              ${comparison.period_charter.cost_per_mt_usd.toFixed(2)}
              <span className="text-xs font-normal text-slate-400"> /MT</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total: ${comparison.period_charter.total_landed_cost_usd.toLocaleString()}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
              <div className="flex justify-between">
                <span>Freight (7.5% Prem):</span>
                <span className="text-slate-200 font-mono">${comparison.period_charter.freight_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bunker Fuel (12.5 kn):</span>
                <span className="text-slate-200 font-mono">${comparison.period_charter.bunker_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Demurrage Risk:</span>
                <span className="text-amber-300 font-mono font-semibold">${comparison.period_charter.demurrage_risk_usd.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
            Fixed commitment, lacks spot trough flexibility
          </div>
        </div>

        {/* Strategy 3: PAD-CE Dynamic Optimal */}
        <div className="bg-gradient-to-b from-sky-950/80 to-slate-950 border-2 border-sky-500/70 rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-400 uppercase tracking-wider">Strategy C (AI Winner)</span>
              <span className="text-[10px] font-bold bg-sky-500 text-white px-2 py-0.5 rounded">PAD-CE</span>
            </div>
            <h4 className="text-sm font-bold text-white mt-1">Dynamic Dispatch + Slow Steaming</h4>
            <div className="text-2xl font-black text-emerald-400 mt-2">
              ${comparison.pad_ce_optimal.cost_per_mt_usd.toFixed(2)}
              <span className="text-xs font-normal text-slate-300"> /MT</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-0.5">
              Total: ${comparison.pad_ce_optimal.total_landed_cost_usd.toLocaleString()}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-300 border-t border-sky-800/60 pt-3">
              <div className="flex justify-between">
                <span>Freight ({optimal_charter_window.recommended_horizon}):</span>
                <span className="text-white font-mono font-bold">${comparison.pad_ce_optimal.freight_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bunker Fuel ({optimal_charter_window.optimal_steaming_speed_knots} kn):</span>
                <span className="text-emerald-300 font-mono font-bold">${comparison.pad_ce_optimal.bunker_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Demurrage (Queue-avoided):</span>
                <span className="text-emerald-400 font-mono font-bold">${comparison.pad_ce_optimal.demurrage_risk_usd.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-sky-900/60 flex items-center justify-between text-[11px]">
            <span className="text-sky-300 font-semibold">Speed: {optimal_charter_window.optimal_steaming_speed_knots} kn</span>
            <span className="text-emerald-400 font-bold">🌱 -{economic_impact.co2_emissions_avoided_mt.toFixed(0)} MT CO₂</span>
          </div>
        </div>
      </div>

      {/* SHAP Factor Attribution Section */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
          Explainable AI (XAI) Cost Saving Factor Attribution (SHAP Decomposition)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {shap_attribution.map((item, idx) => (
            <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium truncate" title={item.factor}>{item.factor}</span>
                <span className={`font-bold font-mono ${item.delta_usd >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                  {item.delta_usd >= 0 ? `+$${(item.delta_usd / 1000).toFixed(0)}k` : `-$${(Math.abs(item.delta_usd) / 1000).toFixed(0)}k`}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.delta_usd >= 0 ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${Math.min(100, Math.max(10, Math.abs(item.delta_pct)))}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">{item.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
