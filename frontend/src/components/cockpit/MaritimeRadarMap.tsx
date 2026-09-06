import React from "react";
import { PortTelemetryResponse, PortStatusDetail } from "../../types/fleet";

interface MaritimeRadarMapProps {
  telemetry?: PortTelemetryResponse;
  selectedPort: string;
}

export const MaritimeRadarMap: React.FC<MaritimeRadarMapProps> = ({
  telemetry,
  selectedPort
}) => {
  const currentPort: PortStatusDetail | undefined = telemetry?.ports[selectedPort];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-300 pb-2 mb-2 border-b border-[#1E293B]">
        <div>
          <span className="font-bold text-white">Geospatial AIS Radar & Roadstead Polygons</span>
          <span className="text-slate-400 ml-2">
            {currentPort ? `${currentPort.name} • ${currentPort.berths} Berths` : ""}
          </span>
        </div>
        {currentPort && (
          <div className="flex items-center space-x-3 font-mono text-[11px]">
            <span className="text-rose-400">Queue: {currentPort.queue_depth_vessels} Ships</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-400">Wait: {currentPort.avg_anchorage_wait_hours}h</span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400">Congestion: {currentPort.congestion_index_pct}%</span>
          </div>
        )}
      </div>

      {/* Radar SVG Screen */}
      <div className="relative w-full aspect-[16/7] max-h-[340px] bg-[#070D18] rounded-xl border border-sky-950/70 overflow-hidden flex items-center justify-center shadow-inner">
        <svg className="w-full h-full" viewBox="0 0 500 240">
          <defs>
            <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
            </radialGradient>
          </defs>

          {/* Distance range rings */}
          <circle cx="250" cy="120" r="35" fill="none" stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="250" cy="120" r="75" fill="none" stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="250" cy="120" r="115" fill="none" stroke="#2563EB" strokeOpacity="0.15" strokeWidth="1" />

          {/* Crosshairs */}
          <line x1="250" y1="10" x2="250" y2="230" stroke="#2563EB" strokeOpacity="0.15" strokeWidth="1" />
          <line x1="20" y1="120" x2="480" y2="120" stroke="#2563EB" strokeOpacity="0.15" strokeWidth="1" />

          {/* Roadstead Anchorage Area Polygon (DBSCAN Cluster) */}
          <polygon
            points="280,75 350,65 370,140 295,155"
            fill="rgba(244, 63, 94, 0.15)"
            stroke="#F43F5E"
            strokeWidth="1.5"
            strokeDasharray="4 2"
          />
          <text x="300" y="60" fill="#FB7185" fontSize="9" fontWeight="bold">
            Outer Anchorage Holding Zone (DBSCAN ε=0.035°)
          </text>

          {/* Fairway Pilot Channel */}
          <polyline
            points="180,120 250,120 290,120"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeDasharray="6 3"
            opacity="0.6"
          />
          <text x="175" y="110" fill="#38BDF8" fontSize="8">
            Fairway Approach Channel
          </text>

          {/* Discharging Port Terminal Center */}
          <rect x="235" y="105" width="30" height="30" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
          <text x="250" y="122" fill="#10B981" fontSize="9" fontWeight="black" textAnchor="middle">
            PORT
          </text>

          {/* Anchored Vessels awaiting berths */}
          <g>
            <circle cx="310" cy="95" r="3.5" fill="#F43F5E" />
            <circle cx="330" cy="85" r="3.5" fill="#F43F5E" />
            <circle cx="345" cy="115" r="3.5" fill="#F43F5E" />
            <circle cx="325" cy="135" r="3.5" fill="#F43F5E" />
            <circle cx="300" cy="120" r="3.5" fill="#F43F5E" />
          </g>

          {/* JIT Synchronized Vessel on approach */}
          <g>
            <circle cx="160" cy="120" r="5" fill="#10B981" />
            <circle cx="160" cy="120" r="10" fill="none" stroke="#10B981" opacity="0.4" className="animate-ping" />
            <text x="140" y="140" fill="#34D399" fontSize="8" fontWeight="bold">
              MV Bharat Pride (11.0 kn JIT)
            </text>
          </g>
        </svg>

        {/* Port Berth Status Strip */}
        {currentPort && (
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between bg-[#0A0E17]/90 border border-[#1E293B] px-3 py-1.5 rounded-lg text-[10px]">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-300">Operational Berths:</span>
              {currentPort.berth_locations.map((b) => (
                <span
                  key={b.berth_id}
                  className={`px-2 py-0.5 rounded font-mono ${
                    b.status === "RESERVED_PAD_CE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : b.status === "OPEN"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {b.berth_id}: {b.status} {b.eta_clear_hrs > 0 ? `(${b.eta_clear_hrs}h)` : ""}
                </span>
              ))}
            </div>
            <span className="text-slate-400">Demurrage Hazard: ${currentPort.demurrage_hazard_hourly_usd.toLocaleString()}/hr</span>
          </div>
        )}
      </div>
    </div>
  );
};
