from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import os
import json
import re
import math
import io
import google.generativeai as genai
from typing import List, Optional, Dict, Any
from datetime import datetime

from config.database import check_connection, get_collection
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
    soft_delete_case,
    get_deleted_cases,
)
from export import generate_case_docx
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
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT

check_connection()

UPLOAD_DIR = "uploads"
for subdir in ["documents", "evidence", "videos", "reports"]:
    os.makedirs(os.path.join(UPLOAD_DIR, subdir), exist_ok=True)

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

def snake_to_camel(data: Dict[str, Any]) -> Dict[str, Any]:
    import re
    camel = {}
    for key, value in data.items():
        camel_key = re.sub(r'_([a-z])', lambda m: m.group(1).upper(), key)
        camel[camel_key] = value
    return camel

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
    from models.case import normalize_case
    normalized = normalize_case(new_case)
    
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
    return normalized

@app.get("/api/cases/deleted")
def get_deleted_cases_api():
    return get_deleted_cases()

@app.get("/api/cases/{case_id}")
def get_case(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@app.get("/api/cases/{case_id}/export/doc")
def export_case_doc(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    file_stream = generate_case_docx(case)
    
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={
            "Content-Disposition": f"attachment; filename=Case_{case.get('caseNumber', case_id)}.docx"
        }
    )

@app.put("/api/cases/{case_id}")
def update_case_api(case_id: str, case_in: schemas.CaseUpdate):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    update_data = snake_to_camel(case_in.dict(exclude_unset=True))
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

@app.delete("/api/cases/{case_id}")
def delete_case_api(case_id: str):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    deleted = soft_delete_case(case_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Case not found")
    
    create_audit_log({
        "action": "CASE_DELETED",
        "entityType": "Case",
        "entityId": case_id,
        "description": f"Case {case_id} was soft-deleted.",
        "userId": "Officer",
    })
    create_notification({
        "type": "CASE_DELETED",
        "title": "Case Deleted",
        "message": f"Case {case_id} was moved to deleted items.",
        "caseId": case_id,
        "userId": "Officer",
    })
    return {"message": "Case deleted successfully", "case": deleted}

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
        "style": {"background": "#EFF6FF", "border": "2px solid #3B82F6", "borderRadius": "8px", "padding": "10px"}
    })

    entities = []
    for s in case.get("suspects", []):
        if isinstance(s, dict):
            entities.append(("suspect", s.get("_id", s.get("name")), s.get("name"), "#FEE2E2", "#EF4444", "Suspect"))
        elif isinstance(s, str):
            entities.append(("suspect", s, s, "#FEE2E2", "#EF4444", "Suspect"))
    for p in case.get("persons", []):
        if isinstance(p, dict):
            entities.append(("person", p.get("_id", p.get("name")), p.get("name"), "#F3F4F6", "#6B7280", "Person"))
        elif isinstance(p, str):
            entities.append(("person", p, p, "#F3F4F6", "#6B7280", "Person"))
    for v in case.get("victims", []):
        if isinstance(v, dict):
            entities.append(("victim", v.get("_id", v.get("name")), v.get("name"), "#FEF3C7", "#D97706", "Victim"))
        elif isinstance(v, str):
            entities.append(("victim", v, v, "#FEF3C7", "#D97706", "Victim"))
    for ev in case.get("evidences", []):
        if isinstance(ev, dict):
            label = ev.get("title") or ev.get("evidence_number") or ev.get("evidenceId") or "Evidence"
            eid = ev.get("_id", ev.get("evidenceId", ev.get("evidence_number", label)))
            entities.append(("evidence", eid, label, "#D1FAE5", "#10B981", "Evidence"))
    for d in case.get("documents", []):
        if isinstance(d, dict):
            label = d.get("title") or d.get("document_number") or d.get("documentId") or "Document"
            eid = d.get("_id", d.get("documentId", d.get("document_number", label)))
            entities.append(("document", eid, label, "#E0E7FF", "#4F46E5", "Document"))
    for vid in case.get("videos", []):
        if isinstance(vid, dict):
            label = vid.get("title") or vid.get("video_number") or vid.get("videoId") or "Video"
            eid = vid.get("_id", vid.get("videoId", vid.get("video_number", label)))
            entities.append(("video", eid, label, "#FCE7F3", "#EC4899", "Video"))
    for veh in case.get("vehicles", []):
        if isinstance(veh, dict):
            label = veh.get("make_model") or veh.get("plate_number") or veh.get("vehicleId") or "Vehicle"
            eid = veh.get("_id", veh.get("vehicleId", label))
            entities.append(("vehicle", eid, label, "#E0F2FE", "#0284C7", "Vehicle"))
    for org in case.get("organizations", []):
        if isinstance(org, dict):
            label = org.get("name") or org.get("organizationId") or "Organization"
            eid = org.get("_id", org.get("organizationId", label))
            entities.append(("org", eid, label, "#EDE9FE", "#8B5CF6", "Organization"))
    for fir in case.get("firs", []):
        if isinstance(fir, dict):
            label = fir.get("firNumber") or fir.get("fir_number") or "FIR"
            eid = fir.get("_id", label)
            entities.append(("fir", eid, label, "#FFEDD5", "#EA580C", "FIR"))
    if case.get("location"):
        loc = case["location"]
        if isinstance(loc, dict):
            label = loc.get("city") or loc.get("district") or loc.get("state") or "Location"
            entities.append(("loc", case_id, label, "#ECFCCB", "#65A30D", "Location"))

    for idx, (etype, eid, elabel, bg, bd, ltype) in enumerate(entities):
        n_id = f"{etype}_{eid}"
        nodes.append({
            "id": n_id,
            "data": {"label": str(elabel), "type": ltype},
            "type": "customNode",
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
    from config.database import get_collection
    return {
        "total_cases": len(get_all_cases()),
        "total_suspects": get_collection("persons").count_documents({}),
        "total_evidence": get_collection("evidence").count_documents({}),
        "total_videos": get_collection("videos").count_documents({}),
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
        for case in get_all_cases():
            for p in case.get("suspects", []):
                if isinstance(p, dict):
                    if str(p.get("_id", "")) == suspect_id or p.get("name") == suspect_id:
                        person = p
                        person["caseId"] = case.get("caseNumber")
                        break
            if person:
                break
    if not person:
        raise HTTPException(status_code=404, detail="Suspect not found")
    case = get_case_by_id(person.get("caseId", "")) if person.get("caseId") else None
    return {
        "id": str(person.get("_id", suspect_id)),
        "name": person.get("name"),
        "aliases": person.get("aliases"),
        "risk_score": person.get("risk_score", 0.0),
        "case_number": case.get("caseNumber") if case else None,
        "case_title": case.get("title") if case else None,
        "location": case.get("city") if case else None,
        "crime_type": case.get("crimeType") if case else None,
    }

@app.get("/api/health")
def health_check():
    from config.database import check_connection
    db_ok = check_connection()
    return {
        "backend": "OK",
        "database": "connected" if db_ok else "disconnected",
        "version": "2.0.0"
    }

@app.get("/api/documents")
def list_documents(case_id: str = Query(...)):
    docs = get_documents_by_case(case_id)
    if not docs:
        case = get_case_by_id(case_id)
        if case and case.get("documents"):
            docs = case["documents"]
    return docs

@app.get("/api/evidence")
def list_evidence(case_id: str = Query(...)):
    items = get_evidence_by_case(case_id)
    if not items:
        case = get_case_by_id(case_id)
        if case and case.get("evidences"):
            items = case["evidences"]
    return items

@app.get("/api/videos")
def list_videos(case_id: str = Query(...)):
    items = get_videos_by_case(case_id)
    if not items:
        case = get_case_by_id(case_id)
        if case and case.get("videos"):
            items = case["videos"]
    return items

@app.get("/api/files/{file_id}")
def serve_file(file_id: str, download: bool = False):
    from config.database import get_collection
    import glob
    doc_collection = get_collection("documents")
    evi_collection = get_collection("evidence")
    vid_collection = get_collection("videos")
    
    record = None
    for coll in [doc_collection, evi_collection, vid_collection]:
        record = coll.find_one({"_id": file_id})
        if record:
            break
        record = coll.find_one({"documentId": file_id}) or coll.find_one({"evidenceId": file_id}) or coll.find_one({"videoId": file_id})
        if record:
            break
    
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    storage_path = record.get("storagePath", "")
    if not storage_path or not os.path.exists(storage_path):
        raise HTTPException(status_code=404, detail="File unavailable")
    
    mime_type = record.get("mimeType", "application/octet-stream")
    file_name = record.get("fileName", os.path.basename(storage_path))
    
    def iterfile():
        with open(storage_path, "rb") as f:
            while chunk := f.read(8192):
                yield chunk
    
    disposition = "attachment" if download else "inline"
    return StreamingResponse(iterfile(), media_type=mime_type, headers={"Content-Disposition": f"{disposition}; filename=\"{file_name}\""})

@app.get("/api/reports/generate")
@app.post("/api/reports/generate")
def generate_report(case_id: str = Query(...)):
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    persons = get_persons_by_case(case_id)
    evidences = get_evidence_by_case(case_id)
    documents = get_documents_by_case(case_id)
    videos = get_videos_by_case(case_id)
    vehicles = get_vehicles_by_case(case_id)
    organizations = get_organizations_by_case(case_id)
    firs = get_firs_by_case(case_id)
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=20*mm, leftMargin=20*mm,
                            topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        leading=28,
        alignment=TA_CENTER,
        spaceAfter=6,
        textColor=colors.HexColor('#0F172A'),
    )
    subtitle_style = ParagraphStyle(
        'SubtitleStyle',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        alignment=TA_CENTER,
        spaceAfter=12,
        textColor=colors.HexColor('#475569'),
    )
    section_style = ParagraphStyle(
        'SectionStyle',
        parent=styles['Heading3'],
        fontSize=12,
        leading=16,
        spaceAfter=6,
        textColor=colors.HexColor('#1E293B'),
        backColor=colors.HexColor('#F8FAFC'),
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['BodyText'],
        fontSize=10,
        leading=14,
        spaceAfter=6,
    )
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=8,
        leading=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#94A3B8'),
    )
    
    story = []
    story.append(Paragraph("BHAIRAV", title_style))
    story.append(Paragraph("Case Intelligence Report", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(f"Generated At: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}", body_style))
    story.append(Paragraph(f"Report ID: RPT-{int(datetime.utcnow().timestamp())}", body_style))
    story.append(Paragraph(f"Case ID: {case_id}", body_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Case Information", section_style))
    case_data = [
        ["Case Number", case.get("caseNumber", "")],
        ["FIR Number", case.get("firNumber", "") or (firs[0].get("firNumber", "") if firs else "")],
        ["Title", case.get("title", "")],
        ["Crime Type", case.get("crimeType", "")],
        ["Status", case.get("status", "")],
        ["Priority", case.get("priority", "")],
        ["Date", case.get("filingDate", "") or case.get("date", "")],
        ["Location", case.get("location", {}).get("city", "") if isinstance(case.get("location"), dict) else (case.get("city", "") or case.get("place", ""))],
        ["Address", case.get("location", {}).get("address", "") if isinstance(case.get("location"), dict) else (case.get("address", ""))],
        ["District", case.get("location", {}).get("district", "") if isinstance(case.get("location"), dict) else (case.get("district", ""))],
        ["State", case.get("location", {}).get("state", "") if isinstance(case.get("location"), dict) else (case.get("state", ""))],
        ["Country", case.get("country", "India")],
        ["Police Station", case.get("policeStation", "")],
        ["Investigating Officer", case.get("investigatingOfficer", "") or case.get("officer", "Unassigned")],
    ]
    case_table = Table(case_data, colWidths=[80*mm, 100*mm])
    case_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(case_table)
    story.append(Spacer(1, 12))
    
    if case.get("description") or case.get("incidentDetails"):
        story.append(Paragraph("Case Description", section_style))
        if case.get("description"):
            story.append(Paragraph(f"<b>Description:</b> {case['description']}", body_style))
        if case.get("incidentDetails"):
            story.append(Paragraph(f"<b>Incident Details:</b> {case['incidentDetails']}", body_style))
        if case.get("notes"):
            story.append(Paragraph(f"<b>Notes:</b> {case['notes']}", body_style))
        story.append(Spacer(1, 12))
    
    if persons or evidences or documents or videos or vehicles or organizations:
        story.append(Paragraph("Persons & Entities", section_style))
        if persons:
            story.append(Paragraph("<b>Suspects / Persons / Victims:</b>", body_style))
            for p in persons:
                role = p.get("role", "Person")
                story.append(Paragraph(f"• {p.get('name', 'Unknown')} - {role}", body_style))
        if organizations:
            story.append(Paragraph("<b>Organizations:</b>", body_style))
            for o in organizations:
                story.append(Paragraph(f"• {o.get('name', 'Unknown')} - {o.get('type', '')}", body_style))
        if vehicles:
            story.append(Paragraph("<b>Vehicles:</b>", body_style))
            for v in vehicles:
                story.append(Paragraph(f"• {v.get('plate_number', v.get('vehicleId', 'Unknown'))} - {v.get('make_model', '')}", body_style))
        story.append(Spacer(1, 12))
    
    if evidences or documents or videos:
        story.append(Paragraph("Evidence & Records", section_style))
        if evidences:
            story.append(Paragraph("<b>Evidence Items:</b>", body_style))
            for e in evidences:
                story.append(Paragraph(f"• {e.get('evidenceId', e.get('title', 'Unknown'))} - {e.get('description', '')}", body_style))
        if documents:
            story.append(Paragraph("<b>Documents:</b>", body_style))
            for d in documents:
                story.append(Paragraph(f"• {d.get('documentId', d.get('fileName', 'Unknown'))}", body_style))
        if videos:
            story.append(Paragraph("<b>Videos:</b>", body_style))
            for v in videos:
                story.append(Paragraph(f"• {v.get('videoId', v.get('fileName', 'Unknown'))}", body_style))
        story.append(Spacer(1, 12))
    
    if firs:
        story.append(Paragraph("FIR Information", section_style))
        for fir in firs:
            story.append(Paragraph(f"FIR Number: {fir.get('firNumber', '')} | Police Station: {fir.get('policeStation', '')}", body_style))
        story.append(Spacer(1, 12))
    
    if case.get("location") and isinstance(case.get("location"), dict) and (case.get("location", {}).get("latitude") or case.get("location", {}).get("longitude")):
        story.append(Paragraph("Geospatial Information", section_style))
        loc = case.get("location", {})
        story.append(Paragraph(f"Latitude: {loc.get('latitude', 'N/A')} | Longitude: {loc.get('longitude', 'N/A')}", body_style))
        story.append(Spacer(1, 12))
    
    story.append(Paragraph("Footer", section_style))
    story.append(Paragraph("Bhairav — Made with Love in India : By OmeGamma", footer_style))
    
    try:
        doc.build(story)
        buffer.seek(0)
        report_id = f"RPT-{int(datetime.utcnow().timestamp())}"
        report_doc = create_report({
            "reportId": report_id,
            "caseId": case_id,
            "reportType": "INTELLIGENCE",
            "title": f"Case Intelligence Report - {case_id}",
            "fileName": f"{report_id}.pdf",
            "storagePath": "",
            "generatedBy": "Officer",
        })
        
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=\"Bhairav_Report_{case_id}_{int(datetime.utcnow().timestamp())}.pdf\""}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unable to generate report: {str(e)}")

@app.get("/api/reports")
def list_reports(case_id: str = Query(...)):
    reports = get_reports_by_case(case_id)
    return reports

@app.post("/api/intelligence/query")
def intelligence_query(req: schemas.AnalyzeRequest):
    raw_query = req.query.strip()
    if not raw_query:
        return {"summary": "Please enter a query to search the Bhairav database.", "type": "DATA_RETRIEVAL", "data": [], "documents": [], "evidence": [], "videos": [], "message": "Please enter a query to search the Bhairav database."}
    
    result = process_nl_query(raw_query)
    
    if result.get("status") == "error":
        return {"summary": result.get("message", "Error processing query."), "type": "DATA_RETRIEVAL", "data": [], "documents": [], "evidence": [], "videos": [], "message": result.get("message", "Error processing query.")}
    
    qtype = result.get("type", "DATA_RETRIEVAL")
    data = result.get("data", [])
    message = result.get("message", "")
    
    return {
        "summary": message,
        "type": qtype,
        "data": data,
        "documents": result.get("documents", []),
        "evidence": result.get("evidence", []),
        "videos": result.get("videos", []),
        "message": message,
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


@app.get("/api/hotspots")
def get_hotspots():
    cases = get_all_cases()
    points = []
    for c in cases:
        loc = c.get("location") or {}
        lat = loc.get("latitude") or c.get("latitude")
        lng = loc.get("longitude") or c.get("longitude")
        if lat and lng:
            try:
                points.append({
                    "lat": float(lat), 
                    "lng": float(lng), 
                    "case_number": c.get("caseNumber")
                })
            except:
                pass
                
    # Simple DBSCAN-style clustering (O(N^2) naive)
    clusters = []
    visited = set()
    
    def distance(p1, p2):
        return math.sqrt((p1["lat"] - p2["lat"])**2 + (p1["lng"] - p2["lng"])**2)
        
    eps = 0.5 # rough degree distance
    min_pts = 1
    
    for i, p in enumerate(points):
        if i in visited: continue
        visited.add(i)
        
        # find neighbors
        neighbors = [j for j, op in enumerate(points) if distance(p, op) <= eps]
        
        if len(neighbors) >= min_pts:
            cluster = []
            for n_idx in neighbors:
                visited.add(n_idx)
                cluster.append(points[n_idx])
            
            # calculate centroid
            c_lat = sum(x["lat"] for x in cluster) / len(cluster)
            c_lng = sum(x["lng"] for x in cluster) / len(cluster)
            
            clusters.append({
                "lat": c_lat,
                "lng": c_lng,
                "count": len(cluster),
                "cases": [x["case_number"] for x in cluster],
                "severity": "HIGH" if len(cluster) > 5 else "MEDIUM" if len(cluster) > 2 else "LOW"
            })
            
    # Also fetch manual hotspots if available
    try:
        from config.database import get_collection
        manual = get_collection("hotspots").find({})
        from models.case import serialize_doc
        for m in manual:
            doc = serialize_doc(m)
            clusters.append({
                "id": doc.get("_id"),
                "lat": doc.get("latitude"),
                "lng": doc.get("longitude"),
                "count": 0,
                "name": doc.get("name"),
                "severity": doc.get("severity", "MEDIUM"),
                "is_manual": True
            })
    except:
        pass
        
    return clusters
