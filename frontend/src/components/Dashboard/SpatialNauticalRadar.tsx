import React, { useState } from "react";
import { AISVessel } from "../../services/api";

interface SpatialNauticalRadarProps {
  portStatus: {
    port: string;
    port_name: string;
    queue_depth: number;
    berth_capacity: number;
    congestion_index: number;
    projected_queue_wait_days: number;
    projected_total_dwell_days: number;
    demurrage_risk_usd: number;
    demurrage_risk_inr_cr: number;
    clusters: Array<{
      cluster_id: number;
      label: string;
      zone_type: string;
      vessel_count: number;
      avg_speed_knots: number;
      avg_dwell_hours: number;
    }>;
  };
  vessels: AISVessel[];
  onPortToggle?: (port: string) => void;
}

export const SpatialNauticalRadar: React.FC<SpatialNauticalRadarProps> = ({
  portStatus,
  vessels,
  onPortToggle
}) => {
  const [selectedVessel, setSelectedVessel] = useState<AISVessel | null>(null);

  const isParadip = portStatus.port.toLowerCase().includes("paradip");
  const centerLat = isParadip ? 20.2644 : 17.6868;
  const centerLon = isParadip ? 86.6806 : 83.2985;
  const scale = 1400; // SVG coordinate scaling

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h3 className="text-base font-bold text-white tracking-wide">
              Spatial Nautical Radar (AIS)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            DBSCAN Spatial Density Clustering (ε=0.035°) • M/M/c Queuing Dwell • {portStatus.port_name}
          </p>
        </div>

        {/* Port Congestion Gauge Pill */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">Congestion Index</span>
            <span className={`text-sm font-black ${
              portStatus.congestion_index > 60 ? "text-rose-400" : portStatus.congestion_index > 35 ? "text-amber-400" : "text-emerald-400"
            }`}>
              {portStatus.congestion_index}%
            </span>
          </div>
        </div>
      </div>

      {/* Radar SVG Screen */}
      <div className="relative w-full aspect-video max-h-[260px] bg-[#07111e] rounded-xl border border-sky-950/70 overflow-hidden flex items-center justify-center">
        {/* Radar Rings & Crosshairs */}
        <svg className="w-full h-full" viewBox="0 0 400 220">
          <defs>
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
            </radialGradient>
          </defs>

          {/* Concentric distance rings */}
          <circle cx="200" cy="110" r="30" fill="none" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="200" cy="110" r="65" fill="none" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="200" cy="110" r="100" fill="none" stroke="#0ea5e9" strokeOpacity="0.15" strokeWidth="1" />

          {/* Crosshairs */}
          <line x1="200" y1="5" x2="200" y2="215" stroke="#0ea5e9" strokeOpacity="0.1" strokeWidth="1" />
          <line x1="10" y1="110" x2="390" y2="110" stroke="#0ea5e9" strokeOpacity="0.1" strokeWidth="1" />

          {/* Port Center Mark */}
          <circle cx="200" cy="110" r="4" fill="#38bdf8" />
          <text x="208" y="114" fill="#7dd3fc" fontSize="9" fontWeight="bold">
            {isParadip ? "Paradip Port" : "Vizag Port"}
          </text>

          {/* Anchorage Cluster Circle */}
          <ellipse
            cx="245"
            cy="110"
            rx="55"
            ry="45"
            fill="none"
            stroke="#f43f5e"
            strokeOpacity="0.3"
            strokeDasharray="4 2"
            strokeWidth="1.5"
          />
          <text x="250" y="65" fill="#fb7185" fontSize="8" fontWeight="bold">
            Anchorage Queue (Cluster 0)
          </text>

          {/* Vessel points plotted relative to center */}
          {vessels.slice(0, 45).map((v) => {
            const dx = (v.lon - centerLon) * scale;
            const dy = -(v.lat - centerLat) * scale;
            const cx = 200 + dx;
            const cy = 110 + dy;

            const isAnchored = v.status.includes("Anchor") || v.speed_knots < 0.6;
            const color = isAnchored ? "#fb7185" : "#34d399";

            return (
              <g
                key={v.mmsi}
                className="cursor-pointer transition-transform hover:scale-150"
                onClick={() => setSelectedVessel(v)}
              >
                <circle cx={cx} cy={cy} r="3" fill={color} opacity="0.85" />
                {isAnchored && (
                  <circle cx={cx} cy={cy} r="6" fill="none" stroke="#fb7185" opacity="0.3" />
                )}
              </g>
            );
          })}
        </svg>

        {/* Selected Vessel Overlay */}
        {selectedVessel && (
          <div className="absolute bottom-2 left-2 bg-slate-950/90 border border-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-300 z-10">
            <span className="font-bold text-white">{selectedVessel.name}</span> • MMSI: {selectedVessel.mmsi} • DWT: {selectedVessel.dwt.toLocaleString()} MT • Speed: {selectedVessel.speed_knots} kn • Dwell: {selectedVessel.days_in_anchorage}d
          </div>
        )}
      </div>

      {/* Queue & Dwell Metric Highlights */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Anchorage Queue</span>
          <div className="text-base font-bold text-rose-400 mt-0.5">
            {portStatus.queue_depth} <span className="text-xs text-slate-400 font-normal">Capesizes</span>
          </div>
          <span className="text-[10px] text-slate-500">Awaiting discharge berth</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Projected Dwell</span>
          <div className="text-base font-bold text-amber-300 mt-0.5">
            {portStatus.projected_total_dwell_days} <span className="text-xs text-slate-400 font-normal">Days</span>
          </div>
          <span className="text-[10px] text-slate-500">M/M/{portStatus.berth_capacity} Queue wait</span>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 block font-medium">Demurrage Risk</span>
          <div className="text-base font-bold text-rose-300 mt-0.5">
            ₹{portStatus.demurrage_risk_inr_cr} <span className="text-xs text-slate-400 font-normal">Cr</span>
          </div>
          <span className="text-[10px] text-slate-500">${(portStatus.demurrage_risk_usd / 1000).toFixed(0)}k exposure</span>
        </div>
      </div>
    </div>
  );
};
