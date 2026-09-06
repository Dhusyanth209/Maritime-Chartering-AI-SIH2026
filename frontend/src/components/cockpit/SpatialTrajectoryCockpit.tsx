import React from "react";
import { Navigation, Clock, Ship } from "lucide-react";
import { DistanceTimeCanvas } from "./DistanceTimeCanvas";
import { MaritimeRadarMap } from "./MaritimeRadarMap";
import { VesselOptimizationDetail, PortTelemetryResponse } from "../../types/fleet";

interface SpatialTrajectoryCockpitProps {
  viewMode: "canvas" | "radar";
  onViewModeChange: (mode: "canvas" | "radar") => void;
  vessel?: VesselOptimizationDetail;
  destinationPortName: string;
  telemetry?: PortTelemetryResponse;
  selectedPort: string;
}

export const SpatialTrajectoryCockpit: React.FC<SpatialTrajectoryCockpitProps> = ({
  viewMode,
  onViewModeChange,
  vessel,
  destinationPortName,
  telemetry,
  selectedPort
}) => {
  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 shadow-xl flex flex-col justify-between min-h-[640px]">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            {viewMode === "radar" ? <Navigation className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-white">
              {viewMode === "radar" ? "Geospatial AIS Radar & Port Roadstead" : "Space-Time Trajectory Vector (L × t)"}
            </h2>
            <p className="text-[11px] text-slate-400">
              {viewMode === "radar"
                ? "DBSCAN Anchorage Clustering & Berth Queuing Telemetry"
                : "Real-time Virtual Arrival JIT Slope vs. Legacy Hurry-then-Wait"}
            </p>
          </div>
        </div>

        {/* View Mode Toggle Pill */}
        <div className="flex items-center bg-[#0A0E17] p-1 rounded-xl border border-[#1E293B]">
          <button
            onClick={() => onViewModeChange("radar")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "radar"
                ? "bg-[#2563EB] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🛰️</span>
            <span>AIS Radar Map</span>
          </button>
          <button
            onClick={() => onViewModeChange("canvas")}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "canvas"
                ? "bg-[#2563EB] text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📈</span>
            <span>Distance-Time Vector (L × t)</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area (Height: 500-560px min) */}
      <div className="my-3 flex-1 flex items-center justify-center min-h-[500px]">
        {viewMode === "canvas" ? (
          <DistanceTimeCanvas
            vessel={vessel}
            destinationPortName={destinationPortName}
          />
        ) : (
          <MaritimeRadarMap
            telemetry={telemetry}
            selectedPort={selectedPort}
          />
        )}
      </div>

      {/* Active Vessel Focus Strip (Bottom of canvas) */}
      <div className="pt-3 border-t border-[#1E293B]">
        <div className="bg-[#0A0E17]/80 border border-[#1E293B] px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                Flagship Under Active Guidance
              </span>
              <span className="font-black text-white font-sans">
                {vessel?.name || "MV Bharat Pride"}
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-4 font-mono text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Distance:</span>
              <span className="font-bold text-slate-200">
                {vessel?.distance_nm ? `${vessel.distance_nm.toLocaleString()} NM` : "5,600 NM"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Cargo:</span>
              <span className="font-bold text-slate-200">
                {vessel?.cargo_mt ? `${(vessel.cargo_mt / 1000).toFixed(0)}k MT` : "160k MT"} Coking Coal
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">JIT Cruising:</span>
              <span className="font-bold text-emerald-400">
                {vessel?.optimal_speed_clamped ? `${vessel.optimal_speed_clamped} kn` : "10.7 kn"}
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">ETA Status:</span>
              <span className="font-bold text-purple-400">
                +{vessel?.transit_hours_optimal ? vessel.transit_hours_optimal.toFixed(0) : "480"}h (Slot Matched)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
