import os
import logging
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from models.media_file import get_expired_active_media_files, update_media_file_status
from services.cloudinary_service import delete_resource

logger = logging.getLogger(__name__)

_scheduler = None

def run_cleanup():
    logger.info("Running media cleanup job...")
    now = datetime.utcnow()
    expired_files = get_expired_active_media_files(now)
    
    deleted_count = 0
    failed_count = 0
    
    for file in expired_files:
        public_id = file.get("cloudinaryPublicId")
        resource_type = file.get("resourceType", "image")
        file_id = file.get("fileId")
        
        if public_id:
            # Delete from Cloudinary
            success = delete_resource(public_id, resource_type=resource_type)
            if success:
                update_media_file_status(file_id, "DELETED")
                deleted_count += 1
            else:
                logger.warning(f"Failed to delete Cloudinary asset: {public_id}")
                update_media_file_status(file_id, "EXPIRED")
                failed_count += 1
        else:
            # No Cloudinary asset, just mark deleted
            update_media_file_status(file_id, "DELETED")
            deleted_count += 1
            
    logger.info(f"Cleanup finished. Deleted: {deleted_count}, Failed: {failed_count}")
    return {"deleted": deleted_count, "failed": failed_count}

def run_case_retention_cleanup():
    logger.info("Running case retention cleanup job (7-day policy)...")
    from config.database import db
    from services.deletion_service import permanent_delete_case
    from datetime import datetime, timedelta
    
    threshold_date = datetime.utcnow() - timedelta(days=7)
    
    # Find soft-deleted cases older than 7 days
    expired_cases = list(db.cases.find({
        "deletedAt": {"$lt": threshold_date.isoformat()}
    }))
    
    deleted_count = 0
    demo_role = os.getenv("DEMO_AUTH_ROLE", "Officer")
    for case in expired_cases:
        case_number = case.get("caseNumber")
        if case_number:
            try:
                res = permanent_delete_case(case_number, user_role=demo_role)
                if res.get("success"):
                    deleted_count += 1
                else:
                    logger.error(f"Failed to permanent delete case {case_number}: {res.get('error')}")
            except Exception as e:
                logger.error(f"Error purging case {case_number}: {e}")
                
    logger.info(f"Case retention cleanup finished. Purged: {deleted_count}")
    return {"purged": deleted_count}

def start_cleanup_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
        # Run cleanup every day at 02:00 AM server time
        _scheduler.add_job(run_cleanup, trigger=CronTrigger(hour=2, minute=0), id='media_cleanup', replace_existing=True)
        _scheduler.add_job(run_case_retention_cleanup, trigger=CronTrigger(hour=3, minute=0), id='case_retention_cleanup', replace_existing=True)
        _scheduler.start()
        logger.info("Media & Case retention cleanup scheduler started.")

def stop_cleanup_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        _scheduler = None
