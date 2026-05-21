from fastapi import APIRouter, Depends, Body, Request, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import httpx
import os
import aiofiles
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.support_message import SupportMessage
from app.services.telegram_notifier import telegram_notifier
from app.config import settings

router = APIRouter(prefix="/support", tags=["Support"])

UPLOAD_DIR = "uploads/support"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/message")
async def send_support_message(
    message: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Отправить сообщение в поддержку с опциональным фото."""
    image_url = None
    if image:
        file_ext = os.path.splitext(image.filename)[1]
        file_name = f"{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, file_name)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await image.read()
            await out_file.write(content)
        
        image_url = f"/uploads/support/{file_name}"

    # 1. Проверяем, первое ли это сообщение пользователя
    result = await db.execute(
        select(SupportMessage).where(SupportMessage.user_id == current_user.id)
    )
    is_first_message = result.first() is None

    # 2. Сохраняем сообщение пользователя в БД
    new_msg = SupportMessage(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        text=message,
        image_url=image_url,
        sender="user"
    )
    db.add(new_msg)
    
    # 3. Добавляем авто-ответ только если это ПЕРВОЕ сообщение
    if is_first_message:
        auto_reply = SupportMessage(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            text="Здравствуйте! Ваше сообщение получено. Оператор свяжется с вами в ближайшее время прямо здесь.",
            sender="support"
        )
        db.add(auto_reply)
    
    await db.commit()

    # 3. Отправляем в Телеграм админу
    caption = (
        f"💬 <b>Новое сообщение!</b>\n"
        f"👤 <b>{current_user.full_name}</b>\n"
        f"📧 {current_user.email}\n"
        f"🆔 <code>{current_user.id}</code>\n\n"
        f"📝 <b>Сообщение:</b>\n{message or '[Фото]'}"
    )
    
    if image_url:
        # Отправляем как фото
        full_image_path = os.path.abspath(os.path.join(UPLOAD_DIR, os.path.basename(image_url)))
        async with httpx.AsyncClient() as client:
            with open(full_image_path, 'rb') as f:
                await client.post(
                    f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/sendPhoto",
                    data={"chat_id": settings.TELEGRAM_ADMIN_CHAT_ID, "caption": caption, "parse_mode": "HTML"},
                    files={"photo": f}
                )
    else:
        await telegram_notifier.send_message(caption)
    
    return {"status": "ok", "message": "Сообщение отправлено"}

@router.get("/messages")
async def get_support_messages(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить историю сообщений."""
    result = await db.execute(
        select(SupportMessage)
        .where(SupportMessage.user_id == current_user.id)
        .order_by(SupportMessage.created_at.asc())
    )
    messages = result.scalars().all()
    return [{
        "id": m.id,
        "text": m.text,
        "image_url": m.image_url,
        "sender": m.sender,
        "created_at": m.created_at,
        "is_read": m.is_read
    } for m in messages]

@router.post("/telegram-webhook")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Принимает ответы от админа из Телеграма (включая фото)."""
    data = await request.json()
    message = data.get("message")
    if not message:
        return {"ok": True}

    reply_to = message.get("reply_to_message")
    if not reply_to:
        return {"ok": True}

    original_text = reply_to.get("text") or reply_to.get("caption") or ""
    if "🆔" not in original_text:
        return {"ok": True}

    try:
        import re
        user_ids = re.findall(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', original_text)
        if not user_ids:
            return {"ok": True}
        
        target_user_id = user_ids[0]
        reply_text = message.get("text") or message.get("caption")
        
        image_url = None
        # Если прислали фото в ответ
        if "photo" in message:
            photo_list = message.get("photo")
            # Берем самое большое разрешение
            file_id = photo_list[-1]["file_id"]
            
            async with httpx.AsyncClient() as client:
                # Получаем путь к файлу
                file_info = await client.get(f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/getFile?file_id={file_id}")
                file_path_tg = file_info.json()["result"]["file_path"]
                
                # Скачиваем файл
                file_content = await client.get(f"https://api.telegram.org/file/bot{settings.TELEGRAM_BOT_TOKEN}/{file_path_tg}")
                
                file_name = f"admin_{uuid.uuid4()}.jpg"
                local_path = os.path.join(UPLOAD_DIR, file_name)
                
                async with aiofiles.open(local_path, 'wb') as f:
                    await f.write(file_content.content)
                
                image_url = f"/uploads/support/{file_name}"

        # Сохраняем ответ поддержки в БД
        new_reply = SupportMessage(
            id=str(uuid.uuid4()),
            user_id=target_user_id,
            text=reply_text,
            image_url=image_url,
            sender="support"
        )
        db.add(new_reply)
        await db.commit()
        
        return {"ok": True}
    except Exception as e:
        print(f"Error in telegram webhook: {e}")
        return {"ok": True}

@router.post("/setup-webhook")
async def setup_webhook():
    """Установить webhook для Телеграм бота."""
    webhook_url = f"https://laxlylaw.ru{settings.API_V1_PREFIX}/support/telegram-webhook"
    async with httpx.AsyncClient() as client:
        # Сначала удаляем старый, чтобы очистить очередь
        await client.get(f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/deleteWebhook?drop_pending_updates=true")
        # Ставим новый
        resp = await client.get(f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/setWebhook?url={webhook_url}")
        return resp.json()
