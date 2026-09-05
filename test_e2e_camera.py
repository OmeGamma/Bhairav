import asyncio
import httpx
import uuid
import time
import os

API_URL = "http://localhost:5000/api/v1"

async def test_camera_flow():
    async with httpx.AsyncClient() as client:
        # Create a new camera
        cam_payload = {
            "name": "Test Real Camera",
            "source_type": "SIMULATED", # Use simulated for test to avoid needing an MP4 right now
            "stream_reference": "demo",
            "status": "ACTIVE",
            "enabled": True,
            "configuration": {
                "fps": 5,
                "resolution": "640x480"
            }
        }
        
        print("Creating camera...")
        resp = await client.post(f"{API_URL}/cameras/", json=cam_payload)
        if resp.status_code != 200:
            print("Failed to create camera:", resp.text)
            return
            
        camera = resp.json()
        cam_id = camera["id"]
        print(f"Created Camera ID: {cam_id}")
        
        # Start session
        print("Starting session...")
        resp = await client.post(f"{API_URL}/cameras/{cam_id}/sessions")
        if resp.status_code != 200:
            print("Failed to start session:", resp.text)
            return
            
        session = resp.json()
        session_id = session["id"]
        print(f"Started Session ID: {session_id}")
        
        # Wait for some frames to process
        print("Waiting 10 seconds for frames to process...")
        await asyncio.sleep(10)
        
        # Stop session
        print("Stopping session...")
        resp = await client.post(f"{API_URL}/cameras/{cam_id}/stop")
        print("Stop session response:", resp.status_code)
        
        # Check if events were created
        print("Checking events...")
        resp = await client.get(f"{API_URL}/events/?limit=10")
        events = resp.json()
        
        found_events = [e for e in events if e.get("camera_id") == cam_id]
        print(f"Found {len(found_events)} events for this camera session.")
        for e in found_events:
            print(f" - {e['event_type']} ({e['severity']}) Frame: {e.get('frame_number')}")

if __name__ == "__main__":
    asyncio.run(test_camera_flow())
