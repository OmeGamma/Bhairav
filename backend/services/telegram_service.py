import os
import requests
from typing import Union, Optional

def _is_enabled() -> bool:
    return os.getenv("TELEGRAM_ENABLED", "false").lower() in ("true", "1", "yes")

def get_telegram_status() -> str:
    if not _is_enabled():
        return "DISABLED"
    
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if token and chat_id:
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
        return res.status_code == 200
    except Exception as e:
        print(f"Telegram error: {e}")
        return False

def send_telegram_photo(photo_url_or_bytes: Union[str, bytes], caption: str = "") -> bool:
    if not _is_enabled():
        return False
        
    token = os.getenv("TELEGRAM_BOT_TOKEN")
    chat_id = os.getenv("TELEGRAM_CHAT_ID")
    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    
    try:
        if isinstance(photo_url_or_bytes, str):
            # Using URL
            payload = {
                "chat_id": chat_id,
                "photo": photo_url_or_bytes,
                "caption": caption,
                "parse_mode": "HTML"
            }
            res = requests.post(url, json=payload, timeout=10)
        else:
            # Using bytes
            data = {
                "chat_id": chat_id,
                "caption": caption,
                "parse_mode": "HTML"
            }
            files = {
                "photo": ("evidence.jpg", photo_url_or_bytes, "image/jpeg")
            }
            res = requests.post(url, data=data, files=files, timeout=10)
            
        return res.status_code == 200
    except Exception as e:
        print(f"Telegram photo error: {e}")
        return False

def test_connection() -> bool:
    return send_telegram_message("🟢 <b>BHAIRAV TELEGRAM TEST</b>\n\nTelegram notification system is working.")
