import React, { useRef, useEffect, useState } from 'react';
import { PortInfrastructure, VesselItinerary } from '../../types/fleet';

interface OceanRadarMapProps {
  port: PortInfrastructure;
  vessels: VesselItinerary[];
  selectedVesselId: string;
  onSelectVessel: (id: string) => void;
}

interface CursorTooltip {
  x: number;
  y: number;
  vessel: VesselItinerary | null;
  feature?: string;
}

export const OceanRadarMap: React.FC<OceanRadarMapProps> = ({
  port,
  vessels,
  selectedVesselId,
  onSelectVessel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tooltip, setTooltip] = useState<CursorTooltip | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let sweepAngle = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      // 1. Oceanic Deep-Foam Gradient Background
      const oceanGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 50, w * 0.5, h * 0.5, Math.max(w, h));
      oceanGrad.addColorStop(0, '#F8FAFC');
      oceanGrad.addColorStop(0.65, '#E0F2FE');
      oceanGrad.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      // Port Coordinate Translation Anchor
      const isParadip = port.portId === 'PARADIP';
      const portX = isParadip ? w * 0.76 : w * 0.68;
      const portY = isParadip ? h * 0.28 : h * 0.44;

      // 2. Range Rings & Nautical Bathymetry Grids
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.12)';
      ctx.lineWidth = 1;
      [100, 200, 320, 460].forEach((r) => {
        ctx.beginPath();
        ctx.arc(portX, portY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 3. Dynamic Coastline & Breakwaters
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (isParadip) {
        // Paradip Port North/South Breakwater & Mahanadi River Outflow
        ctx.moveTo(w * 0.58, 0);
        ctx.bezierCurveTo(w * 0.66, h * 0.18, portX - 40, portY - 10, portX, portY);
        ctx.lineTo(portX + 80, portY + 20);
        ctx.bezierCurveTo(portX + 120, portY + 60, w * 0.88, h * 0.6, w, h * 0.72);
        ctx.lineTo(w, 0);
      } else {
        // Krishnapatnam Port Buckingham Canal / Khandaleru River Entry
        ctx.moveTo(w * 0.50, 0);
        ctx.bezierCurveTo(w * 0.54, h * 0.25, portX - 30, portY - 30, portX, portY);
        ctx.bezierCurveTo(portX + 40, portY + 80, w * 0.78, h * 0.75, w * 0.82, h);
        ctx.lineTo(w, h);
        ctx.lineTo(w, 0);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 4. Dredged Navigation Channel & Fairway Corridor
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(portX - 260, portY + 180);
      ctx.lineTo(portX, portY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fairway Text
      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px JetBrains Mono';
      ctx.fillText(`APPROACH FAIRWAY (DEPTH: ${port.approachDepthMeters}m)`, portX - 250, portY + 195);

      // 5. Outer Anchorage Waiting Zone (DBSCAN Roadstead)
      const anchorX = portX - 160;
      const anchorY = portY + 80;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(anchorX, anchorY, 85, 50, Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(`OUTER ANCHORAGE (${port.currentQueueDepth} SHIPS WAITING)`, anchorX - 80, anchorY + 4);

      // 6. Terminal Berth Node
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(portX, portY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(port.berthName, portX + 16, portY + 4);

      // 7. Sweeping Radar Beam Animation
      sweepAngle += 0.018;
      ctx.save();
      ctx.translate(portX, portY);
      ctx.rotate(sweepAngle);
      const sweep = ctx.createRadialGradient(0, 0, 0, 0, 0, 360);
      sweep.addColorStop(0, 'rgba(14, 165, 233, 0.22)');
      sweep.addColorStop(1, 'rgba(14, 165, 233, 0.0)');
      ctx.fillStyle = sweep;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 360, 0, Math.PI / 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 8. Inbound Vessel Trajectory Vectors & Markers
      vessels.forEach((v, idx) => {
        const isSelected = v.id === selectedVesselId;
        const progress = Math.min(0.85, (5600 - v.distanceNm) / 5600 + idx * 0.16);
        const vx = w * 0.12 + progress * (portX - w * 0.12) + idx * 40;
        const vy = h * 0.85 - progress * (h * 0.85 - portY) + idx * 30;

        // Vessel Wake Corridor
        ctx.strokeStyle = isSelected ? '#0284C7' : 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.beginPath();
        ctx.moveTo(vx - 80, vy + 50);
        ctx.lineTo(vx, vy);
        ctx.stroke();

        // Pulsing Aura for Selected Ship
        if (isSelected) {
          ctx.fillStyle = 'rgba(2, 132, 199, 0.18)';
          ctx.beginPath();
          ctx.arc(vx, vy, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vessel Geometric Node
        ctx.fillStyle = isSelected ? '#0284C7' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(vx, vy, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0369A1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = isSelected ? '#0C4A6E' : '#334155';
        ctx.font = isSelected ? 'bold 11px JetBrains Mono' : '500 11px Inter, sans-serif';
        ctx.fillText(`${v.name} (${v.jitSpeedKn} kn)`, vx + 12, vy + 4);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [port, vessels, selectedVesselId]);

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const isParadip = port.portId === 'PARADIP';
    const portX = isParadip ? w * 0.76 : w * 0.68;
    const portY = isParadip ? h * 0.28 : h * 0.44;

    let match: VesselItinerary | null = null;
    vessels.forEach((v, idx) => {
      const progress = Math.min(0.85, (5600 - v.distanceNm) / 5600 + idx * 0.16);
      const vx = w * 0.12 + progress * (portX - w * 0.12) + idx * 40;
      const vy = h * 0.85 - progress * (h * 0.85 - portY) + idx * 30;

      if (Math.hypot(x - vx, y - vy) < 22) {
        match = v;
      }
    });

    setTooltip(match ? { x, y, vessel: match } : null);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sm border border-sky-200">
      <canvas
        ref={canvasRef}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setTooltip(null)}
        onClick={() => {
          if (tooltip?.vessel) onSelectVessel(tooltip.vessel.id);
        }}
        className="w-full h-full cursor-crosshair block"
      />

      {tooltip?.vessel && (
        <div
          className="absolute z-30 pointer-events-none bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-sky-200 text-slate-800 transition-all text-xs"
          style={{
            left: Math.min(window.innerWidth - 320, tooltip.x + 18),
            top: Math.min(480, tooltip.y - 30),
          }}
        >
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-sky-100">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm text-sky-950 font-mono">{tooltip.vessel.name}</span>
          </div>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Virtual Arrival Speed:</span>
              <span className="font-bold text-emerald-600">{tooltip.vessel.jitSpeedKn} Knots</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Distance to Quayside:</span>
              <span className="font-bold text-slate-900">{tooltip.vessel.distanceNm.toLocaleString()} NM</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-500">Berth Window ETA:</span>
              <span className="font-bold text-sky-700">+{tooltip.vessel.etaHours.toFixed(1)} Hours</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-slate-100">
              <span className="text-slate-500">Demurrage Saved:</span>
              <span className="font-bold text-emerald-700">₹{tooltip.vessel.demurrageSavedInrLakhs} Lakhs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
