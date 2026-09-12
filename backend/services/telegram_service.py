import os
import logging
import requests
from typing import Union, Optional

logger = logging.getLogger(__name__)

def _is_enabled() -> bool:
    enabled = os.getenv("TELEGRAM_ENABLED", "false").lower() in ("true", "1", "yes")
    logger.info(f"[Telegram] Enabled: {enabled}")
    return enabled

def get_telegram_status() -> str:
    if not _is_enabled():
        return "DISABLED"
    
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    token_ok = bool(token)
    chat_ok = bool(chat_id)
    logger.info(f"[Telegram] Bot token configured: {token_ok}")
    logger.info(f"[Telegram] Chat ID configured: {chat_ok}")
    if token_ok and chat_ok:
        return "CONFIGURED"
    return "DISABLED"

def send_telegram_message(message: str) -> bool:
    if not _is_enabled():
        return False
    
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return False
         
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML"
    }
    try:
        res = requests.post(url, json=payload, timeout=5)
        logger.info(f"[Telegram] sendMessage status: {res.status_code}")
        if res.status_code != 200:
            logger.error(f"[Telegram] sendMessage failed: {res.text}")
        return res.status_code == 200
    except Exception as e:
        logger.error(f"[Telegram] sendMessage error: {e}")
        return False

def send_telegram_photo(photo_url_or_bytes: Union[str, bytes], caption: str = "") -> bool:
    if not _is_enabled():
        return False
        
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    photo_label = photo_url_or_bytes if isinstance(photo_url_or_bytes, str) else "<image bytes>"
    logger.info(f"[Telegram] sendPhoto started, photo source: {photo_label}")
    
    try:
        if isinstance(photo_url_or_bytes, str):
            payload = {
                "chat_id": chat_id,
                "photo": photo_url_or_bytes,
                "caption": caption,
                "parse_mode": "HTML"
            }
            res = requests.post(url, json=payload, timeout=10)
        else:
            data = {
                "chat_id": chat_id,
                "caption": caption,
                "parse_mode": "HTML"
            }
            files = {
                "photo": ("evidence.jpg", photo_url_or_bytes, "image/jpeg")
            }
            res = requests.post(url, data=data, files=files, timeout=10)
            
        logger.info(f"[Telegram] sendPhoto response status: {res.status_code}")
        if res.status_code != 200:
            logger.error(f"[Telegram] sendPhoto failed: {res.text}")
        return res.status_code == 200
    except Exception as e:
        logger.error(f"[Telegram] sendPhoto error: {e}")
        return False

def test_connection() -> bool:
    return send_telegram_message("🟢 <b>BHAIRAV TELEGRAM TEST</b>\n\nTelegram notification system is working.")
