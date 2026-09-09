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

def start_cleanup_scheduler():
    global _scheduler
    if _scheduler is None:
        _scheduler = BackgroundScheduler()
        # Run cleanup every day at 02:00 AM server time
        _scheduler.add_job(run_cleanup, trigger=CronTrigger(hour=2, minute=0), id='media_cleanup', replace_existing=True)
        _scheduler.start()
        logger.info("Media cleanup scheduler started.")

def stop_cleanup_scheduler():
    global _scheduler
    if _scheduler:
        _scheduler.shutdown()
        _scheduler = None
