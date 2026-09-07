import React, { useRef, useState, useEffect } from 'react';
import { VesselItinerary, PortInfrastructure } from '../../types/fleet';

interface TrajectoryCurveProps {
  vessel: VesselItinerary;
  port: PortInfrastructure;
}

export const TrajectoryCurve: React.FC<TrajectoryCurveProps> = ({ vessel, port }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrub, setScrub] = useState<{ x: number; y: number; time: number; dist: number; speed: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI Retina/4K Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 25, right: 35, bottom: 35, left: 60 };
    const pw = w - pad.left - pad.right;
    const ph = h - pad.top - pad.bottom;

    const maxDist = 6000;
    const maxTime = 600;

    const toX = (t: number) => pad.left + (t / maxTime) * pw;
    const toY = (d: number) => pad.top + (1 - d / maxDist) * ph;

    // Grid System
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
      ctx.fillText(`${t}h`, x - 8, h - pad.bottom + 16);
    }

    for (let d = 0; d <= maxDist; d += 1500) {
      const y = toY(d);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${d}`, pad.left - 38, y + 4);
    }

    const huawArrival = vessel.distanceNm / vessel.baseSpeedKn;
    const jitArrival = vessel.etaHours;

    // Outer Anchorage Idling Delay Box
    ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
    ctx.fillRect(toX(huawArrival), toY(250), toX(jitArrival) - toX(huawArrival), toY(0) - toY(250));
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.strokeRect(toX(huawArrival), toY(250), toX(jitArrival) - toX(huawArrival), toY(0) - toY(250));

    // Outer Anchorage Label in delay box
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 9px JetBrains Mono';
    ctx.fillText('Outer Anchorage Idle Delay', toX(huawArrival) + 8, toY(120));

    // Legacy HUAW Slope
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(vessel.distanceNm));
    ctx.lineTo(toX(huawArrival), toY(0));
    ctx.stroke();

    // Virtual Arrival JIT Slope
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(vessel.distanceNm));
    ctx.lineTo(toX(jitArrival), toY(0));
    ctx.stroke();

    // Active Crosshair Guide Lines
    if (scrub) {
      ctx.save();
      ctx.strokeStyle = 'rgba(5, 150, 105, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      // Horizontal Crosshair
      ctx.beginPath();
      ctx.moveTo(pad.left, scrub.y);
      ctx.lineTo(w - pad.right, scrub.y);
      ctx.stroke();

      // Vertical Crosshair
      ctx.beginPath();
      ctx.moveTo(scrub.x, pad.top);
      ctx.lineTo(scrub.x, h - pad.bottom);
      ctx.stroke();
      ctx.restore();

      // Glowing Scrubber Marker on Green Slope
      ctx.save();
      ctx.fillStyle = '#059669';
      ctx.shadowColor = 'rgba(5, 150, 105, 0.7)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(scrub.x, scrub.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();
    }
  }, [vessel, port, scrub]);

  const handleScrub = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const padLeft = 60;
    const padRight = 35;
    const pw = rect.width - padLeft - padRight;
    const ph = rect.height - 25 - 35;

    const maxTime = 600;
    const maxDist = 6000;

    const t = Math.max(0, Math.min(maxTime, ((x - padLeft) / pw) * maxTime));

    if (t <= vessel.etaHours && x >= padLeft && x <= rect.width - padRight) {
      const d = Math.max(0, vessel.distanceNm - vessel.jitSpeedKn * t);
      const y = 25 + (1 - d / maxDist) * ph;
      setScrub({ x, y, time: t, dist: d, speed: vessel.jitSpeedKn });
    } else {
      setScrub(null);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-white rounded-2xl p-4 border border-sky-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-xs font-mono font-bold text-slate-800">
            Space-Time Coordinate Profile (L × t): {vessel.name}
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Hover cursor across green line to scrub trajectory
        </span>
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={handleScrub}
        onMouseLeave={() => setScrub(null)}
        className="w-full h-[210px] block cursor-crosshair"
      />
      {scrub && (
        <div
          className="absolute z-20 pointer-events-none bg-sky-950/95 backdrop-blur-md text-white text-[11px] font-mono p-2.5 rounded-xl shadow-xl border border-sky-300/30 flex flex-col gap-1 min-w-[220px]"
          style={{
            left: Math.min(520, Math.max(20, scrub.x + 14)),
            top: Math.max(16, scrub.y - 40),
          }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-sky-800/60 pb-1 text-slate-300">
            <span>Time Elapsed:</span>
            <span className="text-white font-bold">{scrub.time.toFixed(1)} hrs</span>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-sky-800/60 pb-1 text-slate-300">
            <span>Remaining Distance:</span>
            <span className="text-white font-bold">{Math.round(scrub.dist)} NM</span>
          </div>
          <div className="flex items-center justify-between gap-2 text-emerald-300">
            <span>Calculated Cruising Speed:</span>
            <span className="text-emerald-400 font-bold">{scrub.speed.toFixed(1)} kn</span>
          </div>
        </div>
      )}
    </div>
  );
};
