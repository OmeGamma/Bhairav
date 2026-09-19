from typing import Dict, Any, List
from datetime import datetime
from models.synthetic import (
    get_synthetic_identity_by_id,
    get_synthetic_sims_by_aadhaar,
    get_synthetic_banks_by_aadhaar,
    get_synthetic_tower_events_by_identity
)

def get_ai_intelligence_summary(identity_id: str, case_id: str = None) -> Dict[str, Any]:
    """
    Builds the cross-domain correlation engine summary as requested by:
    AI CROSS-DOMAIN CORRELATION ENGINE
    """
    identity = get_synthetic_identity_by_id(identity_id)
    if not identity:
        return {"error": "Identity not found"}

    aadhaar = identity.get("syntheticAadhaarId", "")
    
    sims = get_synthetic_sims_by_aadhaar(aadhaar)
    banks = get_synthetic_banks_by_aadhaar(aadhaar)
    tower_events = get_synthetic_tower_events_by_identity(identity_id)
    
    # Mock video candidate matches - in a real app this would query video_reports
    video_matches_count = 1
    
    # Analyze SIM records for actions
    sim_suspension_recommendations = [s for s in sims if s.get("status") == "ACTIVE"]
    
    # Analyze Bank records for actions
    bank_hold_recommendations = [b for b in banks if b.get("status") == "ACTIVE"]
    
    # Determine pending review actions
    pending_actions = 0
    if sim_suspension_recommendations: pending_actions += 1
    if bank_hold_recommendations: pending_actions += 1
    if video_matches_count > 0: pending_actions += 1
    
    # Location correlations
    location_correlations = len(tower_events)

    return {
        "case": case_id or identity.get("caseIds", [""])[0] if identity.get("caseIds") else "Unknown",
        "identity": aadhaar,
        "relatedSyntheticSims": len(sims),
        "relatedSyntheticBankRecords": len(banks),
        "videoCandidateMatches": video_matches_count,
        "locationCorrelations": location_correlations,
        "evidence": 7, # Mocked as requested
        "pendingReviewActions": pending_actions,
        "simRecords": sims,
        "bankRecords": banks,
        "towerEvents": tower_events,
        "aiExplanation": generate_ai_explanation(identity, sims, banks, tower_events, video_matches_count)
    }

def generate_ai_explanation(identity: Dict, sims: List, banks: List, towers: List, video_matches: int) -> List[str]:
    reasons = []
    if identity.get("caseIds"):
        reasons.append(f"Synthetic identity linked to active case ({identity['caseIds'][0]}).")
    if len(sims) > 0:
        reasons.append(f"{len(sims)} synthetic telecom records are linked.")
    if len(banks) > 0:
        reasons.append(f"{len(banks)} synthetic financial records are linked.")
    if video_matches > 0:
        reasons.append("Video contains a candidate visual match.")
    if len(towers) > 0:
        reasons.append("A synthetic tower event is temporally close to the video event.")
        
    return reasons

def generate_video_location_correlation(identity_id: str, video_timestamp: str, video_location: str = "Area B") -> Dict[str, Any]:
    """
    24. VIDEO + LOCATION CORRELATION
    """
    tower_events = get_synthetic_tower_events_by_identity(identity_id)
    if not tower_events:
        return {"error": "No synthetic tower events found for this identity."}
        
    # Simply pick the last one as the "nearest" for the demo
    nearest_event = tower_events[-1]
    
    return {
        "videoEventTime": video_timestamp,
        "nearestSyntheticTowerEventTime": nearest_event.get("timestamp"),
        "distance": "120 meters (Synthetic calculation)",
        "result": "POSSIBLE LOCATION CORRELATION",
        "confidence": "82%",
        "reason": [
            "Temporal proximity",
            "Spatial proximity",
            "Identity candidate match"
        ]
    }
