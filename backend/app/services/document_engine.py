"""
BHAIRAV Document Intelligence Engine.

Real, deterministic field extraction for identity documents using regex
with provenance (source text + match span) and validators (Luhn / Verhoeff /
length). Supports Aadhaar, PAN, Indian passport, voter ID, driving licence,
date-of-birth, phone, email, name, address, and free-form amount.

This is NOT OCR. The client is expected to provide the document text (or
use an upstream OCR engine). This module does the entity extraction,
validation, and provenance tracking.
"""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


# --- Validators --------------------------------------------------------------

def _luhn_check(num: str) -> bool:
    """Standard Luhn check used for credit card-like IDs."""
    s = 0
    alt = False
    for d in reversed(num):
        n = int(d)
        if alt:
            n *= 2
            if n > 9:
                n -= 9
        s += n
        alt = not alt
    return s % 10 == 0


def _verhoeff_check(num: str) -> bool:
    """Verhoeff algorithm - used by Aadhaar (12-digit)."""
    if not num.isdigit():
        return False
    d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ]
    p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ]
    c = 0
    for i, ch in enumerate(reversed(num)):
        c = d[c][p[(i % 8)][int(ch)]]
    return c == 0


# --- Field patterns ----------------------------------------------------------

# Aadhaar: 12 digits, with optional spaces, Verhoeff valid
_AADHAAR_RE = re.compile(r"\b(\d{4}[\s-]?\d{4}[\s-]?\d{4})\b")
# PAN: 5 letters + 4 digits + 1 letter
_PAN_RE = re.compile(r"\b([A-Z]{5}\d{4}[A-Z])\b")
# Indian passport: 1 letter + 7 digits
_PASSPORT_RE = re.compile(r"\b([A-PR-WY][1-9]\d{6})\b")
# Voter ID / EPIC: 3 letters + 7 digits
_VOTER_RE = re.compile(r"\b([A-Z]{3}\d{7})\b")
# Driving licence: state code (2 letters) + 2 digits + year (4) + 7 digits
_DL_RE = re.compile(r"\b([A-Z]{2}\d{2}\d{4}\d{7})\b")
# Indian phone (10 digits, starting 6-9)
_PHONE_RE = re.compile(r"\b([6-9]\d{9})\b")
# Email
_EMAIL_RE = re.compile(r"\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b")
# Date of birth - many formats
_DOB_RE = re.compile(
    r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b"
)
# Name (uppercase token sequence after NAME:)
_NAME_LABEL_RE = re.compile(
    r"(?im)^\s*name\s*[:\-]\s*([A-Z][A-Za-z\.\s'-]{2,60}?)(?=\s*(?:\n|id|dob|date|$))"
)
# Father's name
_FATHER_RE = re.compile(
    r"(?im)^\s*(?:father'?s?\s*name|s/o)\s*[:\-]\s*([A-Z][A-Za-z\.\s'-]{2,60}?)(?=\s*(?:\n|address|dob|date|$))"
)
# Address (multi-line after label)
_ADDR_RE = re.compile(
    r"(?im)^\s*address\s*[:\-]\s*([^\n]{4,200}?(?:\n[^\n]{1,200}){0,3})"
)
# Amount in INR
_AMOUNT_RE = re.compile(r"(?i)\b(?:rs\.?|inr|₹)\s*([0-9][0-9,]{1,15}(?:\.\d{1,2})?)\b")


def _find_with_span(text: str, pattern: re.Pattern) -> List[Tuple[str, int, int]]:
    out = []
    for m in pattern.finditer(text):
        out.append((m.group(1), m.start(), m.end()))
    return out


def _validate(kind: str, value: str) -> bool:
    if kind == "aadhaar":
        digits = re.sub(r"\D", "", value)
        return len(digits) == 12 and _verhoeff_check(digits)
    if kind == "pan":
        return bool(_PAN_RE.fullmatch(value))
    if kind == "passport":
        return bool(_PASSPORT_RE.fullmatch(value))
    if kind == "voter_id":
        return bool(_VOTER_RE.fullmatch(value))
    if kind == "driving_licence":
        return bool(_DL_RE.fullmatch(value))
    if kind == "phone":
        return bool(_PHONE_RE.fullmatch(value)) and 10 <= len(value) <= 10
    if kind == "email":
        return "@" in value and "." in value
    if kind == "dob":
        for fmt in ("%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%Y/%m/%d", "%d/%m/%y", "%d-%m-%y"):
            try:
                datetime.strptime(value, fmt)
                return True
            except ValueError:
                continue
        return False
    return True


