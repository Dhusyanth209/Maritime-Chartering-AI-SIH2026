import React, { useState } from "react";
import { AuditCertificateResponse } from "../../services/api";

interface AuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditCert: AuditCertificateResponse | null;
}

export const AuditReportModal: React.FC<AuditReportModalProps> = ({
  isOpen,
  onClose,
  auditCert
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !auditCert) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(auditCert.signature_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border-2 border-sky-500/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Certificate Header Emblem */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-2xl">
              🏛️
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-sky-400 block">
                Government of India • Ministry of Steel
              </span>
              <h3 className="text-lg font-black text-white">
                Public Procurement Digital Audit Certificate
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Certificate Body */}
        <div className="mt-4 space-y-4 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Certificate ID:</span>
                <span className="text-white font-mono font-bold text-sm">{auditCert.certificate_id}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Timestamp (UTC):</span>
                <span className="text-white font-mono">{auditCert.timestamp_utc}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Compliance Standard:</span>
                <span className="text-emerald-400 font-bold">{auditCert.compliance.gfr_rule}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">CVC Protocol:</span>
                <span className="text-sky-300 font-bold">{auditCert.compliance.cvc_guideline}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                SHA-256 Tamper-Proof Cryptographic Signature:
              </span>
              <button
                onClick={copyHash}
                className="text-[10px] text-sky-400 hover:underline font-semibold"
              >
                {copied ? "Copied! ✓" : "Copy Hash"}
              </button>
            </div>
            <div className="bg-slate-950 border border-sky-900/60 p-3 rounded-xl font-mono text-[11px] text-sky-300 break-all select-all">
              {auditCert.signature_hash}
            </div>
          </div>

          {/* Decision Summary Recorded */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
              Audited Chartering Parameters:
            </span>
            <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto">
              {JSON.stringify(auditCert.audit_record.decision_summary, null, 2)}
            </pre>
          </div>

          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center space-x-2">
            <span>🛡️</span>
            <span>
              This cryptographic record satisfies GFR 2017 Rule 144 requirements for public sector procurement audit readiness and CVC scrutiny.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex justify-end space-x-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            🖨️ Print / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
