from fastapi import APIRouter, Depends, Body
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.telegram_notifier import telegram_notifier

router = APIRouter(prefix="/support", tags=["Support"])

@router.post("/message")
async def send_support_message(
    message: str = Body(..., embed=True),
    current_user: User = Depends(get_current_user)
):
    """Отправить сообщение в поддержку (в Телеграм админу)."""
    await telegram_notifier.notify_support_message(
        user_email=current_user.email,
        user_name=current_user.full_name,
        message=message
    )
    return {"status": "ok", "message": "Сообщение отправлено"}
