from typing import Dict, Any, Optional
from config.database import db

def detect_hotspots(crime_type: Optional[str] = None, location: Optional[str] = None) -> Dict[str, Any]:
    """
    Identifies geographic hotspots for a given crime type or location.
    """
    try:
        match_stage = {}
        if crime_type:
            match_stage["crimeType"] = {"$regex": crime_type, "$options": "i"}
        if location:
            match_stage["$or"] = [
                {"location.city": {"$regex": location, "$options": "i"}},
                {"location.district": {"$regex": location, "$options": "i"}},
                {"city": {"$regex": location, "$options": "i"}}
            ]
            
        pipeline = []
        if match_stage:
            pipeline.append({"$match": match_stage})
            
        pipeline.append({
            "$group": {
                "_id": {
                    "city": "$location.city",
                    "district": "$location.district",
                    "lat": "$location.latitude",
                    "lng": "$location.longitude"
                },
                "case_count": {"$sum": 1},
                "cases": {"$push": "$caseNumber"}
            }
        })
        
        # Sort by highest count
        pipeline.append({"$sort": {"case_count": -1}})
        pipeline.append({"$limit": 10})
        
        results = list(db.cases.aggregate(pipeline))
        
        hotspots = []
        for r in results:
            _id = r.get("_id", {})
            if not _id.get("lat") or not _id.get("lng"):
                continue
            hotspots.append({
                "location": _id.get("city") or _id.get("district") or "Unknown Area",
                "latitude": _id.get("lat"),
                "longitude": _id.get("lng"),
                "intensity": r["case_count"],
                "cases": r["cases"]
            })
            
        return {
            "status": "success",
            "type": "HOTSPOT_ANALYSIS",
            "data": hotspots,
            "message": f"Found {len(hotspots)} hotspots."
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def find_repeat_offenders(location: Optional[str] = None) -> Dict[str, Any]:
    """
    Finds individuals who appear as suspects/accused in multiple cases.
    """
    try:
        match_stage = {}
        if location:
            match_stage["$or"] = [
                {"location.city": {"$regex": location, "$options": "i"}},
                {"location.district": {"$regex": location, "$options": "i"}},
                {"city": {"$regex": location, "$options": "i"}}
            ]
            
        # Unwind suspects to count their occurrences
        # Since schema stores suspects variably, we project them into a unified array first
        
        pipeline = []
        if match_stage:
            pipeline.append({"$match": match_stage})
            
        # This is a bit complex in MongoDB due to heterogeneous arrays, so we can do it in Python
        cases_cursor = db.cases.find(match_stage)
        offender_counts = {}
        offender_cases = {}
        
        for case in cases_cursor:
            all_people = []
            if isinstance(case.get("suspects"), list):
                all_people.extend(case["suspects"])
            if isinstance(case.get("persons"), list):
                all_people.extend(case["persons"])
            if isinstance(case.get("accused"), str):
                all_people.append(case["accused"])
            if isinstance(case.get("suspect"), str):
                all_people.append(case["suspect"])
                
            for person in set(all_people):
                if isinstance(person, dict) and "name" in person:
                    name = person["name"]
                elif isinstance(person, str):
                    name = person
                else:
                    continue
                    
                name = name.strip().title()
                if not name: continue
                
                offender_counts[name] = offender_counts.get(name, 0) + 1
                if name not in offender_cases:
                    offender_cases[name] = []
                offender_cases[name].append(case["caseNumber"])
                
        # Filter for repeats (>1)
        repeats = []
        for name, count in offender_counts.items():
            if count > 1:
                repeats.append({
                    "name": name,
                    "case_count": count,
                    "cases": offender_cases[name]
                })
                
        # Sort descending
        repeats = sorted(repeats, key=lambda x: x["case_count"], reverse=True)
        
        return {
            "status": "success",
            "type": "REPEAT_OFFENDERS",
            "data": repeats[:20], # Top 20
            "message": f"Identified {len(repeats)} repeat offenders."
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
