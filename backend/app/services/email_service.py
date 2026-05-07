"""Email сервис через Resend API."""
import logging
from typing import Optional
from app.services.resend_service import resend_service

logger = logging.getLogger(__name__)

class EmailService:
    """Сервис для отправки email через Resend API."""
    
    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Отправить email."""
        return await resend_service.send_email(to_email, subject, html_content, text_content)
    
    async def send_verification_code(self, to_email: str, code: str) -> bool:
        """Отправить 6-значный код подтверждения email."""
        return await resend_service.send_verification_code(to_email, code)
    
    async def send_password_reset(self, to_email: str, reset_link: str) -> bool:
        """Отправить письмо для сброса пароля."""
        return await resend_service.send_password_reset(to_email, reset_link)


# Singleton
email_service = EmailService()
