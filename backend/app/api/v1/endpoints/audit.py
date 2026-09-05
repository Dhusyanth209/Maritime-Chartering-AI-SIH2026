from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.security import generate_audit_hash, verify_audit_hash
from app.core.config import settings

router = APIRouter()

class AuditGenerateRequest(BaseModel):
    decision_summary: Dict[str, Any]
    authorized_officer: Optional[str] = "Chief Chartering Officer (Ministry of Steel / SAIL)"
    department: Optional[str] = "Raw Materials & Bulk Maritime Logistics Wing"

class AuditVerifyRequest(BaseModel):
    payload: Dict[str, Any]
    signature_hash: str

@router.post("/generate")
def generate_audit_trail(payload: AuditGenerateRequest):
    """
    Generates an immutable, GFR 2017 Rule 144 and CVC compliant
    digital cryptographic certificate for public sector chartering tenders.
    """
    timestamp_utc = datetime.now(timezone.utc).isoformat()
    audit_record = {
        "timestamp_utc": timestamp_utc,
        "standard": "Government of India General Financial Rules (GFR) 2017 Rule 144 & CVC 02/05/2022",
        "ministry": "Ministry of Steel (Government of India)",
        "authorized_officer": payload.authorized_officer,
        "department": payload.department,
        "decision_summary": payload.decision_summary
    }

    signature = generate_audit_hash(audit_record)

    return {
        "status": "success",
        "certificate_id": f"GOI-PADCE-{signature[:12].upper()}",
        "signature_hash": signature,
        "hash_algorithm": "SHA-256",
        "timestamp_utc": timestamp_utc,
        "compliance": {
            "gfr_rule": "GFR 2017 Rule 144 (Transparency, Competition & Fairness)",
            "cvc_guideline": "CVC Circular 02/05/2022 (Public Procurement Digital Trail)",
            "validity": "Tamper-proof Cryptographically Auditable"
        },
        "audit_record": audit_record
    }

@router.post("/verify")
def verify_audit_record(payload: AuditVerifyRequest):
    """
    Verifies that a procurement record has not been altered or tampered with.
    """
    is_valid = verify_audit_hash(payload.payload, payload.signature_hash)
    return {
        "status": "success",
        "is_valid": is_valid,
        "message": "Signature verified: Document is authentic and untampered." if is_valid else "Verification failed: Data does not match signature!"
    }
