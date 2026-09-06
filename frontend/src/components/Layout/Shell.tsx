import React from "react";
import { HeaderTopBar } from "./HeaderTopBar";
import { InventoryBufferGauge } from "../stockyard/InventoryBufferGauge";
import { DistanceTimeCanvas } from "../cockpit/DistanceTimeCanvas";
import { MaritimeRadarMap } from "../cockpit/MaritimeRadarMap";
import { SpeedControlSlider } from "../cockpit/SpeedControlSlider";
import { FeatureAttributionCard } from "../xai/FeatureAttributionCard";
import { CounterfactualSimulator } from "../xai/CounterfactualSimulator";
import { AuditDossierModal } from "../audit/AuditDossierModal";
import { useFleetOptimizer } from "../../hooks/useFleetOptimizer";

export const Shell: React.FC = () => {
  const {
    selectedPort,
    setSelectedPort,
    bunkerPrice,
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
    exportAuditDossier
  } = useFleetOptimizer();

  if (loading && !optimizationResult) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono font-bold text-blue-400 text-sm tracking-wider">
          COMMAND SENTINEL OS: INITIALIZING IP SOLVER ENGINE...
        </p>
        <span className="text-xs text-slate-500 mt-1">
          Sampling 500 Monte-Carlo Scenarios across Paradip, Vizag & Dhamra Roadsteads
        </span>
      </div>
    );
  }

  const primaryVessel = optimizationResult?.vessels[0];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col font-sans">
      {/* 1. Top Operational Bar */}
      <HeaderTopBar
        aggregates={optimizationResult?.fleet_aggregates}
        solverMeta={optimizationResult?.solver_metadata}
        selectedPort={selectedPort}
        onPortChange={setSelectedPort}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        optimizing={optimizing}
      />

      {/* Main Workspace Layout Grid */}
      <main className="max-w-[1720px] mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200">
            ⚠️ {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 2. Left Panel: Industrial Stockyard Horizon (3 cols) */}
          <div className="lg:col-span-3 h-full">
            {optimizationResult && (
              <InventoryBufferGauge
                stockyard={optimizationResult.stockyard}
                onStockChange={handleStockyardChange}
              />
            )}
          </div>

          {/* 3. Center Stage: Interactive Trajectory Cockpit (6 cols) */}
          <div className="lg:col-span-6 panel-sentinel p-5 flex flex-col justify-between shadow-lg">
            <div>
              {/* Dual-View Toggle Cockpit */}
              {viewMode === "canvas" ? (
                <DistanceTimeCanvas
                  vessel={primaryVessel}
                  destinationPortName={optimizationResult?.destination_port.toUpperCase() || "PARADIP"}
                />
              ) : (
                <MaritimeRadarMap
                  telemetry={telemetry || undefined}
                  selectedPort={selectedPort}
                />
              )}

              {/* Fleet Active Vessels Table */}
              <div className="mt-4 pt-3 border-t border-[#1E293B]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Active Capesize Fleet Itinerary & JIT Speed Optimization
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-500 uppercase border-b border-[#1E293B] font-mono">
                        <th className="pb-1.5">Vessel Name</th>
                        <th className="pb-1.5">Origin ➔ Port</th>
                        <th className="pb-1.5">Cargo</th>
                        <th className="pb-1.5">HUAW Speed</th>
                        <th className="pb-1.5 text-emerald-400">JIT Speed</th>
                        <th className="pb-1.5 text-right">Fuel Saved</th>
                        <th className="pb-1.5 text-right">Demurrage Saved</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]/60 font-mono">
                      {optimizationResult?.vessels.map((v) => (
                        <tr key={v.id} className="hover:bg-[#161F30]/40 transition-colors">
                          <td className="py-2 font-bold text-white font-sans">{v.name}</td>
                          <td className="py-2 text-slate-400 font-sans">{v.distance_nm} NM</td>
                          <td className="py-2 text-slate-300">{(v.cargo_mt / 1000).toFixed(0)}k MT</td>
                          <td className="py-2 text-rose-400">{v.baseline_speed_knots} kn</td>
                          <td className="py-2 text-emerald-400 font-bold">{v.optimal_speed_clamped} kn</td>
                          <td className="py-2 text-right text-emerald-400 font-semibold">{v.fuel_saved_mt} MT</td>
                          <td className="py-2 text-right text-white font-bold">₹{v.demurrage_avoided_lakhs_inr}L</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Interactive Speed Override Slider */}
            <SpeedControlSlider
              vessel={primaryVessel}
              operatorSpeed={operatorSpeed}
              onSpeedChange={handleSpeedChange}
              onReset={handleResetSpeed}
            />
          </div>

          {/* 4. Right Panel: Explainable AI (XAI) & Audit Sentinel (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {optimizationResult && (
              <FeatureAttributionCard
                attributions={optimizationResult.feature_attributions}
                goncalves={optimizationResult.goncalves_macro_trigger}
              />
            )}

            <CounterfactualSimulator
              berthDelayHours={berthDelayHours}
              bunkerPrice={bunkerPrice}
              onDelayChange={handleDelaySimulation}
              onBunkerChange={handleBunkerChange}
              onExportAudit={exportAuditDossier}
            />
          </div>
        </div>
      </main>

      {/* 5. CVC / CAG Audit Dossier Modal */}
      <AuditDossierModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        dossier={auditDossier}
      />

      {/* Footer */}
      <footer className="w-full bg-[#0A0E17] border-t border-[#1E293B] py-3 px-6 text-center text-xs text-slate-500 font-mono">
        COMMAND SENTINEL OS v3.0 • CVC Circular 02/05/2022 & GFR 2017 Rule 144 Compliant • Ministry of Steel (SAIL / RINL)
      </footer>
    </div>
  );
};
