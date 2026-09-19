import os
import sys
from datetime import datetime

# Set environment variable before importing deletion_service so its module-level constant is True
os.environ["ENABLE_PERMANENT_DELETE"] = "true"

# Add the parent directory to sys.path so we can import from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.database import db
from services.deletion_service import permanent_delete_video_report

# We MUST delete <= 2026-09-17 23:59:59
BOUNDARY_DATE = "2026-09-17T23:59:59"

def cleanup_old_videos():
    print(f"Starting Video Cleanup... Target: <= {BOUNDARY_DATE}")
    
    all_reports = list(db.video_reports.find({}))
    
    to_delete = []
    retained = 0
    for r in all_reports:
        created_at = r.get("createdAt")
        is_old = False
        
        if isinstance(created_at, datetime):
            if created_at.isoformat() <= BOUNDARY_DATE:
                is_old = True
        elif isinstance(created_at, str):
            if created_at <= BOUNDARY_DATE:
                is_old = True
                
        if is_old:
            to_delete.append(r)
        else:
            retained += 1

    print(f"Records found: {len(all_reports)}")
    print(f"Records selected to delete: {len(to_delete)}")
    print(f"Records retained (newer): {retained}")
    
    deleted_count = 0
    failed_count = 0
    
    for r in to_delete:
        report_id = r.get("reportId") or str(r.get("_id"))
        try:
            # We temporarily bypass auth checks by forcing ENABLE_PERMANENT_DELETE if needed, or by passing the demo role.
            os.environ["ENABLE_PERMANENT_DELETE"] = "true"
            res = permanent_delete_video_report(report_id, user_role="Officer")
            if res.get("success"):
                deleted_count += 1
            else:
                print(f"Failed to delete {report_id}: {res.get('error')}")
                failed_count += 1
        except Exception as e:
            print(f"Exception deleting {report_id}: {e}")
            failed_count += 1
            
    print("\n--- CLEANUP SUMMARY ---")
    print(f"Successfully deleted: {deleted_count}")
    print(f"Failed to delete: {failed_count}")

if __name__ == "__main__":
    cleanup_old_videos()
