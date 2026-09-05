"""
BHAIRAV Identity Verification Engine.

Real, deterministic verification that combines:
  1. Document field extraction (via document_engine.extract_fields)
  2. Field consistency checks (DOB, name, photo presence flags)
  3. ID checksum validation (Verhoeff for Aadhaar, regex for PAN/Passport/etc.)
  4. Cross-field plausibility (age range, name format)

This is NOT biometric verification. The 'confidence' reflects how many
checks passed, not face-match probability.
"""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.services.document_engine import extract_fields, _verhoeff_check


NAME_RE = re.compile(r"^[A-Z][a-zA-Z\.\s'-]{1,60}$")


def _age_from_dob(dob: str) -> Optional[int]:
    for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            d = datetime.strptime(dob, fmt)
            today = datetime.utcnow()
            return today.year - d.year - ((today.month, today.day) < (d.month, d.day))
        except ValueError:
            continue
    return None


def _check_name(field: Dict[str, Any]) -> Dict[str, Any]:
    if not field:
        return {"name": "name_format", "status": "REVIEW", "reason": "Name not present"}
    v = field["value"].strip()
    if NAME_RE.match(v):
        return {"name": "name_format", "status": "PASS"}
    return {"name": "name_format", "status": "REVIEW", "reason": f"Name format unusual: '{v[:30]}'"}


def _check_dob(field: Dict[str, Any]) -> Dict[str, Any]:
    if not field:
        return {"name": "dob_validity", "status": "REVIEW", "reason": "DOB not present"}
    age = _age_from_dob(field["value"])
    if age is None:
        return {"name": "dob_validity", "status": "REVIEW", "reason": "Unparseable DOB"}
    if age < 16 or age > 120:
        return {"name": "dob_validity", "status": "FAIL", "reason": f"Implausible age: {age}"}
    return {"name": "dob_validity", "status": "PASS"}


def _check_aadhaar(field: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not field:
        return {"name": "aadhaar_checksum", "status": "REVIEW", "reason": "No Aadhaar field"}
    digits = re.sub(r"\D", "", field["value"])
    if len(digits) != 12:
        return {"name": "aadhaar_checksum", "status": "FAIL", "reason": "Not 12 digits"}
    if not _verhoeff_check(digits):
        return {"name": "aadhaar_checksum", "status": "FAIL", "reason": "Verhoeff checksum failed"}
    return {"name": "aadhaar_checksum", "status": "PASS"}


def _check_pan(field: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not field:
        return {"name": "pan_format", "status": "REVIEW", "reason": "No PAN field"}
    if re.fullmatch(r"[A-Z]{5}\d{4}[A-Z]", field["value"]):
        return {"name": "pan_format", "status": "PASS"}
    return {"name": "pan_format", "status": "FAIL", "reason": "PAN format mismatch"}


def _check_passport(field: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not field:
        return {"name": "passport_format", "status": "REVIEW", "reason": "No passport field"}
    if re.fullmatch(r"[A-PR-WY][1-9]\d{6}", field["value"]):
        return {"name": "passport_format", "status": "PASS"}
    return {"name": "passport_format", "status": "FAIL", "reason": "Passport format mismatch"}


def _check_phone(field: Optional[Dict[str, Any]]) -> Dict[str, Any]:
    if not field:
        return {"name": "phone_format", "status": "REVIEW", "reason": "No phone field"}
    if re.fullmatch(r"[6-9]\d{9}", field["value"]):
        return {"name": "phone_format", "status": "PASS"}
    return {"name": "phone_format", "status": "FAIL", "reason": "Indian mobile format mismatch"}


def _aggregate_status(checks: List[Dict[str, Any]]) -> str:
    statuses = [c["status"] for c in checks]
    if "FAIL" in statuses:
        return "FAIL"
    if "REVIEW" in statuses:
        return "REVIEW_REQUIRED"
    return "PASS"


def _aggregate_confidence(checks: List[Dict[str, Any]]) -> float:
    score = {"PASS": 1.0, "REVIEW": 0.6, "FAIL": 0.1}
    if not checks:
        return 0.0
    return round(sum(score.get(c["status"], 0.0) for c in checks) / len(checks), 3)


def verify(
    verification_id: Optional[str],
    text: str,
    expected: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Run the verification engine on a document text and optional expected fields.
    """
    verification_id = verification_id or str(uuid.uuid4())
    extraction = extract_fields(verification_id, text)
    fields = {f["name"]: f for f in extraction["fields"]}

    checks: List[Dict[str, Any]] = []
    checks.append(_check_name(fields.get("Name")))
    checks.append(_check_dob(fields.get("Date of Birth")))
    checks.append(_check_aadhaar(fields.get("Aadhaar Number")))
    checks.append(_check_pan(fields.get("PAN Number")))
    checks.append(_check_passport(fields.get("Passport Number")))
    checks.append(_check_phone(fields.get("Phone")))

    # Optional cross-check vs expected fields from the requester
    mismatches: List[str] = []
    if expected:
        for k, v in expected.items():
            extracted = fields.get(k)
            if extracted is None:
                mismatches.append(f"Expected '{k}' not present in document")
            elif str(extracted["value"]).strip().lower() != str(v).strip().lower():
                mismatches.append(
                    f"'{k}' mismatch (expected '{v}', got '{extracted['value']}')"
                )
                checks.append(
                    {
                        "name": f"expected_{k.lower()}",
                        "status": "FAIL",
                        "reason": mismatches[-1],
                    }
                )
            else:
                checks.append(
                    {"name": f"expected_{k.lower()}", "status": "PASS"}
                )

    status = _aggregate_status(checks)
    confidence = _aggregate_confidence(checks)
    reasons = [c.get("reason", "") for c in checks if c["status"] in ("FAIL", "REVIEW") and c.get("reason")]

    return {
        "verification_id": verification_id,
        "status": status,
        "confidence": confidence,
        "checks": checks,
        "reasons": reasons,
        "mismatches": mismatches,
        "evidence": {
            "document_type": extraction["document_type"],
            "extracted_fields": [f["name"] for f in extraction["fields"]],
            "valid_field_count": extraction["summary"]["valid_count"],
            "invalid_field_count": extraction["summary"]["invalid_count"],
        },
        "model_info": {
            "engine": "BHAIRAV Identity Engine (document field extraction + validators)",
            "method": "deterministic_rule_based",
            "version": "1.0",
            "processing_mode": "extractive",
            "checks": [c["name"] for c in checks],
            "notes": "NOT a biometric system. Confidence reflects rule-based check pass rate, not face-match probability.",
        },
    }
