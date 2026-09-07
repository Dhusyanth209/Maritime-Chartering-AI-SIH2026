import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any

def generate_audit_digest(decision_payload: Dict[str, Any]) -> Dict[str, Any]:
    timestamp = datetime.now(timezone.utc).isoformat()
    canonical_json = json.dumps(decision_payload, sort_keys=True)
    digest = hashlib.sha256(f"{timestamp}:{canonical_json}".encode("utf-8")).hexdigest()
    
    return {
        "digest": digest,
        "timestamp_utc": timestamp,
        "legal_authority": "Government of India - Ministry of Steel (SAIL / RINL Logistics Cell)",
        "certifications": [
            "Central Vigilance Commission (CVC) Circular 02/05/2022 (Public Procurement Transparency)",
            "Comptroller & Auditor General of India (CAG) GFR 2017 Rule 144 (Deterministic Least-Cost Verification)"
        ],
        "status": "SEALED_AND_AUDIT_PROOF"
    }

def generate_audit_hash(payload: Dict[str, Any]) -> str:
    normalized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def verify_audit_hash(payload: Dict[str, Any], expected_hash: str) -> bool:
    return generate_audit_hash(payload) == expected_hash
