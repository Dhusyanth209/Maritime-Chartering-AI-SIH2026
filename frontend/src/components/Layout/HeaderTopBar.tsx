import React from 'react';
import { ShieldCheck, Anchor, FileText } from 'lucide-react';

interface HeaderTopBarProps {
  selectedPortKey: string;
  onPortChange: (portKey: string) => void;
  onOpenAuditModal: () => void;
  netSavingsLakhs: number;
  demurrageAvoidedLakhs: number;
  solverLatencyMs: number;
}

export const HeaderTopBar: React.FC<HeaderTopBarProps> = ({
  selectedPortKey,
  onPortChange,
  onOpenAuditModal,
  netSavingsLakhs,
  demurrageAvoidedLakhs,
  solverLatencyMs
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-sky-100 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-40">
      {/* Brand & Authority */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-sky-600"/>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-slate-900 font-mono">
              COMMAND SENTINEL OS
            </h1>
            <span className="text-[10px] bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded-full font-mono font-bold">
              v3.0 OCEANIC
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Ministry of Steel (SAIL / RINL) Fleet Decision Support
          </p>
        </div>
      </div>

      {/* Top Executive KPI Badges */}
      <div className="hidden lg:flex items-center gap-8">
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Net Financial Savings</span>
          <span className="text-base font-bold font-mono text-emerald-600">
            ₹{netSavingsLakhs.toFixed(1)} Lakhs
          </span>
        </div>
        <div className="h-7 w-[1px] bg-slate-200" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Demurrage Fine Avoided</span>
          <span className="text-base font-bold font-mono text-slate-800">
            ₹{demurrageAvoidedLakhs.toFixed(1)} Lakhs
          </span>
        </div>
        <div className="h-7 w-[1px] bg-slate-200" />
        <div className="flex flex-col text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Algorithm Latency</span>
          <span className="text-xs font-mono font-semibold text-sky-700">
            {solverLatencyMs.toFixed(1)} ms (Global Converged)
          </span>
        </div>
      </div>

      {/* Port Switcher & Audit CTA */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-sky-50/80 border border-sky-200 px-3 py-1.5 rounded-xl">
          <Anchor className="w-4 h-4 text-sky-600"/>
          <select
            value={selectedPortKey}
            onChange={(e) => onPortChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-sky-950 focus:outline-none cursor-pointer pr-2"
          >
            <option value="PARADIP">Paradip Port — MCHP CQ-1/2 (16.0m Draft)</option>
            <option value="KRISHNAPATNAM">Adani Krishnapatnam — Deep Bulk (18.5m Draft)</option>
          </select>
        </div>

        <button
          onClick={onOpenAuditModal}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4"/>
          <span>Export Signed Audit</span>
        </button>
      </div>
    </header>
  );
};
