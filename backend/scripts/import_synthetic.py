import os
import sys
import json
import uuid
import base64
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import db
from services.cloudinary_service import upload_image

# Attempt to load Gemini
try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY is not set.")
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Error initializing Gemini: {e}")
        return None

def import_identities():
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    
    # Target image
    target_img = os.path.join(upload_dir, "b7fdd861-fe1a-4b49-98f2-7a74871e7593.png")
    if not os.path.exists(target_img):
        print(f"Image not found at {target_img}")
        return

    print("Uploading image to Cloudinary...")
    with open(target_img, "rb") as f:
        img_bytes = f.read()
    
    upload_res = upload_image(img_bytes, folder="bhairav/synthetic_identities")
    if not upload_res:
        print("Failed to upload to Cloudinary.")
        return
        
    photo_url = upload_res.get("secure_url")
    print(f"Uploaded successfully: {photo_url}")

    client = get_gemini_client()
    extracted_data = {
        "name": "Arjun Mehta",
        "dob": "1990-05-15",
        "gender": "Male",
        "maskedIdentityNumber": "XXXX XXXX 9157",
        "address": "45 Park Street, Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
    }
    
    if client:
        print("Running Gemini OCR...")
        try:
            prompt = """
            Extract identity information from this demo identity card.
            Return a JSON object with EXACTLY these keys:
            - name (string)
            - dob (string YYYY-MM-DD)
            - gender (string)
            - idNumber (string, full number if found)
            - address (string)
            - city (string)
            - state (string)
            If a field is missing, return "NOT DETECTED".
            Only return the JSON.
            """
            
            response = client.models.generate_content(
                model='gemini-2.5-pro',
                contents=[
                    prompt,
                    types.Part.from_bytes(data=img_bytes, mime_type='image/png'),
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            data = json.loads(response.text)
            print("OCR Result:", data)
            
            # Use extracted data, mask ID
            raw_id = data.get("idNumber", "NOT DETECTED")
            masked_id = raw_id
            if raw_id != "NOT DETECTED" and len(raw_id) > 4:
                masked_id = "XXXX XXXX " + raw_id[-4:]
                
            extracted_data = {
                "name": data.get("name", "Unknown"),
                "dob": data.get("dob", "Unknown"),
                "gender": data.get("gender", "Unknown"),
                "maskedIdentityNumber": masked_id,
                "address": data.get("address", "Unknown"),
                "city": data.get("city", "Unknown"),
                "state": data.get("state", "Unknown")
            }
        except Exception as e:
            print(f"Gemini OCR failed: {e}. Falling back to default values.")
    
    # Build synthetic identity record
    identity_id = str(uuid.uuid4())
    demo_id = f"DEMO-ID-{str(uuid.uuid4()).split('-')[0].upper()}"
    case_id = "CASE-DEL-001"
    
    # If the user specifically said BRH-DEMO-001, we will map it there.
    # Actually I will map to BRH-DEMO-001 as specified by the user requirement!
    case_id = "BRH-DEMO-001"
    
    record = {
        "identityId": identity_id,
        "demoIdentityId": demo_id,
        "name": extracted_data["name"],
        "dob": extracted_data["dob"],
        "gender": extracted_data["gender"],
        "maskedIdentityNumber": extracted_data["maskedIdentityNumber"],
        "address": extracted_data["address"],
        "city": extracted_data["city"],
        "state": extracted_data["state"],
        "photoUrl": photo_url,
        "documentUrl": photo_url,
        "caseId": case_id,
        "caseStatus": "CASE-ASSOCIATED",
        "referenceImages": [photo_url],
        "linkedSimIds": ["SIM-001", "SIM-002", "SIM-003"],
        "linkedBankAccountIds": ["BANK-001", "BANK-002"],
        "linkedVideoEvents": [],
        "locationEvents": [],
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
        "dataClassification": "DEMO_SYNTHETIC"
    }
    
    # Ensure case exists
    case = db.cases.find_one({"caseNumber": case_id})
    if not case:
        print(f"Creating missing case: {case_id}")
        db.cases.insert_one({
            "caseNumber": case_id,
            "title": "Central Delhi Commercial Burglary (Demo)",
            "description": "Synthetic demonstration case.",
            "status": "active",
            "priority": "high",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat(),
        })
        
    # Insert Identity
    db.synthetic_identities.insert_one(record)
    print(f"Successfully created Synthetic Identity: {demo_id} mapped to Case {case_id}")
    
    # Optional: We could also create the nodes for the CriminalNetwork if they aren't there, 
    # but the network API might dynamically build them.

if __name__ == "__main__":
    # Ensure we create collection if it doesn't exist
    if "synthetic_identities" not in db.list_collection_names():
        db.create_collection("synthetic_identities")
        
    import_identities()
