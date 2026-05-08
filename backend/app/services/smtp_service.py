import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class SmtpService:
    """Сервис для отправки email через SMTP."""
    
    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or self.user
        self.from_name = settings.SMTP_FROM_NAME
        
        self.enabled = bool(self.host and self.user and self.password)
        if not self.enabled:
            logger.warning("SMTP не настроен. Проверьте SMTP_HOST, SMTP_USER, SMTP_PASSWORD в .env")

    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: Optional[str] = None,
    ) -> bool:
        """Отправить email через SMTP."""
        if not self.enabled:
            logger.error("Попытка отправки через SMTP, когда он не настроен")
            return False
        
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>" if self.from_name else self.from_email
            msg["To"] = to
            
            if text:
                msg.attach(MIMEText(text, "plain"))
            msg.attach(MIMEText(html, "html"))
            
            # В будущем можно сделать асинхронным через aiosmtplib
            # Сейчас используем блокирующий smtplib для простоты, так как это обычно быстро
            import asyncio
            from concurrent.futures import ThreadPoolExecutor
            
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, self._send_sync, msg, to)
            
            logger.info(f"Email успешно отправлен через SMTP на {to}")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка отправки email через SMTP: {e}")
            return False

    def _send_sync(self, msg, to):
        with smtplib.SMTP(self.host, self.port, timeout=10) as server:
            if self.port == 587:
                server.starttls()
            server.login(self.user, self.password)
            server.send_message(msg)

smtp_service = SmtpService()
