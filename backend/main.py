from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import re
import math
import google.generativeai as genai
from typing import List, Optional

from config.database import check_connection
from models.case import (
    create_case,
    get_all_cases,
    get_case_by_id,
    update_case,
    close_case,
    search_cases,
    get_cases_by_city,
    get_cases_by_crime_type,
    get_cases_by_status,
    get_cases_by_priority,
    get_monthly_trends,
)
from models.notification import (
    create_notification,
    get_all_notifications,
    mark_notification_read,
    mark_all_notifications_read,
)
from models.audit_log import create_audit_log, get_audit_logs
from models.report import create_report, get_reports_by_case
from models.evidence import create_evidence, get_evidence_by_case
from models.document import create_document, get_documents_by_case
from models.video import create_video, get_videos_by_case
from models.person import create_person, get_persons_by_case, search_persons
from models.vehicle import create_vehicle, get_vehicles_by_case
from models.organization import create_organization, get_organizations_by_case
from models.fir import create_fir, get_firs_by_case
import schemas
import document_processor as doc_proc
from intelligence_engine import process_nl_query

check_connection()

app = FastAPI(title="Bhairav API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

@app.get("/")
def read_root():
    return {"message": "Bhairav API is running"}

@app.get("/api/cases")
def get_cases():
    cases = get_all_cases()
    return cases

@app.post("/api/cases")
def create_case_api(case_in: schemas.CaseCreate):
    existing = get_case_by_id(case_in.case_number)
    if existing:
        raise HTTPException(status_code=400, detail="Case number already exists")
    
    data = case_in.dict()
    if data.get("location"):
        data["location"] = data["location"]
    new_case = create_case(data)
    
    create_audit_log({
        "action": "CASE_CREATED",
        "entityType": "Case",
        "entityId": new_case["caseNumber"],
        "description": f"Case {new_case['caseNumber']} was created.",
        "userId": "Officer",
    })
    create_notification({
        "type": "CASE_CREATED",
        "title": "New Case Created",
        "message": f"New case {new_case['caseNumber']} has been filed.",
        "caseId": new_case["caseNumber"],
        "userId": "Officer",
    })
    return new_case

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.put("/api/cases/{case_id}")
def update_case_api(case_id: str, case_in: schemas.CaseUpdate):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    update_data = case_in.dict(exclude_unset=True)
    if "location" in update_data and update_data["location"]:
        case["location"] = update_data["location"]
        update_data.pop("location", None)
    
    updated = update_case(case_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")
    
    create_audit_log({
        "action": "CASE_UPDATED",
        "entityType": "Case",
        "entityId": case_id,
        "description": f"Case {case_id} was updated.",
        "userId": "Officer",
    })
    create_notification({
        "type": "CASE_UPDATED",
        "title": "Case Updated",
        "message": f"Case {case_id} was updated.",
        "caseId": case_id,
        "userId": "Officer",
    })
    return updated

@app.patch("/api/cases/{case_id}/close")
def close_case_api(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    closed = close_case(case_id)
    if not closed:
        raise HTTPException(status_code=404, detail="Case not found")
    
    create_audit_log({
        "action": "CASE_CLOSED",
        "entityType": "Case",
        "entityId": case_id,
        "description": f"Case {case_id} was closed.",
        "userId": "Officer",
    })
    create_notification({
        "type": "CASE_CLOSED",
        "title": "Case Closed",
        "message": f"Case {case_id} was closed.",
        "caseId": case_id,
        "userId": "Officer",
    })
    return closed

@app.get("/api/network/{case_id}")
def get_network(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    nodes = []
    edges = []
    
    nodes.append({
        "id": f"case_{case_id}",
        "data": {"label": case.get("caseNumber", case_id), "type": "Case"},
        "type": "customNode",
        "position": {"x": 250, "y": 250},
        "style": {"background": "#EFF6FF", "border": "2px solid #3B82F6", "borderRadius": "8px", "padding": "10px"}
    })

    entities = []
    for s in case.get("suspects", []):
        entities.append(("suspect", s.get("_id", s.get("name")), s.get("name"), "#FEE2E2", "#EF4444", "Suspect"))
    for p in case.get("persons", []):
        entities.append(("person", p.get("_id", p.get("name")), p.get("name"), "#F3F4F6", "#6B7280", "Person"))
    for v in case.get("victims", []):
        entities.append(("victim", v.get("_id", v.get("name")), v.get("name"), "#FEF3C7", "#D97706", "Victim"))
    for ev in case.get("evidences", []):
        entities.append(("evidence", ev.get("_id", ev.get("evidenceId")), ev.get("evidenceId"), "#D1FAE5", "#10B981", "Evidence"))
    for d in case.get("documents", []):
        entities.append(("document", d.get("_id", d.get("documentId")), d.get("documentId"), "#E0E7FF", "#4F46E5", "Document"))
    for vid in case.get("videos", []):
        entities.append(("video", vid.get("_id", vid.get("videoId")), vid.get("videoId"), "#FCE7F3", "#EC4899", "Video"))
    for veh in case.get("vehicles", []):
        entities.append(("vehicle", veh.get("_id", veh.get("vehicleId")), veh.get("vehicleId"), "#E0F2FE", "#0284C7", "Vehicle"))
    for org in case.get("organizations", []):
        entities.append(("org", org.get("_id", org.get("name")), org.get("name"), "#EDE9FE", "#8B5CF6", "Organization"))
    for fir in case.get("firs", []):
        entities.append(("fir", fir.get("_id", fir.get("firNumber")), fir.get("firNumber"), "#FFEDD5", "#EA580C", "FIR"))
    if case.get("location"):
        loc = case["location"]
        entities.append(("loc", case_id, loc.get("city") or loc.get("district") or loc.get("state"), "#ECFCCB", "#65A30D", "Location"))

    total = len(entities)
    for idx, (etype, eid, elabel, bg, bd, ltype) in enumerate(entities):
        n_id = f"{etype}_{eid}"
        angle = (2 * math.pi / total) * idx if total > 0 else 0
        nodes.append({
            "id": n_id,
            "data": {"label": str(elabel), "type": ltype},
            "position": {"x": 250 + 200 * math.cos(angle), "y": 250 + 200 * math.sin(angle)},
            "style": {"background": bg, "border": f"2px solid {bd}", "borderRadius": "8px", "padding": "10px"}
        })
        edges.append({
            "id": f"e_case_{case_id}_{n_id}",
            "source": f"case_{case_id}",
            "target": n_id,
            "animated": True,
            "style": {"stroke": bd, "strokeWidth": 2}
        })
    
    return {"nodes": nodes, "edges": edges}

@app.post("/api/analyze", response_model=schemas.AnalyzeResponse)
def analyze_query(req: schemas.AnalyzeRequest):
    raw_query = req.query.strip()
    if not raw_query:
        return {"summary": "Please enter a query to search the Bhairav database.", "results": []}

    tokens = [t.lower() for t in raw_query.split() if t.strip()]
    stopwords = {"case", "the", "in", "at", "of", "and", "or", "for", "to", "a", "an", "is", "are", "was", "were", "on", "from", "by", "with", "without", "into", "new", "old", "show", "find", "search", "look", "get", "all", "any", "some", "no", "not", "yes", "please", "help", "me", "my", "we", "you", "your", "like", "as", "it", "its", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "can", "could", "may", "might", "must", "here", "there", "where", "when", "why", "how", "what", "who", "whom", "which", "this", "that", "these", "those"}
    tokens = [t for t in tokens if t not in stopwords and len(t) > 2]
    if not tokens:
        return {"summary": "Please enter a more specific query.", "results": []}

    results = []
    seen_ids = set()

    def add_result(type_, id_, title, description, match_reason, link):
        if id_ in seen_ids:
            return
        seen_ids.add(id_)
        results.append({
            "type": type_,
            "id": id_,
            "title": title,
            "description": description,
            "match_reason": match_reason,
            "link": link
        })

    for token in tokens:
        matched_cases = search_cases(token)
        for c in matched_cases:
            add_result("Case", c.get("caseNumber", ""), c.get("title", ""), f"{c.get('crimeType', '')} - {c.get('filingDate', '')}", "Matched case details", f"/cases/{c.get('caseNumber', '')}")

        matched_persons = search_persons(token)
        for p in matched_persons:
            add_result("Person", f"PER-{p.get('_id', '')}", p.get("name", ""), f"Role: {p.get('role', '')}", "Matched person name", f"/cases/{p.get('caseId', '')}")

    unique_results = results

    if not unique_results:
        summary = "No matching Bhairav records were found for your query."
    else:
        try:
            if api_key:
                model = genai.GenerativeModel('gemini-flash-latest')
                context_lines = []
                for r in unique_results[:10]:
                    context_lines.append(f"- {r['type']}: {r['title']} ({r['id']}) - {r['description']}")
                context = "\n".join(context_lines)
                prompt = (
                    "You are an AI assistant for Bhairav Intelligence Platform. "
                    "Write a concise 2-3 sentence intelligence executive summary based ONLY on the provided database records. "
                    "Do not invent any new cases, suspects, locations, evidence, or relationships. "
                    "Start with 'AI-ASSISTED ANALYSIS: '.\n\n"
                    f"Query: {raw_query}\nMatched Records ({len(unique_results)}):\n{context}"
                )
                response = model.generate_content(prompt)
                summary = response.text.strip()
            else:
                summary = f"DATABASE RECORD: Found {len(unique_results)} matching records."
        except Exception:
            summary = f"DATABASE RECORD: Found {len(unique_results)} matching records. (AI summarization unavailable)"

    return {
        "summary": summary,
        "results": unique_results
    }

@app.get("/api/analytics")
def get_analytics():
    return {
        "total_cases": len(get_all_cases()),
        "total_suspects": 0,
        "total_evidence": 0,
        "total_videos": 0,
        "cases_by_city": get_cases_by_city(),
        "cases_by_crime": get_cases_by_crime_type(),
        "cases_by_status": get_cases_by_status(),
        "cases_by_priority": get_cases_by_priority(),
        "monthly_trends": get_monthly_trends(),
    }

@app.get("/api/suspects/{suspect_id}")
def get_suspect(suspect_id: str):
    from models.person import get_persons_collection
    person = get_persons_collection().find_one({"_id": suspect_id})
    if not person:
        person = get_persons_collection().find_one({"personId": suspect_id})
    if not person:
        raise HTTPException(status_code=404, detail="Suspect not found")
    case = get_case_by_id(person.get("caseId", "")) if person.get("caseId") else None
    return {
        "id": str(person.get("_id")),
        "name": person.get("name"),
        "aliases": person.get("aliases"),
        "risk_score": person.get("riskScore", 0.0),
        "case_number": case.get("caseNumber") if case else None,
        "case_title": case.get("title") if case else None,
        "location": case.get("city") if case else None,
        "crime_type": case.get("crimeType") if case else None,
    }

@app.get("/api/notifications")
def get_notifications():
    return get_all_notifications()

@app.post("/api/notifications/read")
def mark_notifications_read(notification_ids: List[str]):
    for nid in notification_ids:
        mark_notification_read(nid)
    return {"status": "success"}

@app.post("/api/notifications/read_all")
def mark_all_notifications_read():
    count = mark_all_notifications_read()
    return {"status": "success", "modified": count}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    file_path = await doc_proc.save_upload_file(file)
    text = doc_proc.extract_text_from_file(file_path)
    if not text:
        return {
            "filename": file.filename,
            "message": "File uploaded successfully. Text extraction for this format is pending integration.",
            "extracted": False
        }
    try:
        if api_key:
            model = genai.GenerativeModel('gemini-flash-latest')
            prompt = (
                "Extract the following entities from the crime document text and return ONLY a JSON object with these keys:\n"
                "caseNumber, firNumber, persons, suspects, victims, locations, dates, crimeType, vehicles, organizations, evidenceReferences\n"
                "If a field is not found, use null or empty list. Do not invent information.\n\n"
                f"Text:\n{text}"
            )
            response = model.generate_content(prompt)
            match = re.search(r'\{.*\}', response.text, re.DOTALL)
            entities = json.loads(match.group(0)) if match else {}
            return {
                "filename": file.filename,
                "message": "Document processed successfully.",
                "extracted": True,
                "entities": entities
            }
        else:
            return {
                "filename": file.filename,
                "message": "File uploaded. AI extraction unavailable (no API key configured).",
                "extracted": False
            }
    except Exception as e:
        return {
            "filename": file.filename,
            "message": f"Error during extraction: {str(e)}",
            "extracted": False
        }
