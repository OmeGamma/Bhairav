from typing import List, Dict, Any

class NotificationService:
    """
    Interface for sending push notifications, emails, and SMS.
    """
    def __init__(self):
        pass

    async def send_email(self, to_addresses: List[str], subject: str, body_html: str):
        """
        Sends an email (e.g., using SendGrid, AWS SES, or SMTP).
        """
        # Mock implementation
        print(f"Sending email to {to_addresses}: {subject}")
        return True

    async def send_sms(self, phone_numbers: List[str], message: str):
        """
        Sends an SMS (e.g., using Twilio, AWS SNS).
        """
        # Mock implementation
        print(f"Sending SMS to {phone_numbers}")
        return True

    async def push_to_app(self, user_ids: List[str], title: str, body: str, data: Dict[str, Any] = None):
        """
        Sends a push notification to mobile/web clients (e.g., using Firebase Cloud Messaging).
        """
        # Mock implementation
        print(f"Pushing notification to users {user_ids}: {title}")
        return True

notification_service = NotificationService()
