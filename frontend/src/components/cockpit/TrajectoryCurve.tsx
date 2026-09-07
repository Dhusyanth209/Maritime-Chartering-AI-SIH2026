import React, { useRef, useState, useEffect } from 'react';
import { VesselItinerary, PortInfrastructure } from '../../types/fleet';

interface TrajectoryCurveProps {
  vessel: VesselItinerary;
  port: PortInfrastructure;
}

export const TrajectoryCurve: React.FC<TrajectoryCurveProps> = ({ vessel, port }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverData, setHoverData] = useState<{ x: number; y: number; time: number; dist: number; speed: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 220;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 30, right: 40, bottom: 40, left: 60 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;

    const maxDist = 6000;
    const maxTime = 600;

    const toX = (t: number) => pad.left + (t / maxTime) * pw;
    const toY = (d: number) => pad.top + (1 - d / maxDist) * ph;

    // Gridlines
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;

    for (let t = 0; t <= maxTime; t += 100) {
      const x = toX(t);
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, h - pad.bottom);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${t}h`, x - 10, h - pad.bottom + 18);
    }

    for (let d = 0; d <= maxDist; d += 1000) {
      const y = toY(d);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${d}`, pad.left - 35, y + 4);
    }

    const huawTime = vessel.distanceNm / vessel.baseSpeedKn;
    const jitTime = vessel.etaHours;

    // Roadstead Anchorage Delay Trap Box
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(toX(huawTime), toY(200), toX(jitTime) - toX(huawTime), toY(0) - toY(200));
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.strokeRect(toX(huawTime), toY(200), toX(jitTime) - toX(huawTime), toY(0) - toY(200));

    // Legacy HUAW Line
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(vessel.distanceNm));
    ctx.lineTo(toX(huawTime), toY(0));
    ctx.stroke();

    // Virtual Arrival JIT Line
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(vessel.distanceNm));
    ctx.lineTo(toX(jitTime), toY(0));
    ctx.stroke();

    if (hoverData) {
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(hoverData.x, hoverData.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [vessel, port, hoverData]);

  const handleCanvasHover = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 60;
    const padRight = 40;
    const pw = rect.width - padLeft - padRight;

    const maxTime = 600;
    const maxDist = 6000;

    const t = Math.max(0, Math.min(maxTime, ((x - padLeft) / pw) * maxTime));
    const d = Math.max(0, vessel.distanceNm - (vessel.jitSpeedKn * t));

    if (t <= vessel.etaHours) {
      const y = 30 + (1 - d / maxDist) * (rect.height - 70);
      setHoverData({ x, y, time: t, dist: d, speed: vessel.jitSpeedKn });
    } else {
      setHoverData(null);
    }
  };

  return (
    <div className="relative w-full bg-white rounded-2xl p-4 border border-sky-100 shadow-sm mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-semibold text-slate-700">
          Continuous Space-Time Trajectory: {vessel.name}
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          Hover cursor across any coordinate to inspect parameters
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasHover}
        onMouseLeave={() => setHoverData(null)}
        className="w-full h-[220px] block cursor-crosshair"
      />
      {hoverData && (
        <div
          className="absolute z-20 pointer-events-none bg-sky-950/90 text-white text-[11px] font-mono px-3 py-1.5 rounded-md shadow-lg border border-sky-400/30"
          style={{ left: hoverData.x + 10, top: hoverData.y - 30 }}
        >
          T: {hoverData.time.toFixed(1)}h | Rem: {Math.round(hoverData.dist)} NM | Spd: {hoverData.speed} kn
        </div>
      )}
    </div>
  );
};
