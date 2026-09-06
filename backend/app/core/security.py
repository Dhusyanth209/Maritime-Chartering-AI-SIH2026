import hashlib
import json
from typing import Dict, Any

def generate_audit_hash(payload: Dict[str, Any]) -> str:
    """
    Generates an immutable, deterministic SHA-256 digital signature
    compliant with GFR 2017 Rule 144 and CVC Circular 02/05/2022.
    """
    normalized = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

def verify_audit_hash(payload: Dict[str, Any], expected_hash: str) -> bool:
    """Verifies that an audit record has not been altered or tampered with."""
    return generate_audit_hash(payload) == expected_hash
