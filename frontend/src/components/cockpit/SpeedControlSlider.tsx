import React from "react";
import { Gauge, RotateCcw } from "lucide-react";
import { VesselOptimizationDetail } from "../../types/fleet";

interface SpeedControlSliderProps {
  vessel?: VesselOptimizationDetail;
  operatorSpeed: number | null;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
}

export const SpeedControlSlider: React.FC<SpeedControlSliderProps> = ({
  vessel,
  operatorSpeed,
  onSpeedChange,
  onReset
}) => {
  const currentVal = operatorSpeed ?? (vessel?.optimal_speed_clamped || 11.0);
  const isOverridden = operatorSpeed !== null;

  return (
    <div className="w-full bg-[#0A0E17]/80 p-4 rounded-xl border border-[#1E293B] mt-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-slate-200">
            Interactive Fleet Velocity Governor
          </span>
          {isOverridden && (
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
              Manual Override Active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-mono">
            <span className="text-slate-400">Current Velocity:</span>{" "}
            <span className="text-base font-black text-white">{currentVal.toFixed(1)}</span>{" "}
            <span className="text-slate-400">knots</span>
          </div>

          {isOverridden && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300 font-semibold bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-lg transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset to Optimal</span>
            </button>
          )}
        </div>
      </div>

      <div className="relative mt-2">
        <input
          type="range"
          min={10.0}
          max={25.0}
          step={0.1}
          value={currentVal}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          className="w-full accent-emerald-400 bg-[#161F30] h-2 rounded-lg cursor-pointer"
        />

        {/* Speed Reference Markings */}
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1.5">
          <span>10.0 kn (Slow-Steaming Floor)</span>
          <span className="text-emerald-400 font-bold">
            11.0 kn (PAD-CE IP Target)
          </span>
          <span className="text-rose-400">
            14.5 kn (Legacy HUAW)
          </span>
          <span>25.0 kn (Max Boundary)</span>
        </div>
      </div>
    </div>
  );
};
