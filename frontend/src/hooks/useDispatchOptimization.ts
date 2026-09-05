import { useState, useEffect, useCallback } from "react";
import { api, RateForecastResponse, PortStatusResponse, AISVessel, DispatchOptimizeResponse, AuditCertificateResponse } from "../services/api";

export function useDispatchOptimization() {
  const [selectedRoute, setSelectedRoute] = useState<string>("gladstone_paradip");
  const [cargoMt, setCargoMt] = useState<number>(160000);
  const [activePort, setActivePort] = useState<string>("paradip");

  const [forecastData, setForecastData] = useState<RateForecastResponse | null>(null);
  const [portStatus, setPortStatus] = useState<PortStatusResponse | null>(null);
  const [aisVessels, setAisVessels] = useState<AISVessel[]>([]);
  const [dispatchResult, setDispatchResult] = useState<DispatchOptimizeResponse | null>(null);
  const [auditCert, setAuditCert] = useState<AuditCertificateResponse | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [auditLoading, setAuditLoading] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync active port when route changes
  useEffect(() => {
    if (selectedRoute.includes("paradip")) {
      setActivePort("paradip");
    } else {
      setActivePort("vizag");
    }
  }, [selectedRoute]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const port = selectedRoute.includes("paradip") ? "paradip" : "vizag";
      const [fData, pData, aisData] = await Promise.all([
        api.getForecast(selectedRoute),
        api.getPortStatus(port),
        api.getPortAIS(port)
      ]);
      setForecastData(fData);
      setPortStatus(pData);
      setAisVessels(aisData.vessels || []);

      // Run initial optimization
      const optResult = await api.runDispatchOptimization({
        route: selectedRoute,
        cargo_mt: cargoMt
      });
      setDispatchResult(optResult);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Failed to load maritime engine data");
    } finally {
      setLoading(false);
    }
  }, [selectedRoute, cargoMt]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reOptimize = async (newCargoMt?: number) => {
    setOptimizing(true);
    try {
      const mt = newCargoMt || cargoMt;
      if (newCargoMt) setCargoMt(newCargoMt);
      const optResult = await api.runDispatchOptimization({
        route: selectedRoute,
        cargo_mt: mt
      });
      setDispatchResult(optResult);
    } catch (err: any) {
      setError(err.message || "Optimization failed");
    } finally {
      setOptimizing(false);
    }
  };

  const generateAuditCertificate = async () => {
    if (!dispatchResult) return;
    setAuditLoading(true);
    try {
      const summary = {
        route: dispatchResult.route,
        cargo_mt: dispatchResult.cargo_mt,
        recommended_horizon: dispatchResult.evaluation.optimal_charter_window.recommended_horizon,
        optimal_steaming_speed_knots: dispatchResult.evaluation.optimal_charter_window.optimal_steaming_speed_knots,
        net_savings_usd: dispatchResult.evaluation.economic_impact.net_savings_usd,
        net_savings_inr_cr: dispatchResult.evaluation.economic_impact.net_savings_inr_cr,
        co2_emissions_avoided_mt: dispatchResult.evaluation.economic_impact.co2_emissions_avoided_mt,
        trigger_signal: dispatchResult.stochastic_triggers.recommendation,
        stochastic_s1_star: dispatchResult.stochastic_triggers.s1_star_delay_threshold,
        stochastic_s2_star: dispatchResult.stochastic_triggers.s2_star_charter_trigger
      };
      const cert = await api.generateAuditReport(summary);
      setAuditCert(cert);
      setIsAuditModalOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate audit certificate");
    } finally {
      setAuditLoading(false);
    }
  };

  return {
    selectedRoute,
    setSelectedRoute,
    cargoMt,
    setCargoMt,
    activePort,
    forecastData,
    portStatus,
    aisVessels,
    dispatchResult,
    auditCert,
    loading,
    optimizing,
    auditLoading,
    isAuditModalOpen,
    setIsAuditModalOpen,
    error,
    refreshData: loadData,
    reOptimize,
    generateAuditCertificate
  };
}
