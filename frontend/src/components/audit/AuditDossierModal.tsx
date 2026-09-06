import React, { useState } from "react";
import { Check, Copy, Printer, X, ShieldAlert } from "lucide-react";
import { AuditDossierResponse } from "../../types/fleet";

interface AuditDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: AuditDossierResponse | null;
}

export const AuditDossierModal: React.FC<AuditDossierModalProps> = ({
  isOpen,
  onClose,
  dossier
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dossier) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(dossier.sha256_signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0E1726] border-2 border-blue-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              🏛️
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 block">
                Government of India • Ministry of Steel • SAIL / RINL
              </span>
              <h3 className="text-base font-black text-white">
                Public Procurement Digital Audit Dossier
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="mt-4 space-y-4 text-xs text-slate-300 overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="bg-[#070B12] p-4 rounded-xl border border-[#1E293B]">
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Dossier ID:</span>
                <span className="text-white font-bold">{dossier.dossier_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Timestamp (UTC):</span>
                <span className="text-slate-200">{dossier.timestamp_utc}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Authorized Signatory:</span>
                <span className="text-slate-200">{dossier.audit_proof.authorized_signatory}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Tender Reference:</span>
                <span className="text-blue-400 font-bold">{dossier.audit_proof.tender_id}</span>
              </div>
            </div>
          </div>

          {/* Legal Compliance Badges */}
          <div className="bg-[#070B12] p-3.5 rounded-xl border border-[#1E293B] space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <span>✓</span>
              <span>{dossier.legal_framework.gfr_compliance}</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-400 font-semibold">
              <span>✓</span>
              <span>{dossier.legal_framework.cvc_circular}</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 font-semibold">
              <span>✓</span>
              <span>{dossier.legal_framework.cag_scrutiny}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                SHA-256 Immutable Cryptographic Signature:
              </span>
              <button
                onClick={copyHash}
                className="flex items-center space-x-1 text-[11px] text-blue-400 hover:underline font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Digest"}</span>
              </button>
            </div>
            <div className="bg-[#070B12] border border-blue-900/60 p-3 rounded-xl font-mono text-[11px] text-blue-300 break-all select-all">
              {dossier.sha256_signature}
            </div>
          </div>

          {/* Mathematical Optimality Condition */}
          <div className="bg-[#070B12] p-3.5 rounded-xl border border-[#1E293B]">
            <span className="text-slate-400 block font-semibold mb-1">Mathematical Optimality Verification:</span>
            <span className="font-mono text-emerald-400 text-xs block">
              {dossier.audit_proof.mathematical_model}
            </span>
            <span className="font-mono text-slate-300 text-[11px] block mt-0.5">
              {dossier.audit_proof.optimality_condition}
            </span>
          </div>

          {/* CVC Disclaimer */}
          <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-300 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              This cryptographic record certifies that charter speeds, fuel consumption gradients, and laytime slack were computed deterministically without arbitrary discretion, satisfying sovereign audit scrutiny.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 pt-3 border-t border-[#1E293B] flex justify-end space-x-3">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#161F30] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
