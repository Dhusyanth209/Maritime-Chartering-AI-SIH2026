import React, { useRef, useEffect } from "react";
import { VesselOptimizationDetail } from "../../types/fleet";

interface DistanceTimeCanvasProps {
  vessel?: VesselOptimizationDetail;
  destinationPortName: string;
}

export const DistanceTimeCanvas: React.FC<DistanceTimeCanvasProps> = ({
  vessel,
  destinationPortName
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // SSR guard
    if (typeof window === "undefined" || !canvasRef.current || !vessel) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas coordinate dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 60, bottom: 50, left: 70 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0D1525");
    bgGrad.addColorStop(1, "#070B12");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const maxDistance = vessel.distance_nm;
    const maxHours = Math.max(650, vessel.transit_hours_optimal + 120);

    const getX = (hours: number) => padding.left + (hours / maxHours) * plotWidth;
    const getY = (distNm: number) => padding.top + ((maxDistance - distNm) / maxDistance) * plotHeight;

    // 1. Draw Grid Lines
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal grid (Distance)
    for (let d = 0; d <= maxDistance; d += 1000) {
      const y = getY(d);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "10px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${d.toLocaleString()} NM`, padding.left - 10, y + 3);
    }

    // Vertical grid (Time Hours)
    for (let t = 0; t <= maxHours; t += 100) {
      const x = getX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "10px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t}h`, x, height - padding.bottom + 18);
    }
    ctx.setLineDash([]);

    // 2. Open Berth Allocation Window (Green shaded target region at distance = 0)
    const berthOpenHour = vessel.transit_hours_optimal;
    const berthCloseHour = berthOpenHour + 52.8; // Turnaround window
    const xBerthStart = getX(berthOpenHour);
    const xBerthEnd = getX(berthCloseHour);

    ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
    ctx.fillRect(xBerthStart, padding.top, xBerthEnd - xBerthStart, plotHeight);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xBerthStart, padding.top, xBerthEnd - xBerthStart, plotHeight);

    ctx.fillStyle = "#10B981";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Synchronized Berth Slot", (xBerthStart + xBerthEnd) / 2, padding.top - 12);

    // 3. Trajectory A: Legacy Hurry-then-Wait (HUAW)
    // Steams fast at 14.5 kn to Port (dist = 0 at t_base), then waits flat at anchor
    const tBase = vessel.transit_hours_baseline;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(maxDistance));
    ctx.lineTo(getX(tBase), getY(0));
    // Flat line representing outer anchorage wait
    ctx.lineTo(getX(berthOpenHour), getY(0));
    ctx.strokeStyle = "#F43F5E";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // HUAW Anchorage Trap Indicator Box
    ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
    ctx.fillRect(getX(tBase), getY(0) - 20, getX(berthOpenHour) - getX(tBase), 20);
    ctx.fillStyle = "#F43F5E";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Anchorage Idling (${(berthOpenHour - tBase).toFixed(0)}h Demurrage Trap)`,
      (getX(tBase) + getX(berthOpenHour)) / 2,
      getY(0) - 6
    );

    // 4. Trajectory B: Command Sentinel (Virtual Arrival JIT)
    // Smooth, slow-steaming trajectory arriving directly at berth opening
    const tOpt = vessel.transit_hours_optimal;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(maxDistance));
    ctx.lineTo(getX(tOpt), getY(0));
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3;
    ctx.stroke();

    // End-point marker circles
    ctx.fillStyle = "#F43F5E";
    ctx.beginPath();
    ctx.arc(getX(tBase), getY(0), 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(getX(tOpt), getY(0), 6, 0, Math.PI * 2);
    ctx.fill();

    // Axis Labels
    ctx.fillStyle = "#94A3B8";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Voyage Distance (NM)", 15, padding.top - 12);
    ctx.textAlign = "center";
    ctx.fillText("Elapsed Voyage Time (Hours) ➔", width / 2, height - 12);

  }, [vessel, destinationPortName]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex flex-wrap items-center justify-between text-xs text-slate-300 pb-2 mb-2 border-b border-[#1E293B]">
        <div>
          <span className="font-bold text-white">Space-Time Trajectory Slope (L × t)</span>
          <span className="text-slate-400 ml-2">
            {vessel ? `${vessel.name} (${vessel.distance_nm.toLocaleString()} NM ➔ ${destinationPortName})` : ""}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-0.5 bg-rose-500"></div>
            <span className="text-rose-400 font-medium">HUAW ({vessel?.baseline_speed_knots} kn + Wait)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-0.5 bg-emerald-400"></div>
            <span className="text-emerald-400 font-medium">JIT Virtual Arrival ({vessel?.optimal_speed_clamped} kn)</span>
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={780}
        height={340}
        className="w-full h-auto max-h-[360px] rounded-xl border border-[#1E293B]/80 shadow-inner"
      />
    </div>
  );
};
