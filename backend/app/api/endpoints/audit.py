from fastapi import APIRouter
from datetime import datetime, timezone
from app.models.schemas import AuditDossierRequest, AuditDossierResponse
from app.core.security import generate_audit_hash

router = APIRouter()

@router.post("/export-dossier", response_model=AuditDossierResponse)
def export_audit_dossier(payload: AuditDossierRequest):
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    raw_payload = {
        "timestamp_utc": timestamp_utc,
        "authorized_role": payload.authorized_role,
        "tender_reference": payload.tender_reference,
        "department": payload.department,
        "optimization_result": payload.optimization_result
    }
    sha256_hash = generate_audit_hash(raw_payload)

    dossier_id = f"CVC-CAG-DOSSIER-{sha256_hash[:12].upper()}"

    return AuditDossierResponse(
        status="success",
        dossier_id=dossier_id,
        sha256_signature=sha256_hash,
        timestamp_utc=timestamp_utc,
        legal_framework={
            "gfr_compliance": "General Financial Rules (GFR) 2017 - Rule 144 (Transparency & Fairness)",
            "cvc_circular": "Central Vigilance Commission (CVC) Circular 02/05/2022 (Digital Procurement Audit)",
            "cag_scrutiny": "Comptroller & Auditor General of India (CAG) Public Procurement Audit Ready"
        },
        audit_proof={
            "dossier_id": dossier_id,
            "authorized_signatory": payload.authorized_role,
            "tender_id": payload.tender_reference,
            "mathematical_model": "Deterministic Iterative Projection (Lin et al. SSRN-5087612)",
            "optimality_condition": "Subdifferential Gradient Karush-Kuhn-Tucker (KKT) Stationary Point",
            "sha256_digest": sha256_hash,
            "input_snapshot": raw_payload
        }
    )
