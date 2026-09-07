import React, { useRef, useEffect, useState } from 'react';
import { PortInfrastructure, VesselItinerary } from '../../types/fleet';

interface OceanRadarMapProps {
  port: PortInfrastructure;
  vessels: VesselItinerary[];
  selectedVesselId: string;
  onSelectVessel: (id: string) => void;
  pulseTrajectory?: boolean;
}

interface CursorTooltip {
  x: number;
  y: number;
  vessel: VesselItinerary | null;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const OceanRadarMap: React.FC<OceanRadarMapProps> = ({
  port,
  vessels,
  selectedVesselId,
  onSelectVessel,
  pulseTrajectory = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tooltip, setTooltip] = useState<CursorTooltip | null>(null);

  // Smooth camera and morph state
  const cameraRef = useRef({
    xRatio: port.portId === 'PARADIP' ? 0.76 : 0.68,
    yRatio: port.portId === 'PARADIP' ? 0.28 : 0.44,
    morph: port.portId === 'PARADIP' ? 0 : 1,
  });

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

      // 1. Smooth Camera and Port Interpolation
      const isParadip = port.portId === 'PARADIP';
      const targetXRatio = isParadip ? 0.76 : 0.68;
      const targetYRatio = isParadip ? 0.28 : 0.44;
      const targetMorph = isParadip ? 0 : 1;

      cameraRef.current.xRatio += (targetXRatio - cameraRef.current.xRatio) * 0.08;
      cameraRef.current.yRatio += (targetYRatio - cameraRef.current.yRatio) * 0.08;
      cameraRef.current.morph += (targetMorph - cameraRef.current.morph) * 0.08;

      const curPortX = cameraRef.current.xRatio * w;
      const curPortY = cameraRef.current.yRatio * h;
      const curMorph = cameraRef.current.morph;

      // 2. Oceanic Deep-Foam Radial Background
      const oceanGrad = ctx.createRadialGradient(curPortX, curPortY, 40, w * 0.5, h * 0.5, Math.max(w, h));
      oceanGrad.addColorStop(0, '#FFFFFF');
      oceanGrad.addColorStop(0.35, '#F0F9FF');
      oceanGrad.addColorStop(0.75, '#E0F2FE');
      oceanGrad.addColorStop(1, '#BAE6FD');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Range Rings & Bathymetry Grids
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.14)';
      ctx.lineWidth = 1;
      [90, 180, 300, 440].forEach((r) => {
        ctx.beginPath();
        ctx.arc(curPortX, curPortY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 4. Coastline & Breakwater Morphing
      // Interpolate between Paradip (Mahanadi River Mouth) and Krishnapatnam (Buckingham Canal)
      const p0x = lerp(w * 0.58, w * 0.50, curMorph);
      const cp1x = lerp(w * 0.66, w * 0.54, curMorph);
      const cp1y = lerp(h * 0.18, h * 0.25, curMorph);
      const cp2x = lerp(curPortX - 40, curPortX - 30, curMorph);
      const cp2y = lerp(curPortY - 10, curPortY - 30, curMorph);

      const p2x = lerp(curPortX + 80, curPortX + 40, curMorph);
      const p2y = lerp(curPortY + 20, curPortY + 80, curMorph);
      const cp3x = lerp(curPortX + 120, w * 0.78, curMorph);
      const cp3y = lerp(curPortY + 60, h * 0.75, curMorph);
      const cp4x = lerp(w * 0.88, w * 0.82, curMorph);
      const cp4y = lerp(h * 0.60, h * 0.90, curMorph);
      const p3x = w;
      const p3y = lerp(h * 0.72, h, curMorph);

      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p0x, 0);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, curPortX, curPortY);
      ctx.lineTo(p2x, p2y);
      ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, p3x, p3y);
      if (p3y < h) ctx.lineTo(w, h);
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 5. Dredged Navigation Channel & Fairway Corridor
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.5)';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(curPortX - 250, curPortY + 170);
      ctx.lineTo(curPortX, curPortY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Fairway Label
      ctx.fillStyle = '#0284C7';
      ctx.font = '600 10px JetBrains Mono';
      ctx.fillText(`APPROACH FAIRWAY (${port.approachDepthMeters}m DEPTH)`, curPortX - 240, curPortY + 185);

      // 6. Outer Anchorage Waiting Zone (DBSCAN Roadstead)
      const anchorX = curPortX - 150;
      const anchorY = curPortY + 75;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(anchorX, anchorY, 80, 48, Math.PI / 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillText(`OUTER ROADSTEAD (${port.currentQueueDepth} WAITING)`, anchorX - 75, anchorY + 4);

      // 7. Terminal Berth Node
      ctx.fillStyle = '#0284C7';
      ctx.beginPath();
      ctx.arc(curPortX, curPortY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(port.berthName, curPortX + 16, curPortY + 4);

      // 8. Sweeping Radar Beam Animation
      sweepAngle += 0.018;
      ctx.save();
      ctx.translate(curPortX, curPortY);
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

      // 9. Inbound Vessel Trajectory Vectors & Markers
      const now = performance.now();

      vessels.forEach((v, idx) => {
        const isSelected = v.id === selectedVesselId;
        const progress = Math.min(0.85, (5600 - v.distanceNm) / 5600 + idx * 0.16);
        const vx = w * 0.12 + progress * (curPortX - w * 0.12) + idx * 40;
        const vy = h * 0.85 - progress * (h * 0.85 - curPortY) + idx * 30;

        // Vessel Trajectory Path
        ctx.save();
        if (isSelected) {
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = pulseTrajectory ? 4 : 2.5;
          if (pulseTrajectory) {
            ctx.shadowColor = '#059669';
            ctx.shadowBlur = 18;
          } else {
            ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
            ctx.shadowBlur = 8;
          }
        } else {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = 1.5;
        }
        ctx.beginPath();
        ctx.moveTo(vx - 85, vy + 52);
        ctx.lineTo(vx, vy);
        ctx.stroke();
        ctx.restore();

        // Pulsating Rings for Selected Ship
        if (isSelected) {
          const p1 = (now % 1800) / 1800;
          const r1 = 8 + p1 * 24;
          const a1 = (1 - p1) * 0.45;

          const p2 = ((now + 900) % 1800) / 1800;
          const r2 = 8 + p2 * 24;
          const a2 = (1 - p2) * 0.45;

          ctx.save();
          ctx.strokeStyle = `rgba(2, 132, 199, ${a1})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vx, vy, r1, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = `rgba(2, 132, 199, ${a2})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(vx, vy, r2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Vessel Geometric Node
        ctx.fillStyle = isSelected ? '#0284C7' : '#FFFFFF';
        ctx.beginPath();
        ctx.arc(vx, vy, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0369A1';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ship Label
        ctx.fillStyle = isSelected ? '#0C4A6E' : '#334155';
        ctx.font = isSelected ? 'bold 11px JetBrains Mono' : '500 11px Inter, sans-serif';
        ctx.fillText(`${v.name} (${v.jitSpeedKn} kn)`, vx + 12, vy + 4);
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [port, vessels, selectedVesselId, pulseTrajectory]);

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const w = rect.width;
    const h = rect.height;
    const curPortX = cameraRef.current.xRatio * w;
    const curPortY = cameraRef.current.yRatio * h;

    let match: VesselItinerary | null = null;
    vessels.forEach((v, idx) => {
      const progress = Math.min(0.85, (5600 - v.distanceNm) / 5600 + idx * 0.16);
      const vx = w * 0.12 + progress * (curPortX - w * 0.12) + idx * 40;
      const vy = h * 0.85 - progress * (h * 0.85 - curPortY) + idx * 30;

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

      {/* Sleek Floating Vessel Switcher Pill at Top Center */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-sky-200 shadow-md">
        {vessels.map((v) => {
          const isActive = v.id === selectedVesselId;
          return (
            <button
              key={v.id}
              onClick={() => onSelectVessel(v.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-300/40'
                  : 'text-slate-600 hover:text-sky-900 hover:bg-sky-50'
              }`}
            >
              <span>🚢</span>
              <span>{v.name}</span>
              {isActive && (
                <span className="text-[10px] bg-sky-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hover AIS Tooltip */}
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
