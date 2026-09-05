import React from "react";

interface NavbarProps {
  activeRoute: string;
  onRouteChange: (route: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute,
  onRouteChange,
  onRefresh,
  loading
}) => {
  return (
    <nav className="bg-[#0b192c] text-white border-b border-sky-900/60 sticky top-0 z-40 px-6 py-3.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Emblem */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-black text-xl shadow-inner">
            ⚓
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white">PAD-CE</span>
              <span className="text-[10px] font-semibold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2 py-0.5 rounded-full">
                SIH26006 • Ministry of Steel
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Port-Aware Dynamic Chartering Engine • Capesize Bulk AI
            </p>
          </div>
        </div>

        {/* Route Selector & Controls */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-900/80 rounded-lg p-1 border border-slate-700/60">
            <button
              onClick={() => onRouteChange("gladstone_paradip")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeRoute === "gladstone_paradip"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Gladstone ➔ Paradip (5,600 NM)
            </button>
            <button
              onClick={() => onRouteChange("tanjung_vizag")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeRoute === "tanjung_vizag"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Tanjung Bara ➔ Vizag (2,900 NM)
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            title="Refresh AIS & Forecast Feeds"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
