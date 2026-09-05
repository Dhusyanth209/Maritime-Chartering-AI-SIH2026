import React from "react";
import { useDispatchOptimization } from "./hooks/useDispatchOptimization";
import { Navbar } from "./components/Layout/Navbar";
import { Header } from "./components/Layout/Header";
import { RateForecastChart } from "./components/Dashboard/RateForecastChart";
import { SpatialNauticalRadar } from "./components/Dashboard/SpatialNauticalRadar";
import { LandedCostLedger } from "./components/Dashboard/LandedCostLedger";
import { AuditReportModal } from "./components/Dashboard/AuditReportModal";

export const App: React.FC = () => {
  const {
    selectedRoute,
    setSelectedRoute,
    cargoMt,
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
    refreshData,
    reOptimize,
    generateAuditCertificate
  } = useDispatchOptimization();

  if (loading && !forecastData) {
    return (
      <div className="min-h-screen bg-[#07111e] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-bold text-sky-400 text-sm tracking-wider">
          INITIALIZING PAD-CE MARITIME AI ENGINE...
        </p>
        <span className="text-xs text-slate-500 mt-1">
          Loading Baltic Time-Series & AIS Spatial Density Clusters
        </span>
      </div>
    );
  }

  const currentSpot = forecastData?.forecast?.current_spot_usd_mt || 18.5;
  const lastHistory = forecastData?.history?.slice(-1)[0] || { bdi: 1850, bci: 2450, vlsfo: 620 };
  const horizons = forecastData?.forecast?.horizons || [];
  const ensembleWeights = forecastData?.forecast?.ensemble_weights;
  const triggerSignal = dispatchResult?.stochastic_triggers?.recommendation || "OPTIMAL_DISPATCH_WINDOW";

  return (
    <div className="min-h-screen bg-[#07111e] text-slate-100 flex flex-col">
      {/* Navigation */}
      <Navbar
        activeRoute={selectedRoute}
        onRouteChange={setSelectedRoute}
        onRefresh={refreshData}
        loading={loading || optimizing}
      />

      {/* Global Live Ticker & Quick Controls */}
      <Header
        bdi={lastHistory.bdi}
        bci={lastHistory.bci}
        vlsfo={lastHistory.vlsfo}
        currentSpot={currentSpot}
        congestionIndex={portStatus?.port_status?.congestion_index || 35}
        cargoMt={cargoMt}
        onCargoChange={reOptimize}
        triggerSignal={triggerSignal}
      />

      {/* Main Operational Dashboard Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 space-y-6">
        {error && (
          <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200">
            ⚠️ {error}
          </div>
        )}

        {/* Top Row: AI Forecaster (Left) + Spatial Nautical Radar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RateForecastChart
            horizons={horizons}
            currentSpot={currentSpot}
            ensembleWeights={ensembleWeights}
            recommendedHorizon={dispatchResult?.evaluation?.optimal_charter_window?.recommended_horizon}
          />

          {portStatus && (
            <SpatialNauticalRadar
              portStatus={portStatus.port_status}
              vessels={aisVessels}
            />
          )}
        </div>

        {/* Bottom Row: Master Landed Cost Ledger & 3-Way Optimization */}
        {dispatchResult && (
          <LandedCostLedger
            evaluation={dispatchResult.evaluation}
            onGenerateAudit={generateAuditCertificate}
            auditLoading={auditLoading}
          />
        )}
      </main>

      {/* Audit Modal */}
      <AuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditCert={auditCert}
      />

      {/* Footer */}
      <footer className="bg-[#0b192c] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          PAD-CE (Port-Aware Dynamic Chartering Engine) • Built for Ministry of Steel, Government of India • Smart India Hackathon (SIH 2026)
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          GFR 2017 Rule 144 & CVC Circular 02/05/2022 Compliant Digital Procurement System
        </p>
      </footer>
    </div>
  );
};

export default App;
