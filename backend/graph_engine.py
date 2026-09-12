from typing import Dict, Any, List
from config.database import db

def build_network_graph(suspect_name: str) -> Dict[str, Any]:
    """
    Builds a 2-hop co-accused network graph starting from the given suspect name.
    """
    try:
        # Step 1: Find cases where this person is a suspect or person
        # We search case insensitively across suspects array and persons array
        search_regex = {"$regex": suspect_name, "$options": "i"}
        
        # In this schema, suspect names might be stored as strings in 'suspects' array, or 'persons' array, or 'suspect' field.
        cases_cursor = db.cases.find({
            "deletedAt": {"$exists": False},
            "$or": [
                {"suspects": search_regex},
                {"persons": search_regex},
                {"suspect": search_regex},
                {"accused": search_regex}
            ]
        })
        
        cases = list(cases_cursor)
        
        if not cases:
            return {
                "status": "success",
                "type": "NETWORK_SEARCH",
                "data": {
                    "graph": {
                        "nodes": [],
                        "links": [],
                        "seed_node": None
                    }
                },
                "message": f"No cases found involving {suspect_name}."
            }

        # Step 2: Build the graph
        nodes = {}
        links = []
        
        # Seed node
        seed_id = f"person-{suspect_name.lower().replace(' ', '-')}"
        nodes[seed_id] = {
            "id": seed_id,
            "label": suspect_name.title(),
            "type": "person",
            "is_seed": True
        }
        
        # To prevent infinite loops or massive graphs, limit processing
        MAX_HOPS = 2
        
        for case in cases:
            case_id = f"case-{case['caseNumber']}"
            if case_id not in nodes:
                nodes[case_id] = {
                    "id": case_id,
                    "label": f"Case {case['caseNumber']}",
                    "type": "case",
                    "details": f"{case.get('crimeType', 'Unknown')} - {case.get('city', 'Unknown')}"
                }
            
            # Link seed to case
            links.append({"source": seed_id, "target": case_id, "type": "involved_in"})
            
            # Find co-accused in this case
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
                    person_str = person["name"]
                elif isinstance(person, str):
                    person_str = person
                else:
                    continue
                    
                if suspect_name.lower() in person_str.lower():
                    continue # Skip the seed node
                    
                co_accused_id = f"person-{person_str.lower().replace(' ', '-')}"
                if co_accused_id not in nodes:
                    nodes[co_accused_id] = {
                        "id": co_accused_id,
                        "label": person_str.title(),
                        "type": "person",
                        "is_seed": False
                    }
                
                # Link co-accused to case
                links.append({"source": co_accused_id, "target": case_id, "type": "involved_in"})
        
        # Deduplicate links
        unique_links = []
        seen_links = set()
        for link in links:
            link_signature = f"{link['source']}-{link['target']}"
            if link_signature not in seen_links:
                seen_links.add(link_signature)
                unique_links.append(link)

        return {
            "status": "success",
            "type": "NETWORK_SEARCH",
            "data": {
                "graph": {
                    "nodes": list(nodes.values()),
                    "links": unique_links,
                    "seed_node": seed_id
                }
            },
            "message": f"Found network connections for {suspect_name.title()}."
        }
        
    except Exception as e:
        return {"status": "error", "message": str(e)}
