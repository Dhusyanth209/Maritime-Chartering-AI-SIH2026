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
    <div className="w-full h-full flex flex-col justify-between">
      {/* Radar SVG Screen */}
      <div className="relative w-full h-[500px] bg-[#070D18] rounded-xl border border-[#1E293B] overflow-hidden flex items-center justify-center shadow-inner">
        <svg className="w-full h-full" viewBox="0 0 900 480">
          <defs>
            <radialGradient id="radarScanLarge" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
            </radialGradient>
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
          </defs>

          {/* Background grid */}
          <rect width="900" height="480" fill="url(#radarGrid)" />

          {/* Distance range rings */}
          <circle cx="450" cy="240" r="70" fill="none" stroke="#2563EB" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx="450" cy="240" r="140" fill="none" stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="450" cy="240" r="210" fill="none" stroke="#2563EB" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="450" cy="240" r="280" fill="none" stroke="#2563EB" strokeOpacity="0.1" strokeWidth="1" />

          {/* Nautical Range Ring Labels */}
          <text x="455" y="165" fill="#64748B" fontSize="10" fontFamily="monospace">5 NM</text>
          <text x="455" y="95" fill="#64748B" fontSize="10" fontFamily="monospace">10 NM</text>
          <text x="455" y="25" fill="#64748B" fontSize="10" fontFamily="monospace">15 NM</text>

          {/* Crosshairs */}
          <line x1="450" y1="20" x2="450" y2="460" stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="50" y1="240" x2="850" y2="240" stroke="#2563EB" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="3 3" />

          {/* Roadstead Outer Anchorage Area Polygon (DBSCAN Cluster: red polygon) */}
          <polygon
            points="540,130 680,110 720,270 570,300"
            fill="rgba(244, 63, 94, 0.14)"
            stroke="#F43F5E"
            strokeWidth="2"
            strokeDasharray="6 3"
          />
          <rect x="550" y="92" width="230" height="22" rx="4" fill="#0A0E17" stroke="#F43F5E" strokeWidth="0.8" />
          <text x="560" y="107" fill="#FB7185" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            Outer Anchorage Congestion (DBSCAN ε=0.035°)
          </text>

          {/* Fairway Pilot Approach Channel */}
          <polyline
            points="120,240 380,240 440,240"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3.5"
            strokeDasharray="8 4"
            opacity="0.7"
          />
          <rect x="130" y="215" width="180" height="20" rx="4" fill="#0A0E17" stroke="#38BDF8" strokeWidth="0.8" />
          <text x="140" y="229" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            Deep-Water Fairway Channel
          </text>

          {/* Port Discharging Terminal Center */}
          <rect x="420" y="210" width="60" height="60" rx="8" fill="#111827" stroke="#10B981" strokeWidth="2.5" />
          <text x="450" y="244" fill="#10B981" fontSize="13" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
            PORT
          </text>
          <text x="450" y="258" fill="#94A3B8" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
            BERTH 1 & 2
          </text>

          {/* Anchored Waiting Vessels in Outer Anchorage (Hurry-then-Wait victims) */}
          <g>
            <circle cx="590" cy="170" r="5" fill="#F43F5E" />
            <circle cx="630" cy="150" r="5" fill="#F43F5E" />
            <circle cx="670" cy="200" r="5" fill="#F43F5E" />
            <circle cx="620" cy="240" r="5" fill="#F43F5E" />
            <circle cx="580" cy="220" r="5" fill="#F43F5E" />
            <circle cx="660" cy="260" r="5" fill="#F43F5E" />
            <text x="600" y="145" fill="#F43F5E" fontSize="9" fontWeight="bold" fontFamily="monospace">
              6 Capesize Anchored (Avg 38h Delay)
            </text>
          </g>

          {/* JIT Synchronized Vessel on approach (MV Bharat Pride) */}
          <g>
            <circle cx="280" cy="240" r="7" fill="#10B981" />
            <circle cx="280" cy="240" r="14" fill="none" stroke="#10B981" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
            <circle cx="280" cy="240" r="22" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.3" />
            <rect x="220" y="260" width="160" height="24" rx="4" fill="#0A0E17" stroke="#10B981" strokeWidth="1" />
            <text x="230" y="276" fill="#34D399" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              MV Bharat Pride (10.7 kn JIT)
            </text>
          </g>
        </svg>

        {/* Port Status Floating Badge */}
        {currentPort && (
          <div className="absolute top-4 right-4 bg-[#0A0E17]/90 border border-[#1E293B] px-3.5 py-2 rounded-xl text-xs flex items-center space-x-3 backdrop-blur-md">
            <span className="text-slate-400 font-medium">Roadstead Status:</span>
            <span className="text-rose-400 font-bold font-mono">Queue: {currentPort.queue_depth_vessels} Ships</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-bold font-mono">Wait: {currentPort.avg_anchorage_wait_hours}h</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-bold font-mono">{currentPort.congestion_index_pct}% Congested</span>
          </div>
        )}

        {/* Port Berth Status Strip (Bottom) */}
        {currentPort && (
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-[#0A0E17]/95 border border-[#1E293B] px-4 py-2.5 rounded-xl text-xs backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-300">Active Port Berths:</span>
              {currentPort.berth_locations.map((b) => (
                <span
                  key={b.berth_id}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] ${
                    b.status === "RESERVED_PAD_CE"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                      : b.status === "OPEN"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold"
                      : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {b.berth_id}: {b.status} {b.eta_clear_hrs > 0 ? `(${b.eta_clear_hrs}h)` : ""}
                </span>
              ))}
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              Demurrage Hazard: ${currentPort.demurrage_hazard_hourly_usd.toLocaleString()}/hr
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
