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
        # Regex search across city, district, or state
        filter_query["$or"] = [
            {"location.city": {"$regex": location, "$options": "i"}},
            {"location.district": {"$regex": location, "$options": "i"}},
            {"location.state": {"$regex": location, "$options": "i"}}
        ]
        
    crime_type = entities.get("crime_type")
    if crime_type:
        filter_query["crime_type"] = {"$regex": crime_type, "$options": "i"}
        
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

def process_nl_query(query: str) -> Dict[str, Any]:
    intent, entities = classify_intent(query)
    
    # Import engines here to avoid circular imports
    from graph_engine import build_network_graph
    from pattern_engine import detect_hotspots, find_repeat_offenders
    
    if intent == "NETWORK_SEARCH":
        person_name = entities.get("person_name")
        if not person_name:
            # Fallback if AI couldn't extract name
            return {"status": "error", "message": "Could not identify the person for network analysis."}
        return build_network_graph(person_name)
        
    elif intent == "HOTSPOT_ANALYSIS":
        return detect_hotspots(entities.get("crime_type"), entities.get("location"))
        
    elif intent == "REPEAT_OFFENDERS":
        return find_repeat_offenders(entities.get("location"))
        
    else:
        # Default to DATA_RETRIEVAL
        return process_data_retrieval(entities)
