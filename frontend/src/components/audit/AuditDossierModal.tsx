import React, { useState } from 'react';
import { X, CheckCircle, Copy, Printer, Shield } from 'lucide-react';
import { VesselItinerary, PortInfrastructure } from '../../types/fleet';

interface AuditDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel: VesselItinerary;
  port: PortInfrastructure;
  auditDigest: string;
}

export const AuditDossierModal: React.FC<AuditDossierModalProps> = ({
  isOpen,
  onClose,
  vessel,
  port,
  auditDigest
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(auditDigest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden text-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-sky-50/50">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-sky-700"/>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-900 tracking-wide">
                GOVERNMENT OF INDIA — PUBLIC PROCUREMENT AUDIT DOSSIER
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Ministry of Steel / SAIL / RINL Logistics Compliance Cell
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Statutory Procurement Directives Verified:
            </span>
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-sky-900">
                <CheckCircle className="w-4 h-4 text-emerald-600"/>
                <span>Central Vigilance Commission (CVC) Circular 02/05/2022 (Transparent Algorithmic Dispatch)</span>
              </div>
              <div className="flex items-center gap-2 text-sky-900">
                <CheckCircle className="w-4 h-4 text-emerald-600"/>
                <span>CAG Public Procurement Act / GFR 2017 Rule 144 (Deterministic Least-Cost Verification)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border border-slate-200 p-4 rounded-xl bg-slate-50/50 font-mono">
            <div>
              <span className="text-slate-500 text-[11px] block">Chartered Flagship:</span>
              <span className="text-slate-900 font-bold">{vessel.name} ({vessel.cargoMt.toLocaleString()} MT)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Destination Terminal:</span>
              <span className="text-slate-900 font-bold">{port.berthName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Verified Speed Directive:</span>
              <span className="text-emerald-700 font-bold">{vessel.jitSpeedKn.toFixed(1)} Knots (Virtual Arrival)</span>
            </div>
            <div>
              <span className="text-slate-500 text-[11px] block">Demurrage Avoided:</span>
              <span className="text-slate-900 font-bold">₹{vessel.demurrageSavedInrLakhs.toFixed(1)} Lakhs</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Immutable SHA-256 Decision Signature:
              </span>
              <button
                onClick={handleCopy}
                className="text-[10px] font-mono text-sky-700 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3"/>
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-slate-700 break-all select-all">
              {auditDigest}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-sm"
          >
            <Printer className="w-3.5 h-3.5"/>
            <span>Print Official Dossier</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
