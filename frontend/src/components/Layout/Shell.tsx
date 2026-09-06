import React, { useState } from "react";
import { HeaderTopBar } from "./HeaderTopBar";
import { SpatialTrajectoryCockpit } from "../cockpit/SpatialTrajectoryCockpit";
import { PrimaryDispatchDirective } from "../executive/PrimaryDispatchDirective";
import { BlastFurnaceHealthCard } from "../executive/BlastFurnaceHealthCard";
import { TabbedWorkspace } from "../secondary/TabbedWorkspace";
import { AuditDossierModal } from "../audit/AuditDossierModal";
import { useFleetOptimizer } from "../../hooks/useFleetOptimizer";

export const Shell: React.FC = () => {
  const {
    selectedPort,
    setSelectedPort,
    bunkerPrice,
    stockyardStock,
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

  const [selectedVesselId, setSelectedVesselId] = useState<string>("vessel_1");

  if (loading && !optimizationResult) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 font-mono font-bold text-blue-400 text-sm tracking-wider">
          COMMAND SENTINEL OS: INITIALIZING DETERMINISTIC IP ENGINE...
        </p>
        <span className="text-xs text-slate-500 mt-1">
          Sampling 500 Monte-Carlo Scenarios across Paradip, Vizag & Dhamra Roadsteads
        </span>
      </div>
    );
  }

  // Active flagship selection
  const vessels = optimizationResult?.vessels || [];
  const activeVessel = vessels.find((v) => v.id === selectedVesselId) || vessels[0];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Executive Top Bar (5-Second Rule: Net Savings, Demurrage Avoided, Carbon Abated) */}
      <HeaderTopBar
        aggregates={optimizationResult?.fleet_aggregates}
        solverMeta={optimizationResult?.solver_metadata}
        selectedPort={selectedPort}
        onPortChange={setSelectedPort}
        onExportAudit={exportAuditDossier}
        optimizing={optimizing}
      />

      {/* Main Primary Viewport Workspace */}
      <main className="max-w-[1780px] mx-auto w-full px-6 py-6 flex-1 flex flex-col gap-6">
        {error && (
          <div className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center justify-between">
            <span>⚠️ Optimization Engine Notice: {error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. Primary Workspace (Strict 70% / 30% Split Layout)                     */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-stretch">
          {/* Left Stage (70% Width): Spatial & Trajectory Canvas */}
          <div className="lg:col-span-7 flex flex-col">
            <SpatialTrajectoryCockpit
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              vessel={activeVessel}
              destinationPortName={optimizationResult?.destination_port.toUpperCase() || "PARADIP"}
              telemetry={telemetry || undefined}
              selectedPort={selectedPort}
            />
          </div>

          {/* Right Stage (30% Width): Executive Action & Plant Safety */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Card A: Primary Dispatch Directive (Highest Visual Hierarchy) */}
            <PrimaryDispatchDirective
              vessel={activeVessel}
              aggregates={optimizationResult?.fleet_aggregates}
              operatorSpeed={operatorSpeed}
            />

            {/* Card B: Blast Furnace Raw Material Health */}
            <BlastFurnaceHealthCard
              stockyard={optimizationResult?.stockyard}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. Collapsible Bottom Drawer / Tabbed Workspace (Details on Demand)       */}
        {/* ========================================================================= */}
        <TabbedWorkspace
          vessels={vessels}
          selectedVesselId={selectedVesselId}
          onSelectVessel={setSelectedVesselId}
          berthDelayHours={berthDelayHours}
          bunkerPrice={bunkerPrice}
          stockyardStock={stockyardStock}
          operatorSpeed={operatorSpeed}
          onDelayChange={handleDelaySimulation}
          onBunkerChange={handleBunkerChange}
          onStockyardChange={handleStockyardChange}
          onSpeedChange={handleSpeedChange}
          onResetSpeed={handleResetSpeed}
          attributions={optimizationResult?.feature_attributions || []}
          goncalves={
            optimizationResult?.goncalves_macro_trigger || {
              optimal_stopping_s_star: 19.24,
              current_spot_rate: 18.5,
              action: "COMMIT_NOW",
              decision_rationale: "Spot rate is below trigger threshold",
              tail_risk_bound_r_inf: 9000,
              gamma_2: 1.45
            }
          }
          stockyard={optimizationResult?.stockyard}
        />
      </main>

      {/* 4. CVC / CAG Sovereign Audit Dossier Modal */}
      <AuditDossierModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        dossier={auditDossier}
      />

      {/* Sovereign Statutory Footer */}
      <footer className="w-full bg-[#0A0E17] border-t border-[#1E293B] py-3.5 px-6 text-center text-xs text-slate-500 font-mono">
        COMMAND SENTINEL OS v3.0 • CVC Circular 02/05/2022 & GFR 2017 Rule 144 Compliant • Ministry of Steel (SAIL / RINL) • Sovereign Mathematical Verification
      </footer>
    </div>
  );
};
