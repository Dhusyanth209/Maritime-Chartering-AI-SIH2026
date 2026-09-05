import React from "react";

interface HeaderProps {
  bdi: number;
  bci: number;
  vlsfo: number;
  currentSpot: number;
  congestionIndex: number;
  cargoMt: number;
  onCargoChange: (mt: number) => void;
  triggerSignal: string;
}

export const Header: React.FC<HeaderProps> = ({
  bdi,
  bci,
  vlsfo,
  currentSpot,
  congestionIndex,
  cargoMt,
  onCargoChange,
  triggerSignal
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0b192c] to-slate-900 border-b border-slate-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Ticker Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* BDI */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3.5 py-2">
            <span className="text-[11px] font-medium text-slate-400 block">Baltic Dry Index</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-bold text-white">{bdi.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-emerald-400">+1.8%</span>
            </div>
          </div>

          {/* BCI */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3.5 py-2">
            <span className="text-[11px] font-medium text-slate-400 block">Capesize (BCI)</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-bold text-sky-400">{bci.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-sky-300">pts</span>
            </div>
          </div>

          {/* Bunker Fuel */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3.5 py-2">
            <span className="text-[11px] font-medium text-slate-400 block">VLSFO Singapore</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-bold text-amber-300">${vlsfo.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400">/MT</span>
            </div>
          </div>

          {/* Current Spot */}
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl px-3.5 py-2">
            <span className="text-[11px] font-medium text-slate-400 block">Spot Charter Rate</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-base font-bold text-emerald-400">${currentSpot.toFixed(2)}</span>
              <span className="text-[10px] text-slate-400">/MT</span>
            </div>
          </div>
        </div>

        {/* Cargo Size Controller & Trigger Pill */}
        <div className="flex items-center space-x-4 w-full lg:w-auto justify-end">
          <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl">
            <span className="text-xs font-semibold text-slate-300">Cargo Volume:</span>
            <select
              value={cargoMt}
              onChange={(e) => onCargoChange(Number(e.target.value))}
              className="bg-slate-900 border border-slate-600 rounded-lg text-xs font-bold text-sky-400 px-2.5 py-1 focus:outline-none focus:border-sky-500"
            >
              <option value={150000}>150,000 MT</option>
              <option value={160000}>160,000 MT (Standard)</option>
              <option value={175000}>175,000 MT</option>
              <option value={180000}>180,000 MT (Heavy)</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-sky-950/80 border border-sky-600/50 px-3.5 py-2 rounded-xl">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
            <div className="text-xs font-bold text-sky-200">
              Trigger: <span className="text-emerald-400 font-extrabold">{triggerSignal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
