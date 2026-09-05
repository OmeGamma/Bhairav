"""
BHAIRAV Structured Data Ingestion Service.

Handles parsing and validation of:
- CDR (Call Detail Records)
- Financial transaction records
- Other CSV/XLSX/JSON structured data

Produces IngestionResult records with validation counts and provenance.
"""
from __future__ import annotations

import csv
import io
import json
import re
from datetime import datetime
from typing import Any, Dict, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.schemas.evidence import IngestionResultCreate, IngestionResultResponse
from app.services.evidence_service import evidence_service

INGESTION_RESULTS_COLLECTION = "ingestion_results"


class StructuredDataIngestionService:
    """Service for ingesting and validating structured data files."""

    async def ingest_cdr(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        content: bytes,
        job_id: Optional[str] = None,
        created_by: str = "system",
    ) -> IngestionResultResponse:
        """Parse and validate CDR data from CSV content."""
        try:
            text = content.decode("utf-8", errors="replace")
            reader = csv.DictReader(io.StringIO(text))
            rows = list(reader)
        except Exception as e:
            result = IngestionResultCreate(
                file_id=file_id,
                job_id=job_id,
                total_records=0,
                valid_records=0,
                invalid_records=0,
                duplicate_records=0,
                errors=[f"CSV parsing failed: {str(e)}"],
            )
            return await self._save_result(db, result, created_by)

        required_fields = {"caller", "receiver", "timestamp", "duration", "cell_tower", "call_type"}
        seen = set()
        valid_count = 0
        invalid_count = 0
        duplicate_count = 0
        warnings: List[str] = []
        errors: List[str] = []
        invalid_rows: List[Dict[str, Any]] = []

        for idx, row in enumerate(rows, start=2):
            cleaned_row = {k: v.strip() if isinstance(v, str) else v for k, v in row.items()}
            missing = required_fields - set(cleaned_row.keys())
            if missing:
                invalid_count += 1
                invalid_rows.append({"row": idx, "error": f"Missing fields: {sorted(missing)}", "data": cleaned_row})
                continue

            caller = (cleaned_row.get("caller") or "").strip()
            receiver = (cleaned_row.get("receiver") or "").strip()
            timestamp = (cleaned_row.get("timestamp") or "").strip()
            duration_str = (cleaned_row.get("duration") or "").strip()
            cell_tower = (cleaned_row.get("cell_tower") or "").strip()
            call_type = (cleaned_row.get("call_type") or "").strip()

            row_errors = []

            if not re.fullmatch(r"\+?[\d\-\s]{10,15}", caller):
                row_errors.append("Invalid caller phone format")
            if not re.fullmatch(r"\+?[\d\-\s]{10,15}", receiver):
                row_errors.append("Invalid receiver phone format")
            if not timestamp:
                row_errors.append("Missing timestamp")
            try:
                int(duration_str)
            except ValueError:
                row_errors.append("Invalid duration (must be integer seconds)")
            if not cell_tower:
                row_errors.append("Missing cell_tower")
            if call_type.upper() not in {"OUTGOING", "INCOMING", "MISSED"}:
                row_errors.append(f"Unknown call_type: {call_type}")

            record_key = f"{caller}|{receiver}|{timestamp}|{duration_str}"
            if record_key in seen:
                duplicate_count += 1
                continue
            seen.add(record_key)

            if row_errors:
                invalid_count += 1
                invalid_rows.append({"row": idx, "errors": row_errors, "data": dict(row)})
            else:
                valid_count += 1

        if invalid_rows:
            warnings.append(f"{len(invalid_rows)} invalid rows detected")

        result = IngestionResultCreate(
            file_id=file_id,
            job_id=job_id,
            total_records=len(rows),
            valid_records=valid_count,
            invalid_records=invalid_count,
            duplicate_records=duplicate_count,
            warnings=warnings,
            errors=errors,
            metadata={"source_type": "CDR", "invalid_rows": invalid_rows[:10]},
        )
        return await self._save_result(db, result, created_by)

    async def ingest_financial(
        self,
        db: AsyncIOMotorDatabase,
        file_id: str,
        content: bytes,
        job_id: Optional[str] = None,
        created_by: str = "system",
    ) -> IngestionResultResponse:
        """Parse and validate financial transaction data from CSV/JSON content."""
        text = content.decode("utf-8", errors="replace")
        rows: List[Dict[str, Any]] = []

        if file_id:
            doc = await db[INGESTION_RESULTS_COLLECTION].find_one({"file_id": file_id})
            if doc and doc.get("metadata", {}).get("source_type") == "JSON":
                try:
                    data = json.loads(text)
                    if isinstance(data, list):
                        rows = data
                    elif isinstance(data, dict):
                        rows = [data]
                except Exception as e:
                    result = IngestionResultCreate(
                        file_id=file_id,
                        job_id=job_id,
                        total_records=0,
                        valid_records=0,
                        invalid_records=0,
                        duplicate_records=0,
                        errors=[f"JSON parsing failed: {str(e)}"],
                    )
                    return await self._save_result(db, result, created_by)
            else:
                try:
                    reader = csv.DictReader(io.StringIO(text))
                    rows = list(reader)
                except Exception as e:
                    result = IngestionResultCreate(
                        file_id=file_id,
                        job_id=job_id,
                        total_records=0,
                        valid_records=0,
                        invalid_records=0,
                        duplicate_records=0,
                        errors=[f"CSV parsing failed: {str(e)}"],
                    )
                    return await self._save_result(db, result, created_by)
        else:
            try:
                reader = csv.DictReader(io.StringIO(text))
                rows = list(reader)
            except Exception as e:
                result = IngestionResultCreate(
                    file_id=file_id,
                    job_id=job_id,
                    total_records=0,
                    valid_records=0,
                    invalid_records=0,
                    duplicate_records=0,
                    errors=[f"CSV parsing failed: {str(e)}"],
                )
                return await self._save_result(db, result, created_by)

        required_fields = {"transaction_id", "sender", "receiver", "account", "amount", "timestamp", "location", "transaction_type"}
        seen = set()
        valid_count = 0
        invalid_count = 0
        duplicate_count = 0
        warnings: List[str] = []
        errors: List[str] = []
        invalid_rows: List[Dict[str, Any]] = []

        for idx, row in enumerate(rows, start=2 if file_id and not (doc and doc.get("metadata", {}).get("source_type") == "JSON") else 1):
            cleaned_row = {k: v.strip() if isinstance(v, str) else v for k, v in row.items()}
            missing = required_fields - set(cleaned_row.keys())
            if missing:
                invalid_count += 1
                invalid_rows.append({"row": idx, "error": f"Missing fields: {sorted(missing)}", "data": cleaned_row})
                continue

            txn_id = (cleaned_row.get("transaction_id") or "").strip()
            amount_str = (cleaned_row.get("amount") or "").strip()
            timestamp = (cleaned_row.get("timestamp") or "").strip()
            txn_type = (cleaned_row.get("transaction_type") or "").strip()

            row_errors = []

            if not txn_id:
                row_errors.append("Missing transaction_id")
            try:
                float(amount_str)
            except ValueError:
                row_errors.append("Invalid amount (must be numeric)")
            if not timestamp:
                row_errors.append("Missing timestamp")
            if txn_type.upper() not in {"TRANSFER", "CASH_DEPOSIT", "CASH_WITHDRAWAL", "CARD", "UPI", "CHEQUE"}:
                row_errors.append(f"Unknown transaction_type: {txn_type}")

            record_key = f"{txn_id}|{amount_str}|{timestamp}"
            if record_key in seen:
                duplicate_count += 1
                continue
            seen.add(record_key)

            if row_errors:
                invalid_count += 1
                invalid_rows.append({"row": idx, "errors": row_errors, "data": dict(row)})
            else:
                valid_count += 1

        if invalid_rows:
            warnings.append(f"{len(invalid_rows)} invalid rows detected")

        result = IngestionResultCreate(
            file_id=file_id,
            job_id=job_id,
            total_records=len(rows),
            valid_records=valid_count,
            invalid_records=invalid_count,
            duplicate_records=duplicate_count,
            warnings=warnings,
            errors=errors,
            metadata={"source_type": "FINANCIAL_RECORD", "invalid_rows": invalid_rows[:10]},
        )
        return await self._save_result(db, result, created_by)

    async def _save_result(
        self,
        db: AsyncIOMotorDatabase,
        result: IngestionResultCreate,
        created_by: str,
    ) -> IngestionResultResponse:
        result_dict = result.model_dump()
        result_dict["created_at"] = datetime.utcnow()
        res = await db[INGESTION_RESULTS_COLLECTION].insert_one(result_dict)
        result_dict["id"] = str(res.inserted_id)
        return IngestionResultResponse(**result_dict)


structured_data_ingestion_service = StructuredDataIngestionService()
