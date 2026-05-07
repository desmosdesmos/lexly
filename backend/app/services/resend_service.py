"""Email сервис через Resend API."""
import httpx
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)

class ResendService:
    """Сервис для отправки email через Resend API."""
    
    API_URL = "https://api.resend.com/emails"
    FROM_EMAIL = "Laxly <onboarding@resend.dev>"  # Resend предоставляет этот email для тестирования
    
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.enabled = bool(self.api_key)
        if not self.enabled:
            logger.warning("RESEND_API_KEY не настроен. Email не будут отправляться.")
    
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: Optional[str] = None,
    ) -> bool:
        """Отправить email через Resend API."""
        if not self.enabled:
            return False
        
        payload = {
            "from": self.FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        }
        
        if text:
            payload["text"] = text
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    self.API_URL,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                
                if response.status_code == 200:
                    logger.info(f"Email отправлен через Resend: {to}")
                    return True
                else:
                    logger.error(f"Resend API error {response.status_code}: {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Ошибка отправки email через Resend: {e}")
            return False
    
    async def send_verification_code(self, to_email: str, code: str) -> bool:
        """Отправить 6-значный код подтверждения email."""
        subject = "Код подтверждения — Laxly"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F2F2F7; color: #1C1C1E;">
            <div style="max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0;">🔐 Подтверждение email</h1>
                </div>
                <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center;">
                    <p style="font-size: 15px; color: rgba(0,0,0,0.6); margin: 0 0 24px;">Ваш код подтверждения:</p>
                    <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #0A84FF; font-family: monospace; margin-bottom: 24px;">{code}</div>
                    <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin: 0;">Код действителен в течение 10 минут</p>
                </div>
                <div style="margin-top: 24px; padding: 16px; background: rgba(255,149,0,0.1); border-radius: 14px; border: 1px solid rgba(255,149,0,0.2);">
                    <p style="font-size: 13px; color: #FF9500; margin: 0;">
                        ⚠️ Если вы не регистрировались в Laxly, просто проигнорируйте это письмо.
                    </p>
                </div>
                <div style="margin-top: 24px; text-align: center;">
                    <p style="font-size: 12px; color: rgba(0,0,0,0.3); margin: 0;">© 2026 Laxly — AI-юридическая платформа</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Код подтверждения Laxly: {code}
        
        Код действителен в течение 10 минут.
        
        Если вы не регистрировались в Laxly, проигнорируйте это письмо.
        
        © 2026 Laxly — AI-юридическая платформа
        """
        
        return await self.send_email(to_email, subject, html_content, text_content)
    
    async def send_password_reset(self, to_email: str, reset_link: str) -> bool:
        """Отправить письмо для сброса пароля."""
        subject = "Сброс пароля — Laxly"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, sans-serif; background: #F2F2F7; color: #1C1C1E;">
            <div style="max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                <div style="background: white; border-radius: 20px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); text-align: center;">
                    <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 24px;">🔐 Сброс пароля</h1>
                    <p style="font-size: 15px; color: rgba(0,0,0,0.6); margin: 0 0 24px;">Нажмите кнопку ниже, чтобы сбросить пароль:</p>
                    <a href="{reset_link}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #0A84FF, #5E5CE6); color: white; text-decoration: none; border-radius: 14px; font-weight: 600; font-size: 16px;">Сбросить пароль</a>
                    <p style="font-size: 13px; color: rgba(0,0,0,0.4); margin: 24px 0 0;">Ссылка действительна 1 час</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(to_email, subject, html_content, f"Сброс пароля: {reset_link}")


# Singleton
resend_service = ResendService()
