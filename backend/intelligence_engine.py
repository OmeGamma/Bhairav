import json
import re
import google.generativeai as genai
from typing import Dict, Any, Tuple
import os

from config.database import db

def classify_intent(query: str) -> Tuple[str, Dict[str, Any]]:
    """
    Uses Gemini to classify the natural language query into an intent and extract entities.
    Intents: NETWORK_SEARCH, HOTSPOT_ANALYSIS, REPEAT_OFFENDERS, DATA_RETRIEVAL
    """
    prompt = f"""
    You are an AI intelligence router for a police database.
    Analyze the following user query: "{query}"

    Determine the INTENT from these options:
    - NETWORK_SEARCH: The user wants to analyze a network, graph, or connections (e.g. "co-accused network for Rajesh")
    - HOTSPOT_ANALYSIS: The user wants to see geographical hotspots (e.g. "burglary hotspots", "where is crime happening")
    - REPEAT_OFFENDERS: The user wants a list of repeat offenders (e.g. "list repeat offenders")
    - DATA_RETRIEVAL: The user wants to filter and list cases (e.g. "show fraud cases in Mumbai")

    Also extract any relevant entities (location, crime_type, person_name).

    Return ONLY a strict JSON object with this exact structure:
    {{
      "intent": "INTENT_NAME",
      "entities": {{
        "location": "extracted location or null",
        "crime_type": "extracted crime type or null",
        "person_name": "extracted person name or null"
      }}
    }}
    """
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        if text.startswith("```"):
            text = text[3:-3]
            
        data = json.loads(text.strip())
        return data.get("intent", "DATA_RETRIEVAL"), data.get("entities", {})
    except Exception as e:
        print(f"Error classifying intent: {e}")
        return "DATA_RETRIEVAL", {}

def build_mongo_filter(entities: Dict[str, Any]) -> Dict[str, Any]:
    filter_query = {}
    
    location = entities.get("location")
    if location:
        filter_query["$or"] = [
            {"location.city": {"$regex": location, "$options": "i"}},
            {"location.district": {"$regex": location, "$options": "i"}},
            {"location.state": {"$regex": location, "$options": "i"}}
        ]
        
    crime_type = entities.get("crime_type")
    if crime_type:
        filter_query["crimeType"] = {"$regex": crime_type, "$options": "i"}
        
    return filter_query

def process_data_retrieval(entities: Dict[str, Any]) -> Dict[str, Any]:
    filter_query = build_mongo_filter(entities)
    
    try:
        cases_cursor = db.cases.find(filter_query).limit(50)
        cases = []
        for c in cases_cursor:
            c["_id"] = str(c["_id"])
            cases.append(c)
            
        return {
            "status": "success",
            "type": "DATA_RETRIEVAL",
            "data": cases,
            "message": f"Found {len(cases)} matching cases."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def search_case_metadata(case_ids: list, collection_name: str, fields: list) -> list:
    results = []
    for case_id in case_ids:
        case = db.cases.find_one({"caseNumber": case_id})
        if not case:
            continue
        items = case.get(collection_name, [])
        for item in items:
            if isinstance(item, dict):
                results.append({
                    "caseId": case_id,
                    "caseTitle": case.get("title", ""),
                    "item": item,
                })
    return results

def process_nl_query(query: str) -> Dict[str, Any]:
    intent, entities = classify_intent(query)
    
    if intent == "NETWORK_SEARCH":
        person_name = entities.get("person_name")
        if not person_name:
            return {"status": "error", "message": "Could not identify the person for network analysis."}
        from graph_engine import build_network_graph
        return build_network_graph(person_name)
        
    elif intent == "HOTSPOT_ANALYSIS":
        from pattern_engine import detect_hotspots
        return detect_hotspots(entities.get("crime_type"), entities.get("location"))
        
    elif intent == "REPEAT_OFFENDERS":
        from pattern_engine import find_repeat_offenders
        return find_repeat_offenders(entities.get("location"))
        
    else:
        cases = []
        filter_query = build_mongo_filter(entities)
        if filter_query:
            cases_cursor = db.cases.find(filter_query).limit(50)
            for c in cases_cursor:
                c["_id"] = str(c["_id"])
                cases.append(c)
        
        if not cases:
            tokens = [t.lower() for t in query.split() if t.strip()]
            stopwords = {"case", "cases", "the", "in", "at", "of", "and", "or", "for", "to", "a", "an", "is", "are", "was", "were", "on", "from", "by", "with", "without", "into", "new", "old", "show", "find", "search", "look", "get", "all", "any", "some", "no", "not", "yes", "please", "help", "me", "my", "we", "you", "your", "like", "as", "it", "its", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should", "can", "could", "may", "might", "must", "here", "there", "where", "when", "why", "how", "what", "who", "whom", "which", "this", "that", "these", "those"}
            tokens = [t for t in tokens if t not in stopwords and len(t) > 2]
            
            if tokens:
                or_clauses = []
                for token in tokens:
                    or_clauses.append({"caseNumber": {"$regex": token, "$options": "i"}})
                    or_clauses.append({"city": {"$regex": token, "$options": "i"}})
                    or_clauses.append({"district": {"$regex": token, "$options": "i"}})
                    or_clauses.append({"state": {"$regex": token, "$options": "i"}})
                    or_clauses.append({"crimeType": {"$regex": token, "$options": "i"}})
                    or_clauses.append({"title": {"$regex": token, "$options": "i"}})
                
                matched_case_numbers = set()
                for c in db.cases.find({"$or": or_clauses}).limit(100):
                    c["_id"] = str(c["_id"])
                    matched_case_numbers.add(c["caseNumber"])
                    if c["caseNumber"] not in [x["caseNumber"] for x in cases]:
                        cases.append(c)
                
                if not matched_case_numbers:
                    return {
                        "status": "success",
                        "type": "DATA_RETRIEVAL",
                        "data": [],
                        "message": "No matching Bhairav records were found for your query."
                    }
        
        case_ids = [c["caseNumber"] for c in cases]
        
        documents = search_case_metadata(case_ids, "documents", ["documentId", "fileName", "title"])
        evidence = search_case_metadata(case_ids, "evidences", ["evidenceId", "title", "description"])
        videos = search_case_metadata(case_ids, "videos", ["videoId", "fileName", "title"])
        
        return {
            "status": "success",
            "type": "DATA_RETRIEVAL",
            "data": cases,
            "documents": documents,
            "evidence": evidence,
            "videos": videos,
            "message": f"Found {len(cases)} cases, {len(documents)} documents, {len(evidence)} evidence items, {len(videos)} videos."
        }
