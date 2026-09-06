import React, { useState } from "react";
import { Check, Copy, Printer, X, ShieldAlert, Download, FileCheck } from "lucide-react";
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

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `CVC_CAG_Audit_Dossier_${dossier.dossier_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0E1726] border-2 border-[#2563EB]/70 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header: Official Government of India Format */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 text-2xl shadow-inner">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 block font-mono">
                  GOVERNMENT OF INDIA • MINISTRY OF STEEL
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-mono font-bold">
                  VERIFIED
                </span>
              </div>
              <h3 className="text-base font-black text-white tracking-wide">
                CVC / CAG Public Procurement Cryptographic Audit Certificate
              </h3>
              <p className="text-xs text-slate-400">
                Steel Authority of India Limited (SAIL) & Rashtriya Ispat Nigam Limited (RINL) Logistics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="mt-4 space-y-4 text-xs text-slate-300 overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="bg-[#070B12] p-4 rounded-xl border border-[#1E293B]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div>
                <span className="text-slate-500 block font-sans text-[10px] font-bold uppercase">Dossier ID:</span>
                <span className="text-white font-bold">{dossier.dossier_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans text-[10px] font-bold uppercase">Timestamp (UTC):</span>
                <span className="text-slate-200">{dossier.timestamp_utc}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans text-[10px] font-bold uppercase">Signatory:</span>
                <span className="text-slate-200 truncate block">{dossier.audit_proof.authorized_signatory}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-sans text-[10px] font-bold uppercase">Tender Ref:</span>
                <span className="text-blue-400 font-bold">{dossier.audit_proof.tender_id}</span>
              </div>
            </div>
          </div>

          {/* Legal Compliance Certifications */}
          <div className="bg-[#070B12] p-4 rounded-xl border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              Statutory Procurement Directives & Standard Operating Compliance:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>{dossier.legal_framework.gfr_compliance || "GFR 2017 Rule 144(i)"}</span>
              </div>
              <div className="flex items-center space-x-2 text-blue-400 bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>{dossier.legal_framework.cvc_circular || "CVC Circular 02/05/2022"}</span>
              </div>
              <div className="flex items-center space-x-2 text-purple-400 bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                <FileCheck className="w-4 h-4 shrink-0" />
                <span>{dossier.legal_framework.cag_scrutiny || "CAG Audit Scrutiny Ready"}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Digital Signature Digest */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide font-sans">
                Immutable SHA-256 Public Key Cryptographic Hash:
              </span>
              <button
                onClick={copyHash}
                className="flex items-center space-x-1 text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Hash Digest"}</span>
              </button>
            </div>
            <div className="bg-[#070B12] border border-blue-900/60 p-3 rounded-xl font-mono text-[11px] text-blue-300 break-all select-all shadow-inner">
              {dossier.sha256_signature}
            </div>
          </div>

          {/* Mathematical Parameter Matrix Used for Dispatch */}
          <div className="bg-[#070B12] p-4 rounded-xl border border-[#1E293B] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
              Audit Parameter Matrix & Optimality Condition:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-[#0E1523] rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[10px]">Algorithm:</span>
                <span className="text-white font-bold">{dossier.audit_proof.mathematical_model}</span>
              </div>
              <div className="p-2 bg-[#0E1523] rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[10px]">Optimality:</span>
                <span className="text-emerald-400 font-bold">{dossier.audit_proof.optimality_condition}</span>
              </div>
              <div className="p-2 bg-[#0E1523] rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[10px]">Laytime Rate:</span>
                <span className="text-slate-200">$28,500 / day</span>
              </div>
              <div className="p-2 bg-[#0E1523] rounded border border-[#1E293B]">
                <span className="text-slate-400 block text-[10px]">Fuel Model:</span>
                <span className="text-slate-200">Admiralty v³ Law</span>
              </div>
            </div>
          </div>

          {/* Statutory Auditor Statement */}
          <div className="p-3.5 bg-blue-950/30 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 flex items-start space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              This digital audit certificate attests under penalty of statutory scrutiny that speed advisories, port turnaround queue delays, and charter dispatch triggers were generated deterministically through convex iterative projection without manual discretion or procurement manipulation.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-3.5 border-t border-[#1E293B] flex justify-between items-center">
          <span className="text-[11px] font-mono text-slate-400">
            Digital Certificate Valid for Sovereign Audit Inspections
          </span>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#161F30] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Certificate / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
