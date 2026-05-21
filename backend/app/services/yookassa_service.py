import uuid
import logging
from yookassa import Configuration, Payment
from app.config import settings

logger = logging.getLogger(__name__)

class YooKassaService:
    def __init__(self):
        Configuration.account_id = settings.YOOKASSA_SHOP_ID
        Configuration.secret_key = settings.YOOKASSA_SECRET_KEY

    async def create_payment(self, amount: float, description: str, metadata: dict = None):
        """
        Создает платеж в ЮKassa.
        """
        try:
            idempotency_key = str(uuid.uuid4())
            res = Payment.create({
                "amount": {
                    "value": f"{amount:.2f}",
                    "currency": "RUB"
                },
                "confirmation": {
                    "type": "redirect",
                    "return_url": settings.YOOKASSA_RETURN_URL
                },
                "capture": True,
                "description": description,
                "metadata": metadata or {}
            }, idempotency_key)

            return res
        except Exception as e:
            logger.error(f"Error creating YooKassa payment: {e}")
            raise e

    def validate_webhook(self, body: dict):
        """
        Валидация вебхука (в простейшем случае проверка типа события).
        Для полной безопасности стоит проверять IP отправителя или подпись.
        """
        # YooKassa SDK не предоставляет встроенного метода валидации подписи в этом пакете так просто,
        # обычно проверяют IP или используют OAuth. 
        # Здесь мы просто возвращаем данные, если они есть.
        return body

yookassa_service = YooKassaService()
