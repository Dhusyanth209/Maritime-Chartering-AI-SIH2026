import React, { useRef, useEffect, useState } from 'react';
import { PortInfrastructure, VesselItinerary } from '../../types/fleet';
import { Compass, Navigation, Radio, Waves, ShieldCheck } from 'lucide-react';

interface OceanRadarMapProps {
  port: PortInfrastructure;
  vessels: VesselItinerary[];
  selectedVesselId: string;
  onSelectVessel: (vesselId: string) => void;
}

export const OceanRadarMap: React.FC<OceanRadarMapProps> = ({
  port,
  vessels,
  selectedVesselId,
  onSelectVessel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredVessel, setHoveredVessel] = useState<VesselItinerary | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Camera state for smooth geographic transitions between ports
  const cameraRef = useRef<{ lat: number; lon: number }>({
    lat: port.outerAnchorageLatLong[0],
    lon: port.outerAnchorageLatLong[1]
  });

  const radarAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 900;
      const height = rect.height || 680;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.resetTransform?.();
      ctx.scale(dpr, dpr);

      // Smooth camera interpolation towards active port
      const targetLat = port.outerAnchorageLatLong[0];
      const targetLon = port.outerAnchorageLatLong[1];
      cameraRef.current.lat += (targetLat - cameraRef.current.lat) * 0.08;
      cameraRef.current.lon += (targetLon - cameraRef.current.lon) * 0.08;

      // Update radar angle
      radarAngleRef.current = (radarAngleRef.current + 0.025) % (Math.PI * 2);

      // 1. Oceanic Light Canvas Background
      const oceanGrad = ctx.createRadialGradient(
        width / 2, height / 2, 80,
        width / 2, height / 2, width * 0.7
      );
      oceanGrad.addColorStop(0, '#E0F2FE'); // Sky 100
      oceanGrad.addColorStop(0.5, '#BAE6FD'); // Sky 200
      oceanGrad.addColorStop(1, '#7DD3FC'); // Sky 300
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Bathymetric Depth Contour Waves
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.15)';
      ctx.lineWidth = 1;
      for (let r = 80; r < width * 0.8; r += 70) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Coordinate Grid Matrix
      ctx.strokeStyle = 'rgba(12, 74, 110, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const centerX = width / 2;
      const centerY = height / 2;

      // 4. Rotating Nautical Radar Sweep (Oceanic Teal/Cobalt)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(radarAngleRef.current);

      const sweepGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 320);
      sweepGrad.addColorStop(0, 'rgba(2, 132, 199, 0.35)');
      sweepGrad.addColorStop(0.8, 'rgba(14, 165, 233, 0.08)');
      sweepGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 320, -0.4, 0);
      ctx.closePath();
      ctx.fill();

      // Lead sweep line
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(320, 0);
      ctx.stroke();
      ctx.restore();

      // 5. Radar Range Rings & Crosshairs
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
      ctx.lineWidth = 1;
      [80, 160, 240, 320].forEach((ringRadius, idx) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#0369A1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${(idx + 1) * 5} NM`, centerX + 6, centerY - ringRadius + 12);
      });

      // Crosshairs
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.3)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(centerX - 320, centerY);
      ctx.lineTo(centerX + 320, centerY);
      ctx.moveTo(centerX, centerY - 320);
      ctx.lineTo(centerX, centerY + 320);
      ctx.stroke();
      ctx.setLineDash([]);

      // 6. Geographic Port Terminal Center
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(2, 132, 199, 0.25)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(centerX - 35, centerY - 20, 70, 40, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0C4A6E';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(port.portId, centerX, centerY - 2);
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillStyle = '#0284C7';
      ctx.fillText(`${port.maxDraftMeters}m Draft`, centerX, centerY + 11);

      // 7. Fairway Pilot Approach Channel
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(centerX - 240, centerY);
      ctx.lineTo(centerX - 40, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0369A1';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Deep Fairway Pilot Corridor (16.5m)', centerX - 140, centerY - 8);

      // 8. Outer Anchorage DBSCAN Polygon (Demurrage Risk Zone)
      const polyX = centerX + 110;
      const polyY = centerY - 140;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(polyX, polyY);
      ctx.lineTo(polyX + 130, polyY - 20);
      ctx.lineTo(polyX + 150, polyY + 90);
      ctx.lineTo(polyX + 20, polyY + 110);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#DC2626';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.fillText('Outer Anchorage (DBSCAN ε=0.035°)', polyX + 75, polyY - 26);
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(`Avg Delay: ${port.projectedBerthDelayHours}h`, polyX + 75, polyY - 14);

      // Anchored Waiting Ships (Hurry-then-Wait casualties)
      [
        { x: polyX + 40, y: polyY + 30 },
        { x: polyX + 80, y: polyY + 20 },
        { x: polyX + 110, y: polyY + 50 },
        { x: polyX + 60, y: polyY + 70 },
      ].forEach((ship) => {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 9. Active Capesize Fleet Vessels on Approach
      vessels.forEach((v, index) => {
        // Compute position based on voyage distance & index
        const angle = Math.PI + 0.35 * (index - 1);
        const radius = Math.min(280, Math.max(90, (v.distanceNm / 6000) * 260));
        const vx = centerX + Math.cos(angle) * radius;
        const vy = centerY + Math.sin(angle) * radius;

        const isSelected = v.id === selectedVesselId;

        // Active Ring Ping
        if (isSelected) {
          ctx.strokeStyle = '#059669';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(vx, vy, 12, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = 'rgba(5, 150, 105, 0.4)';
          ctx.beginPath();
          ctx.arc(vx, vy, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vessel Icon Marker
        ctx.fillStyle = isSelected ? '#059669' : '#0284C7';
        ctx.beginPath();
        ctx.arc(vx, vy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.roundRect(vx - 50, vy + 10, 100, 20, 6);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSelected ? '#059669' : '#BAE6FD';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isSelected ? '#065F46' : '#0C4A6E';
        ctx.font = 'bold 9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(v.name, vx, vy + 23);
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [port, vessels, selectedVesselId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Check hit against each vessel
    vessels.forEach((v, index) => {
      const angle = Math.PI + 0.35 * (index - 1);
      const radius = Math.min(280, Math.max(90, (v.distanceNm / 6000) * 260));
      const vx = centerX + Math.cos(angle) * radius;
      const vy = centerY + Math.sin(angle) * radius;

      const dist = Math.hypot(clickX - vx, clickY - vy);
      if (dist <= 25) {
        onSelectVessel(v.id);
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: mx, y: my });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    let found: VesselItinerary | null = null;
    vessels.forEach((v, index) => {
      const angle = Math.PI + 0.35 * (index - 1);
      const radius = Math.min(280, Math.max(90, (v.distanceNm / 6000) * 260));
      const vx = centerX + Math.cos(angle) * radius;
      const vy = centerY + Math.sin(angle) * radius;

      if (Math.hypot(mx - vx, my - vy) <= 25) {
        found = v;
      }
    });
    setHoveredVessel(found);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredVessel(null)}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Top Right: Real-Time AIS GPS Telemetry HUD */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-sky-200 shadow-md text-xs font-mono">
        <div className="flex items-center gap-2 text-sky-950 font-bold mb-1">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>LIVE AIS RADAR TELEMETRY</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-600">
          <span>Lat: <strong className="text-slate-800">{cameraRef.current.lat.toFixed(3)}°N</strong></span>
          <span>Lon: <strong className="text-slate-800">{cameraRef.current.lon.toFixed(3)}°E</strong></span>
          <span>Sea State: <strong className="text-sky-700">Calm (0.8m)</strong></span>
          <span>Radar Sweep: <strong className="text-emerald-700">360° Continuous</strong></span>
        </div>
      </div>

      {/* Hover Vessel Tooltip */}
      {hoveredVessel && mousePos && (
        <div
          className="absolute z-30 pointer-events-none bg-sky-950/95 text-white text-[11px] font-mono px-3.5 py-2.5 rounded-xl shadow-xl border border-sky-400/40 space-y-1"
          style={{ left: mousePos.x + 15, top: mousePos.y - 45 }}
        >
          <div className="font-bold text-sky-200">{hoveredVessel.name}</div>
          <div className="text-[10px] text-slate-300">
            {hoveredVessel.origin} ➔ {hoveredVessel.destination}
          </div>
          <div className="flex gap-3 text-[10px] pt-1 border-t border-sky-800/80">
            <span>Speed: <strong className="text-emerald-400">{hoveredVessel.jitSpeedKn} kn</strong></span>
            <span>Cargo: <strong>{(hoveredVessel.cargoMt / 1000).toFixed(0)}k MT</strong></span>
            <span>Dist: <strong>{hoveredVessel.distanceNm} NM</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
