from config.database import check_connection
from models.case import create_case
from models.person import create_person
from models.evidence import create_evidence
from models.document import create_document
from models.video import create_video
from models.vehicle import create_vehicle
from models.organization import create_organization
from models.fir import create_fir

def seed_db():
    check_connection()
    print("Seeding MongoDB with synthetic demo data...")

    def get_or_create_case(case_number, title, crime_type, location, priority, officer, status, description, **kwargs):
        from models.case import get_case_by_id
        existing = get_case_by_id(case_number)
        if existing:
            return existing
        data = {
            "caseNumber": case_number,
            "title": title,
            "crimeType": crime_type,
            "status": status.upper(),
            "priority": priority.upper(),
            "officer": officer,
            "description": description,
            "location": location,
            "createdBy": "Officer",
            "updatedBy": "Officer",
            "dataClassification": "DEMO_SYNTHETIC",
        }
        data.update(kwargs)
        return create_case(data)

    case1 = get_or_create_case(
        "CASE-DEL-001", "Central Delhi Commercial Burglary", "Burglary",
        {"city": "Delhi", "state": "Delhi", "district": "Central", "address": "Connaught Place", "latitude": 28.6315, "longitude": 77.2167},
        "High", "Rajiv Menon", "Open", "Burglary at a commercial establishment in Central Delhi.",
        suspects=[{"name": "Arjun Mehta", "aliases": "A.M.", "role": "Suspect", "risk_score": 82.0}],
        persons=[{"name": "Vikram Sethi", "role": "Witness"}],
        victims=[{"name": "Metro Electronics Pvt Ltd"}],
        vehicles=[{"plate_number": "DL-8C-1234", "make_model": "White Van"}],
        evidences=[{"evidence_number": "EVIDENCE-DEL-001", "title": "CCTV Footage", "description": "Entry/exit footage from adjacent lane"}],
        documents=[{"document_number": "DOC-DEL-001", "title": "FIR Copy", "fileName": "fir_del_001.pdf"}],
        firs=[{"fir_number": "FIR-2025-DEL-001", "policeStation": "Connaught Place PS"}],
        tags=["burglary", "commercial", "central-delhi"],
    )

    case2 = get_or_create_case(
        "CASE-LKO-002", "Lucknow Vehicle Theft Investigation", "Vehicle Theft",
        {"city": "Lucknow", "state": "Uttar Pradesh", "district": "Lucknow", "address": "Hazratganj", "latitude": 26.8467, "longitude": 80.9462},
        "Medium", "Neha Singh", "Under Investigation", "Series of high-end vehicle thefts in Lucknow commercial district.",
        suspects=[{"name": "Aman Verma", "aliases": "A.V.", "role": "Suspect", "risk_score": 68.0}],
        persons=[{"name": "Rohan Kapoor", "role": "Informant"}],
        victims=[{"name": "Rahul Enterprises"}],
        organizations=[{"name": "Ganga Syndicate", "type": "Theft Ring"}],
        evidences=[{"evidence_number": "EVIDENCE-LKO-002", "title": "Cloned Key Fob", "description": "Recovered cloning device"}],
        firs=[{"fir_number": "FIR-2025-LKO-002", "policeStation": "Hazratganj PS"}],
        tags=["vehicle-theft", "lucknow", "commercial"],
    )

    case3 = get_or_create_case(
        "CASE-CHD-003", "Chandigarh Electronics Theft", "Theft",
        {"city": "Chandigarh", "state": "Chandigarh", "district": "Chandigarh", "address": "Sector 17", "latitude": 30.7333, "longitude": 76.7794},
        "Low", "Karan Joshi", "Closed", "Theft of electronics from retail outlet in Sector 17.",
        suspects=[{"name": "Sameer Rao", "aliases": "S.R.", "role": "Suspect", "risk_score": 45.0}],
        persons=[{"name": "Aditya Sharma", "role": "Accused"}],
        victims=[{"name": "Tech Mart India"}],
        evidences=[{"evidence_number": "EVIDENCE-CHD-003", "title": "Recovered Items", "description": "Laptops and mobile phones recovered"}],
        documents=[{"document_number": "DOC-CHD-003", "title": "Charge Sheet", "fileName": "chargesheet_chd_003.pdf"}],
        firs=[{"fir_number": "FIR-2024-CHD-003", "policeStation": "Sector 17 PS"}],
        tags=["theft", "electronics", "chandigarh"],
    )

    case4 = get_or_create_case(
        "CASE-GGN-004", "Gurugram Financial Fraud Investigation", "Fraud",
        {"city": "Gurugram", "state": "Haryana", "district": "Gurugram", "address": "Cyber Hub", "latitude": 28.4595, "longitude": 77.0266},
        "Medium", "Priya Nair", "Open", "Large-scale phishing and online fraud operation targeting corporates.",
        suspects=[{"name": "Imran Khan", "aliases": "I.K.", "role": "Suspect", "risk_score": 75.0}],
        persons=[{"name": "Deepa Kulkarni", "role": "Co-accused"}],
        victims=[{"name": "Global FinTech Solutions"}],
        evidences=[{"evidence_number": "EVIDENCE-GGN-004", "title": "Server Logs", "description": "Phishing server logs and kits"}],
        documents=[{"document_number": "DOC-GGN-004", "title": "Forensic Report", "fileName": "forensic_ggn_004.pdf"}],
        firs=[{"fir_number": "FIR-2025-GGN-004", "policeStation": "Cyber Crime PS"}],
        tags=["fraud", "phishing", "gurugram"],
    )

    case5 = get_or_create_case(
        "CASE-CHE-005", "Chennai Night Robbery Investigation", "Robbery",
        {"city": "Chennai", "state": "Tamil Nadu", "district": "Chennai", "address": "T Nagar", "latitude": 13.0418, "longitude": 80.2341},
        "High", "Lakshmi Iyer", "Open", "Armed robbery at jewelry store during night hours.",
        suspects=[{"name": "Neeraj Malhotra", "aliases": "N.M.", "role": "Suspect", "risk_score": 88.0}],
        persons=[{"name": "Arunachalam P", "role": "Witness"}],
        victims=[{"name": "Sri Krishna Jewelers"}],
        vehicles=[{"plate_number": "TN-22-7890", "make_model": "Black Motorcycle"}],
        evidences=[{"evidence_number": "EVIDENCE-CHE-005", "title": "Weapon Recovered", "description": "Replica firearm recovered near scene"}],
        videos=[{"video_number": "VIDEO-CHE-005", "title": "Store CCTV", "fileName": "cstore_cam_che_005.mp4"}],
        firs=[{"fir_number": "FIR-2025-CHE-005", "policeStation": "T Nagar PS"}],
        tags=["robbery", "jewelry", "chennai"],
    )

    case6 = get_or_create_case(
        "CASE-BLR-006", "Bengaluru Organized Theft Investigation", "Organized Theft",
        {"city": "Bengaluru", "state": "Karnataka", "district": "Bangalore Urban", "address": "Koramangala", "latitude": 12.9352, "longitude": 77.6245},
        "Medium", "Karthik Rao", "Under Investigation", "Coordinated theft of IT equipment from multiple offices.",
        suspects=[{"name": "Rahul Sen", "aliases": "R.S.", "role": "Suspect", "risk_score": 60.0}],
        persons=[{"name": "Sania Fatima", "role": "Informant"}],
        organizations=[{"name": "Silicon Street Gangs", "type": "Theft Network"}],
        evidences=[{"evidence_number": "EVIDENCE-BLR-006", "title": "Stolen Laptops", "description": "12 laptops recovered from warehouse"}],
        documents=[{"document_number": "DOC-BLR-006", "title": "Search Report", "fileName": "search_blr_006.pdf"}],
        firs=[{"fir_number": "FIR-2025-BLR-006", "policeStation": "Koramangala PS"}],
        tags=["organized-theft", "it-equipment", "bengaluru"],
    )

    case7 = get_or_create_case(
        "CASE-PUN-007", "Pune Homicide Investigation", "Murder",
        {"city": "Pune", "state": "Maharashtra", "district": "Pune", "address": "Kothrud", "latitude": 18.5042, "longitude": 73.8259},
        "High", "Anand Kumar", "Open", "Homicide investigation following discovery in residential area.",
        suspects=[{"name": "Karan Joshi", "aliases": "K.J.", "role": "Person of Interest", "risk_score": 72.0}],
        persons=[{"name": "Mamta Banerjee", "role": "Witness"}],
        victims=[{"name": "Deceased Individual A"}],
        evidences=[{"evidence_number": "EVIDENCE-PUN-007", "title": "Forensic Evidence", "description": "Scene forensics and trace evidence"}],
        videos=[{"video_number": "VIDEO-PUN-007", "title": "Neighborhood Surveillance", "fileName": "neighborhood_pun_007.mp4"}],
        firs=[{"fir_number": "FIR-2025-PUN-007", "policeStation": "Kothrud PS"}],
        tags=["homicide", "pune", "residential"],
    )

    case8 = get_or_create_case(
        "CASE-MUM-008", "Mumbai Public Safety Incident", "Public-place explosion incident",
        {"city": "Mumbai", "state": "Maharashtra", "district": "Mumbai Suburban", "address": "Andheri", "latitude": 19.1136, "longitude": 72.8697},
        "High", "Sanjay Patel", "Open", "Public safety incident in a busy market area. Investigation is ongoing.",
        suspects=[{"name": "Vikram Sethi", "aliases": "V.S.", "role": "Suspect", "risk_score": 90.0}],
        persons=[{"name": "Sunil Dutt", "role": "Witness"}],
        victims=[{"name": "Public safety incident victims"}],
        evidences=[{"evidence_number": "EVIDENCE-MUM-008", "title": "Scene Debris", "description": "Material collected from incident site"}],
        documents=[{"document_number": "DOC-MUM-008", "title": "Investigation Notes", "fileName": "investigation_mum_008.pdf"}],
        videos=[{"video_number": "VIDEO-MUM-008", "title": "Market CCTV", "fileName": "market_cctv_mum_008.mp4"}],
        firs=[{"fir_number": "FIR-2025-MUM-008", "policeStation": "Andheri PS"}],
        tags=["public-safety", "mumbai", "market-area"],
    )

    case9 = get_or_create_case(
        "CASE-PAT-009", "Patna Public Order Investigation", "Mob violence incident",
        {"city": "Patna", "state": "Bihar", "district": "Patna", "address": "Frazer Road", "latitude": 25.6105, "longitude": 85.1365},
        "High", "Rohit Malhotra", "Under Investigation", "Public order incident requiring coordinated investigation.",
        suspects=[{"name": "Raju Ghosh", "aliases": "R.G.", "role": "Suspect", "risk_score": 78.0}],
        persons=[{"name": "Geeta Devi", "role": "Witness"}],
        victims=[{"name": "Local Residents"}],
        organizations=[{"name": "Local Group A", "type": "Informal Group"}],
        evidences=[{"evidence_number": "EVIDENCE-PAT-009", "title": "Scene Photos", "description": "Photographic evidence from incident site"}],
        firs=[{"fir_number": "FIR-2025-PAT-009", "policeStation": "Frazer Road PS"}],
        tags=["public-order", "patna", "mob-incident"],
    )

    case10 = get_or_create_case(
        "CASE-HYD-010", "Hyderabad Security Intelligence Investigation", "Suspected extremist/terror-related activity",
        {"city": "Hyderabad", "state": "Telangana", "district": "Hyderabad", "address": "Banjara Hills", "latitude": 17.4156, "longitude": 78.4478},
        "High", "Priya Nair", "Closed", "Security intelligence investigation now closed.",
        suspects=[{"name": "Dinesh Kumar", "aliases": "D.K.", "role": "Person of Interest", "risk_score": 55.0}],
        persons=[{"name": "Arunachalam P", "role": "Informant"}],
        evidences=[{"evidence_number": "EVIDENCE-HYD-010", "title": "Digital Evidence", "description": "Digital records secured during investigation"}],
        documents=[{"document_number": "DOC-HYD-010", "title": "Closure Report", "fileName": "closure_hyd_010.pdf"}],
        firs=[{"fir_number": "FIR-2024-HYD-010", "policeStation": "Banjara Hills PS"}],
        tags=["security-intelligence", "hyderabad", "closed-case"],
    )

    print("Database seeding completed.")

if __name__ == "__main__":
    seed_db()
