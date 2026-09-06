import { useState, useEffect, useCallback } from "react";
import {
  OptimizationResult,
  PortTelemetryResponse,
  AuditDossierResponse
} from "../types/fleet";

const API_BASE = "http://localhost:8000/api/v1";

export function useFleetOptimizer() {
  const [selectedPort, setSelectedPort] = useState<string>("paradip");
  const [bunkerPrice, setBunkerPrice] = useState<number>(620.0);
  const [stockyardStock, setStockyardStock] = useState<number>(350000.0);
  const [criticalCushion, setCriticalCushion] = useState<number>(15.0);
  const [berthDelayHours, setBerthDelayHours] = useState<number>(0.0);
  const [operatorSpeed, setOperatorSpeed] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"canvas" | "radar">("canvas");

  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [telemetry, setTelemetry] = useState<PortTelemetryResponse | null>(null);
  const [auditDossier, setAuditDossier] = useState<AuditDossierResponse | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOptimization = useCallback(async (overrides?: {
    speed?: number | null;
    delay?: number;
    bunker?: number;
    stock?: number;
    port?: string;
  }) => {
    setOptimizing(true);
    setError(null);
    try {
      const port = overrides?.port || selectedPort;
      const speed = overrides?.speed !== undefined ? overrides.speed : operatorSpeed;
      const delay = overrides?.delay !== undefined ? overrides.delay : berthDelayHours;
      const bunker = overrides?.bunker !== undefined ? overrides.bunker : bunkerPrice;
      const stock = overrides?.stock !== undefined ? overrides.stock : stockyardStock;

      const payload = {
        destination_port: port,
        bunker_price_usd: bunker,
        demurrage_daily_rate_usd: 28500.0,
        stockyard_stock_mt: stock,
        stockyard_burn_rate_mt: 8000.0,
        critical_cushion_days: criticalCushion,
        macro_spot_rate_usd_mt: 18.50,
        operator_speed_override: speed,
        berth_service_delay_hours: delay
      };

      const res = await fetch(`${API_BASE}/optimize-fleet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Optimization failed: ${res.statusText}`);
      const data: OptimizationResult = await res.json();
      setOptimizationResult(data);
    } catch (err: any) {
      console.error("Optimization error:", err);
      setError(err.message || "Failed to execute Iterative Projection optimization");
    } finally {
      setOptimizing(false);
    }
  }, [selectedPort, operatorSpeed, berthDelayHours, bunkerPrice, stockyardStock, criticalCushion]);

  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/telemetry/ports`);
      if (res.ok) {
        const data: PortTelemetryResponse = await res.json();
        setTelemetry(data);
      }
    } catch (err) {
      console.warn("Failed to fetch port telemetry:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchOptimization(), fetchTelemetry()]);
      setLoading(false);
    }
    init();
  }, [selectedPort]);

  const handleSpeedChange = (speed: number) => {
    setOperatorSpeed(speed);
    fetchOptimization({ speed });
  };

  const handleResetSpeed = () => {
    setOperatorSpeed(null);
    fetchOptimization({ speed: null });
  };

  const handleDelaySimulation = (delayHrs: number) => {
    setBerthDelayHours(delayHrs);
    fetchOptimization({ delay: delayHrs });
  };

  const handleBunkerChange = (price: number) => {
    setBunkerPrice(price);
    fetchOptimization({ bunker: price });
  };

  const handleStockyardChange = (stock: number) => {
    setStockyardStock(stock);
    fetchOptimization({ stock });
  };

  const exportAuditDossier = async () => {
    if (!optimizationResult) return;
    try {
      const res = await fetch(`${API_BASE}/audit/export-dossier`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optimization_result: optimizationResult,
          authorized_role: "Chief Procurement Officer - SAIL/RINL",
          tender_reference: "SAIL/MO-COAL/2026-Q3/009",
          department: "Raw Materials & Bulk Maritime Logistics Wing"
        })
      });
      if (!res.ok) throw new Error("Failed to generate audit dossier");
      const data: AuditDossierResponse = await res.json();
      setAuditDossier(data);
      setIsAuditModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to export audit dossier");
    }
  };

  return {
    selectedPort,
    setSelectedPort,
    bunkerPrice,
    stockyardStock,
    criticalCushion,
    berthDelayHours,
    operatorSpeed,
    viewMode,
    setViewMode,
    optimizationResult,
    telemetry,
    auditDossier,
    isAuditModalOpen,
    setIsAuditModalOpen,
    loading,
    optimizing,
    error,
    handleSpeedChange,
    handleResetSpeed,
    handleDelaySimulation,
    handleBunkerChange,
    handleStockyardChange,
    exportAuditDossier,
    refresh: fetchOptimization
  };
}
