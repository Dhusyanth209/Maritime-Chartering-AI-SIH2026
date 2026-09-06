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
    if (typeof window === "undefined" || !canvasRef.current || !vessel) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 45, right: 70, bottom: 55, left: 80 };

    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Deep Obsidian / Dark Gunmetal canvas background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "#0B101B");
    bgGrad.addColorStop(1, "#070A11");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const maxDistance = vessel.distance_nm;
    const maxHours = Math.max(650, vessel.transit_hours_optimal + 120);

    const getX = (hours: number) => padding.left + (hours / maxHours) * plotWidth;
    const getY = (distNm: number) => padding.top + ((maxDistance - distNm) / maxDistance) * plotHeight;

    // 1. Grid Lines
    ctx.strokeStyle = "#1E293B";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Horizontal grid (Distance in NM)
    for (let d = 0; d <= maxDistance; d += 1000) {
      const y = getY(d);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "11px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "right";
      ctx.fillText(`${d.toLocaleString()} NM`, padding.left - 12, y + 4);
    }

    // Vertical grid (Time in Hours)
    for (let t = 0; t <= maxHours; t += 100) {
      const x = getX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "11px ui-monospace, SFMono-Regular, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t}h`, x, height - padding.bottom + 20);
    }
    ctx.setLineDash([]);

    // 2. Open Berth Allocation Slot (Emerald Shaded Target Window at distance = 0)
    const berthOpenHour = vessel.transit_hours_optimal;
    const berthCloseHour = berthOpenHour + 52.8; // Standard turnaround window
    const xBerthStart = getX(berthOpenHour);
    const xBerthEnd = getX(berthCloseHour);

    ctx.fillStyle = "rgba(16, 185, 129, 0.12)";
    ctx.fillRect(xBerthStart, padding.top, xBerthEnd - xBerthStart, plotHeight);
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(xBerthStart, padding.top, xBerthEnd - xBerthStart, plotHeight);

    ctx.fillStyle = "#10B981";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Synchronized Berth Slot (0h Queue)", (xBerthStart + xBerthEnd) / 2, padding.top - 14);

    // 3. Trajectory A: Legacy "Hurry-then-Wait" (HUAW)
    // Fast transit at 14.5 knots, arriving early at anchorage, then waiting
    const tBase = vessel.transit_hours_baseline;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(maxDistance));
    ctx.lineTo(getX(tBase), getY(0));
    // Flat line at distance = 0 representing outer anchorage delay
    ctx.lineTo(getX(berthOpenHour), getY(0));
    ctx.strokeStyle = "#F43F5E";
    ctx.lineWidth = 3;
    ctx.stroke();

    // HUAW Anchorage Delay Box
    const waitWidth = getX(berthOpenHour) - getX(tBase);
    ctx.fillStyle = "rgba(244, 63, 94, 0.16)";
    ctx.fillRect(getX(tBase), getY(0) - 28, waitWidth, 28);
    ctx.strokeStyle = "rgba(244, 63, 94, 0.5)";
    ctx.lineWidth = 1;
    ctx.strokeRect(getX(tBase), getY(0) - 28, waitWidth, 28);

    ctx.fillStyle = "#F43F5E";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      `Outer Anchorage Idling (${(berthOpenHour - tBase).toFixed(0)}h Demurrage Trap)`,
      (getX(tBase) + getX(berthOpenHour)) / 2,
      getY(0) - 10
    );

    // 4. Trajectory B: Command Sentinel (Virtual Arrival JIT)
    // Smooth, slow-steaming slope meeting berth opening slot exactly
    const tOpt = vessel.transit_hours_optimal;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(maxDistance));
    ctx.lineTo(getX(tOpt), getY(0));
    ctx.strokeStyle = "#10B981";
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // End-point circle markers
    ctx.fillStyle = "#F43F5E";
    ctx.beginPath();
    ctx.arc(getX(tBase), getY(0), 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#10B981";
    ctx.beginPath();
    ctx.arc(getX(tOpt), getY(0), 7, 0, Math.PI * 2);
    ctx.fill();

    // Origin Port Marker (Top Left)
    ctx.fillStyle = "#38BDF8";
    ctx.beginPath();
    ctx.arc(getX(0), getY(maxDistance), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Departure: Gladstone, QLD", getX(0) + 12, getY(maxDistance) + 4);

    // Destination Port Marker (Bottom)
    ctx.fillStyle = "#10B981";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`Arrival: ${destinationPortName} Berth`, getX(tOpt) + 12, getY(0) + 4);

    // Coordinate Axis Titles
    ctx.fillStyle = "#94A3B8";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Voyage Distance to Port (Nautical Miles)", 15, padding.top - 14);
    ctx.textAlign = "center";
    ctx.fillText("Elapsed Voyage Duration (Hours from Departure) ➔", width / 2, height - 16);

  }, [vessel, destinationPortName]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={960}
        height={500}
        className="w-full h-auto max-h-[510px] rounded-xl border border-[#1E293B] shadow-inner"
      />
    </div>
  );
};
