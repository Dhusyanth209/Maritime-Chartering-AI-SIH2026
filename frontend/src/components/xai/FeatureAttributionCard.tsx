import React from "react";
import { BrainCircuit, Compass } from "lucide-react";
import { FeatureAttribution, GoncalvesEvaluation } from "../../types/fleet";

interface FeatureAttributionCardProps {
  attributions: FeatureAttribution[];
  goncalves: GoncalvesEvaluation;
}

export const FeatureAttributionCard: React.FC<FeatureAttributionCardProps> = ({
  attributions,
  goncalves
}) => {
  return (
    <div className="space-y-4">
      {/* 1. Gonçalves Continuous Stopping Boundary */}
      <div className="bg-[#0A0E17]/90 p-4 rounded-xl border border-[#1E293B]">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Gonçalves HJB Stopping Trigger
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            goncalves.action === "COMMIT_NOW"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-blue-500/20 text-blue-300 border-blue-500/40"
          }`}>
            {goncalves.action}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-[#161F30]/60 p-2.5 rounded-lg border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-medium">Optimal Trigger S*</span>
            <span className="text-base font-black text-white font-mono">
              ${goncalves.optimal_stopping_s_star.toFixed(2)}
              <span className="text-xs text-slate-400 font-normal"> /MT</span>
            </span>
          </div>

          <div className="bg-[#161F30]/60 p-2.5 rounded-lg border border-[#1E293B]">
            <span className="text-[10px] text-slate-400 block font-medium">Tail Risk Bound (R_∞)</span>
            <span className="text-base font-black text-rose-400 font-mono">
              ${goncalves.tail_risk_bound_r_inf.toLocaleString()}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed bg-[#161F30]/40 p-2 rounded-lg border border-[#1E293B]/60">
          {goncalves.decision_rationale}
        </p>
      </div>

      {/* 2. Subdifferential Cost Saving Attribution (XAI) */}
      <div className="bg-[#0A0E17]/90 p-4 rounded-xl border border-[#1E293B]">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-[#1E293B]">
          <BrainCircuit className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Subdifferential Cost Factor Decomposition
          </h3>
        </div>

        <div className="space-y-3 mt-3">
          {attributions.map((attr, idx) => (
            <div key={idx} className="text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium truncate max-w-[200px]" title={attr.feature}>
                  {attr.feature}
                </span>
                <span className={`font-mono font-bold ${attr.impact_usd > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                  {attr.impact_usd > 0 ? `+$${(attr.impact_usd / 1000).toFixed(0)}k` : "0k"}
                </span>
              </div>
              <div className="w-full bg-[#161F30] h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                  style={{ width: `${Math.max(5, attr.percentage_contribution)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>{attr.direction}</span>
                <span>{attr.percentage_contribution}% of total delta</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
