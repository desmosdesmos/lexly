"""Telegram сервис для отправки уведомлений админу."""
import logging
from typing import Optional
import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class TelegramNotifier:
    """Отправляет уведомления админу через Telegram бота."""

    def __init__(self):
        """Инициализация Telegram бота."""
        self.bot_token = settings.TELEGRAM_BOT_TOKEN
        self.admin_chat_id = settings.TELEGRAM_ADMIN_CHAT_ID
        self.base_url = f"https://api.telegram.org/bot{self.bot_token}"
        self.enabled = bool(self.bot_token)
        self._connection_failed = False  # Флаг что соединение не работает

    async def _get_chat_id(self) -> Optional[str]:
        """Получить chat_id админа через updates, если ещё не установлен."""
        if self.admin_chat_id:
            return self.admin_chat_id
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(f"{self.base_url}/getUpdates")
                if response.status_code == 200:
                    data = response.json()
                    if data.get("ok") and data.get("result"):
                        # Берём последний update
                        last_update = data["result"][-1]
                        message = last_update.get("message") or last_update.get("channel_post")
                        if message:
                            chat_id = str(message["chat"]["id"])
                            self.admin_chat_id = chat_id
                            logger.info(f"Auto-detected admin chat ID: {chat_id}")
                            return chat_id
        except Exception as e:
            logger.error(f"Failed to get chat ID: {e}")
        
        return None

    async def send_message(self, text: str, parse_mode: str = "HTML") -> bool:
        """Отправить сообщение админу."""
        if not self.enabled or not self.admin_chat_id:
            logger.warning("Telegram notifier is disabled or admin_chat_id is missing")
            return False

        logger.info(f"Sending TG message to {self.admin_chat_id} using token {settings.TELEGRAM_BOT_TOKEN[:10]}...")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self.base_url}/sendMessage",
                    json={
                        "chat_id": self.admin_chat_id,
                        "text": text,
                        "parse_mode": parse_mode,
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return bool(data.get("ok"))
                
                logger.error(f"Telegram API error: {response.status_code} - {response.text}")
                return False
                    
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False

    async def notify_login(self, user_email: str, user_name: str, ip: str = "unknown"):
        """Уведомление о входе пользователя."""
        text = (
            f"🔐 <b>Вход в систему</b>\n"
            f"👤 <b>{user_name}</b>\n"
            f"📧 {user_email}\n"
            f"🌐 IP: {ip}"
        )
        await self.send_message(text)

    async def notify_registration(self, user_email: str, user_name: str, user_type: str):
        """Уведомление о регистрации нового пользователя."""
        type_emoji = "👤" if user_type == "individual" else "🏢"
        type_name = "Физ. лицо" if user_type == "individual" else "Юр. лицо"
        
        text = (
            f"🎉 <b>Новая регистрация!</b>\n"
            f"{type_emoji} <b>{user_name}</b>\n"
            f"📧 {user_email}\n"
            f"📋 Тип: {type_name}"
        )
        await self.send_message(text)

    async def notify_document_generated(self, user_email: str, doc_type: str):
        """Уведомление о генерации документа."""
        doc_names = {
            "claim": "Исковое заявление",
            "complaint": "Жалоба",
            "demand": "Претензия",
        }
        doc_name = doc_names.get(doc_type, doc_type)
        
        text = (
            f"📄 <b>Документ сгенерирован</b>\n"
            f"👤 {user_email}\n"
            f"📝 Тип: {doc_name}"
        )
        await self.send_message(text)

    async def notify_contract_review(self, user_email: str, file_name: str):
        """Уведомление о проверке договора."""
        text = (
            f"🔍 <b>Проверка договора</b>\n"
            f"👤 {user_email}\n"
            f"📎 Файл: {file_name}"
        )
        await self.send_message(text)

    async def notify_support_message(self, user_email: str, user_name: str, message: str):
        """Уведомление о новом сообщении в поддержку."""
        text = (
            f"💬 <b>Новое сообщение в поддержку!</b>\n"
            f"👤 <b>{user_name}</b>\n"
            f"📧 {user_email}\n\n"
            f"📝 <b>Сообщение:</b>\n{message}"
        )
        await self.send_message(text)

    async def notify_subscription_activated(self, user_email: str, plan_id: str, code: str):
        """Уведомление об активации подписки."""
        plan_names = {
            "pro": "Pro (290 ₽)",
            "business": "Бизнес (990 ₽)",
        }
        plan_name = plan_names.get(plan_id, plan_id)
        
        text = (
            f"💎 <b>Подписка активирована!</b>\n"
            f"👤 {user_email}\n"
            f"💰 Тариф: {plan_name}\n"
            f"🔑 Код: <code>{code}</code>"
        )
        await self.send_message(text)


# Singleton instance
telegram_notifier = TelegramNotifier()
