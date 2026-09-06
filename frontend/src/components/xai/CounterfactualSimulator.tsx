import React from "react";
import { Sliders, FileText } from "lucide-react";

interface CounterfactualSimulatorProps {
  berthDelayHours: number;
  bunkerPrice: number;
  onDelayChange: (delayHrs: number) => void;
  onBunkerChange: (bunkerPrice: number) => void;
  onExportAudit: () => void;
}

export const CounterfactualSimulator: React.FC<CounterfactualSimulatorProps> = ({
  berthDelayHours,
  bunkerPrice,
  onDelayChange,
  onBunkerChange,
  onExportAudit
}) => {
  return (
    <div className="bg-[#0A0E17]/90 p-4 rounded-xl border border-[#1E293B] space-y-4">
      <div className="flex items-center space-x-2 pb-2.5 border-b border-[#1E293B]">
        <Sliders className="w-4 h-4 text-amber-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Counterfactual Reasoning Simulator
        </h3>
      </div>

      {/* 1. Berth Delay Sensitivity Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">Port Turnaround Slippage:</span>
          <span className="font-mono font-bold text-amber-400">
            {berthDelayHours > 0 ? `+${berthDelayHours.toFixed(1)} Hours` : "0h (On Schedule)"}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={48}
          step={2}
          value={berthDelayHours}
          onChange={(e) => onDelayChange(Number(e.target.value))}
          className="w-full accent-amber-400 bg-[#161F30] h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>0h</span>
          <span>+24h (1 Day Delay)</span>
          <span>+48h</span>
        </div>
      </div>

      {/* 2. Bunker Price Shock Slider */}
      <div className="space-y-1.5 pt-2 border-t border-[#1E293B]/70">
        <div className="flex justify-between text-xs">
          <span className="text-slate-300">VLSFO Bunker Fuel Price:</span>
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
          className="w-full accent-blue-500 bg-[#161F30] h-2 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>$450</span>
          <span>$620 Baseline</span>
          <span>$900</span>
        </div>
      </div>

      {/* 3. CVC/CAG Export Action Button */}
      <div className="pt-3 border-t border-[#1E293B]">
        <button
          onClick={onExportAudit}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all active:scale-[0.99]"
        >
          <FileText className="w-4 h-4" />
          <span>Export CVC / CAG Audit Dossier</span>
        </button>
        <span className="text-[10px] text-slate-400 text-center block mt-1.5">
          GFR 2017 Rule 144 & CVC Circular 02/05/2022 Signed SHA-256 Certificate
        </span>
      </div>
    </div>
  );
};
