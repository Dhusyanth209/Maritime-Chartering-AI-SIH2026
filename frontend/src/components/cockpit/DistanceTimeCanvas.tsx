import React, { useRef, useEffect } from 'react';
import { VesselItinerary, PortInfrastructure } from '../../types/fleet';

interface DistanceTimeCanvasProps {
  vessel: VesselItinerary;
  port: PortInfrastructure;
}

export const DistanceTimeCanvas: React.FC<DistanceTimeCanvasProps> = ({ vessel, port }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI Scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 480;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(0, 0, width, height);

    // Grid Metrics
    const padding = { top: 40, right: 60, bottom: 50, left: 70 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    const maxDistance = 6000; // NM
    const maxTime = 600;      // Hours

    const getX = (t: number) => padding.left + (t / maxTime) * plotWidth;
    const getY = (d: number) => padding.top + (1 - d / maxDistance) * plotHeight;

    // Draw Gridlines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;

    for (let t = 0; t <= maxTime; t += 100) {
      const x = getX(t);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${t}h`, x, height - padding.bottom + 16);
    }

    for (let d = 0; d <= maxDistance; d += 1000) {
      const y = getY(d);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${d}`, padding.left - 10, y + 3);
    }

    // Berth Idle Delay Window (Red Hazard Box)
    const berthAvailTime = vessel?.etaHours || 480;
    const baseSpeed = vessel?.baseSpeedKn || 14.5;
    const distanceNm = vessel?.distanceNm || 5600;
    const huawArrivalTime = distanceNm / baseSpeed;
    
    ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
    ctx.fillRect(
      getX(huawArrivalTime),
      getY(150),
      getX(berthAvailTime) - getX(huawArrivalTime),
      getY(0) - getY(150)
    );
    ctx.strokeStyle = '#F43F5E';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(
      getX(huawArrivalTime),
      getY(150),
      getX(berthAvailTime) - getX(huawArrivalTime),
      getY(0) - getY(150)
    );
    ctx.setLineDash([]);

    ctx.fillStyle = '#F43F5E';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Roadstead Anchorage Delay Trap (Demurrage Loss)', getX(huawArrivalTime) + 10, getY(60));

    // 1. Legacy HUAW Slope (Red Line)
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(distanceNm));
    ctx.lineTo(getX(huawArrivalTime), getY(0));
    ctx.stroke();

    // 2. Optimal Virtual Arrival JIT Slope (Emerald Line)
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(distanceNm));
    ctx.lineTo(getX(berthAvailTime), getY(0));
    ctx.stroke();

    // End-point Markers
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(getX(berthAvailTime), getY(0), 5, 0, 2 * Math.PI);
    ctx.fill();

    // Axis Labels
    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Elapsed Voyage Time (Hours)', padding.left + plotWidth / 2, height - 12);

    ctx.save();
    ctx.translate(20, padding.top + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Distance to Destination (Nautical Miles)', 0, 0);
    ctx.restore();

  }, [vessel, port]);

  const vesselName = vessel?.name || "MV Bharat Pride";
  const optimalSpeed = vessel?.optimalSpeedKn ? `${vessel.optimalSpeedKn.toFixed(1)} kn` : "10.7 kn";
  const baseSpeed = vessel?.baseSpeedKn ? `${vessel.baseSpeedKn.toFixed(1)} kn` : "14.5 kn";

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E293B]">
        <span className="text-xs font-mono text-slate-300">
          Trajectory Slope Comparison: <strong className="text-white">{vesselName}</strong>
        </span>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 text-red-400">
            <span className="w-3 h-0.5 bg-red-500 inline-block" /> Legacy HUAW ({baseSpeed})
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Virtual Arrival ({optimalSpeed})
          </span>
        </div>
      </div>
      <canvas ref={canvasRef} className="w-full flex-grow" style={{ minHeight: '480px' }} />
    </div>
  );
};
