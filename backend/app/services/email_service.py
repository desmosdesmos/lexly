import logging
from typing import Optional
from app.services.resend_service import resend_service
from app.services.smtp_service import smtp_service

logger = logging.getLogger(__name__)

class EmailService:
    """Сервис для отправки email с поддержкой Resend и SMTP."""
    
    async def get_active_service(self):
        """Возвращает активный сервис (SMTP приоритетнее, так как он надежнее настроен)."""
        if smtp_service.enabled:
            return smtp_service
        if resend_service.enabled:
            return resend_service
        return None

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        """Отправить email через любой доступный сервис."""
        service = await self.get_active_service()
        if not service:
            logger.error("Нет доступных email-сервисов (Resend или SMTP)")
            return False
        
        service_name = "SMTP" if service == smtp_service else "Resend"
        logger.info(f"Попытка отправки email через {service_name} на {to_email}...")
        
        result = await service.send_email(to_email, subject, html_content, text_content)
        if result:
            logger.info(f"Email успешно отправлен через {service_name} на {to_email}")
        else:
            logger.error(f"Ошибка отправки email через {service_name} на {to_email}")
        return result
    
    async def send_verification_code(self, to_email: str, code: str) -> bool:
        """Отправить 6-значный код подтверждения email."""
        service = await self.get_active_service()
        if not service:
            logger.error("Нет доступных email-сервисов (Resend или SMTP)")
            return False
        
        service_name = "SMTP" if service == smtp_service else "Resend"
        logger.info(f"Отправка кода подтверждения {code} через {service_name} на {to_email}...")
        
        # Если сервис поддерживает нативный метод (Resend)
        if hasattr(service, 'send_verification_code') and service == resend_service:
            result = await service.send_verification_code(to_email, code)
        else:
            # Для SMTP используем шаблон
            subject = "Код подтверждения — Laxly"
            html = f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                <h1 style="font-size: 24px; font-weight: 700; text-align: center;">🔐 Подтверждение email</h1>
                <div style="background: #f9f9f9; border-radius: 20px; padding: 32px; text-align: center; margin-top: 24px;">
                    <p style="color: #666;">Ваш код подтверждения:</p>
                    <div style="font-size: 48px; font-weight: 700; letter-spacing: 8px; color: #0A84FF; margin: 24px 0;">{code}</div>
                    <p style="font-size: 13px; color: #999;">Код действителен в течение 10 минут</p>
                </div>
            </div>
            """
            text = f"Ваш код подтверждения Laxly: {code}"
            result = await service.send_email(to_email, subject, html, text)
            
        if result:
            logger.info(f"Код подтверждения успешно отправлен через {service_name} на {to_email}")
        else:
            logger.error(f"Ошибка отправки кода через {service_name} на {to_email}")
        return result
    
    async def send_password_reset(self, to_email: str, reset_link: str) -> bool:
        """Отправить письмо для сброса пароля."""
        service = await self.get_active_service()
        if not service:
            logger.error("Нет доступных email-сервисов (Resend или SMTP)")
            return False
            
        if hasattr(service, 'send_password_reset'):
            return await service.send_password_reset(to_email, reset_link)
            
        # Для SMTP используем шаблон
        subject = "Сброс пароля — Laxly"
        html = f"""
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; text-align: center;">
            <h1 style="font-size: 24px; font-weight: 700;">🔐 Сброс пароля</h1>
            <p style="color: #666; margin: 24px 0;">Нажмите кнопку ниже, чтобы сбросить пароль:</p>
            <a href="{reset_link}" style="display: inline-block; padding: 14px 32px; background: #0A84FF; color: white; text-decoration: none; border-radius: 14px; font-weight: 600;">Сбросить пароль</a>
            <p style="font-size: 13px; color: #999; margin-top: 24px;">Ссылка действительна 1 час</p>
        </div>
        """
        text = f"Сброс пароля: {reset_link}"
        return await service.send_email(to_email, subject, html, text)


# Singleton
email_service = EmailService()