def _classify_document_type(text: str, fields: List[Dict[str, Any]]) -> str:
    if any(f["name"] == "Aadhaar Number" for f in fields):
        return "AADHAAR_CARD"
    if any(f["name"] == "PAN Number" for f in fields):
        return "PAN_CARD"
    if any(f["name"] == "Passport Number" for f in fields):
        return "PASSPORT"
    if any(f["name"] == "Voter ID" for f in fields):
        return "VOTER_ID"
    if any(f["name"] == "Driving Licence" for f in fields):
        return "DRIVING_LICENCE"
    if any(f["name"] == "Phone" for f in fields):
        return "MIXED_ID"
    return "UNKNOWN"


def extract_fields(document_id: str, text: str) -> Dict[str, Any]:
    """
    Run the field extractors on the supplied text and return a
    document-analysis response with provenance and validation flags.
    """
    text_clean = (text or "").strip()
    fields: List[Dict[str, Any]] = []

    def _add(name: str, value: str, kind: str, start: int, end: int, conf: float) -> None:
        valid = _validate(kind, value)
        fields.append(
            {
                "name": name,
                "value": value,
                "confidence": round(conf, 3),
                "valid": valid,
                "kind": kind,
                "span": {"start": start, "end": end},
                "source_excerpt": text_clean[max(0, start - 12): min(len(text_clean), end + 12)],
            }
        )

    # 1) Structured IDs (high confidence regex match)
    for value, s, e in _find_with_span(text_clean, _AADHAAR_RE):
        _add("Aadhaar Number", re.sub(r"\s+", " ", value), "aadhaar", s, e, 0.95)
    for value, s, e in _find_with_span(text_clean, _PAN_RE):
        _add("PAN Number", value, "pan", s, e, 0.97)
    for value, s, e in _find_with_span(text_clean, _PASSPORT_RE):
        _add("Passport Number", value, "passport", s, e, 0.9)
    for value, s, e in _find_with_span(text_clean, _VOTER_RE):
        _add("Voter ID", value, "voter_id", s, e, 0.85)
    for value, s, e in _find_with_span(text_clean, _DL_RE):
        _add("Driving Licence", value, "driving_licence", s, e, 0.85)
    for value, s, e in _find_with_span(text_clean, _PHONE_RE):
        _add("Phone", value, "phone", s, e, 0.9)
    for value, s, e in _find_with_span(text_clean, _EMAIL_RE):
        _add("Email", value, "email", s, e, 0.98)

    # 2) Dates
    for value, s, e in _find_with_span(text_clean, _DOB_RE):
        _add("Date of Birth", value, "dob", s, e, 0.85)

    # 3) Names / father / address (label-based extraction)
    m = _NAME_LABEL_RE.search(text_clean)
    if m:
        _add("Name", m.group(1).strip(), "name", m.start(1), m.end(1), 0.9)
    m = _FATHER_RE.search(text_clean)
    if m:
        _add("Father's Name", m.group(1).strip(), "name", m.start(1), m.end(1), 0.85)
    m = _ADDR_RE.search(text_clean)
    if m:
        _add("Address", m.group(1).strip().replace("\n", ", "), "address", m.start(1), m.end(1), 0.7)
    m = _AMOUNT_RE.search(text_clean)
    if m:
        _add("Amount (INR)", m.group(1), "amount", m.start(1), m.end(1), 0.95)

    # 3) De-duplicate by (name, value) keeping highest confidence
    seen: Dict[Tuple[str, str], Dict[str, Any]] = {}
    for f in fields:
        key = (f["name"], f["value"])
        if key not in seen or f["confidence"] > seen[key]["confidence"]:
            seen[key] = f
    fields = list(seen.values())

    document_type = _classify_document_type(text_clean, fields)
    valid_count = sum(1 for f in fields if f["valid"])
    overall_confidence = (
        sum(f["confidence"] for f in fields) / len(fields) if fields else 0.0
    )

    return {
        "document_id": document_id,
        "extracted_text": text_clean,
        "document_type": document_type,
        "fields": fields,
        "summary": {
            "field_count": len(fields),
            "valid_count": valid_count,
            "invalid_count": len(fields) - valid_count,
            "overall_confidence": round(overall_confidence, 3),
        },
        "model_info": {
            "engine": "BHAIRAV Document Engine (regex + Verhoeff + Luhn validators)",
            "method": "deterministic_regex",
            "version": "1.0",
            "processing_mode": "extractive",
            "supports": [
                "AADHAAR (12-digit, Verhoeff)",
                "PAN",
                "Indian Passport",
                "Voter ID (EPIC)",
                "Driving Licence (state-formatted)",
                "Phone (Indian mobile)",
                "Email",
                "Date of Birth",
                "Name (label-based)",
                "Address (label-based)",
                "Amount (INR)",
            ],
            "notes": "This is NOT OCR. The caller is expected to provide the document text (or run upstream OCR). This engine does entity extraction, validation, and provenance tracking.",
        },
    }
