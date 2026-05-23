from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional
from pydantic import BaseModel
import string
import random
import os
from datetime import datetime
from pathlib import Path

from app.database import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus
from app.models.document import Document
from app.models.activation_code import ActivationCode
from app.models.notification import Notification
from app.middleware.auth import get_current_user
from app.config import settings
from app.services.usage_limit_service import usage_limit_service

router = APIRouter(prefix="/admin", tags=["Администрирование"])

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.email not in settings.ADMIN_EMAILS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ запрещен: требуются права администратора"
        )
    return current_user

# --- СТАТИСТИКА И АНАЛИТИКА ---

@router.get("/stats", summary="Общая статистика")
async def get_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    users_count = await db.execute(select(func.count(User.id)))
    payments_count = await db.execute(select(func.count(Payment.id)).where(Payment.status == PaymentStatus.COMPLETED))
    total_revenue = await db.execute(select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.COMPLETED))
    
    # AI Токены
    tokens_res = await db.execute(select(func.sum(Document.ai_tokens_used)))
    total_tokens = tokens_res.scalar() or 0
    
    # Популярные документы
    doc_stats = await db.execute(
        select(Document.document_type, func.count(Document.id))
        .group_by(Document.document_type)
    )
    docs_popularity = {row[0]: row[1] for row in doc_stats.all()}

    return {
        "total_users": users_count.scalar() or 0,
        "total_payments": payments_count.scalar() or 0,
        "total_revenue": float(total_revenue.scalar() or 0),
        "total_tokens": total_tokens,
        "docs_popularity": docs_popularity,
        "currency": "RUB"
    }

# --- УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ---

@router.get("/users", summary="Список пользователей")
async def list_users(
    page: int = 1,
    limit: int = 100,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    users = result.scalars().all()
    
    user_list = []
    for u in users:
        sub_res = await db.execute(select(Subscription).where(Subscription.user_id == u.id))
        sub = sub_res.scalar_one_or_none()
        
        user_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "plan": sub.plan_type if sub else "free",
            "created_at": u.created_at,
            "is_active": u.is_active
        })
        
    return user_list

class UpdatePlanRequest(BaseModel):
    user_id: str
    plan_id: str

@router.post("/update-plan", summary="Изменить тариф пользователя вручную")
async def update_user_plan(
    request: UpdatePlanRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    sub_res = await db.execute(select(Subscription).where(Subscription.user_id == request.user_id))
    subscription = sub_res.scalar_one_or_none()
    
    if not subscription:
        subscription = Subscription(
            user_id=request.user_id,
            plan_type=request.plan_id,
            status=SubscriptionStatus.ACTIVE
        )
        db.add(subscription)
    else:
        subscription.plan_type = request.plan_id
        subscription.status = SubscriptionStatus.ACTIVE
        
    await usage_limit_service.update_plan_limits(str(request.user_id), request.plan_id, db)
    await db.commit()
    return {"status": "ok", "message": f"Тариф пользователя обновлен на {request.plan_id}"}

# --- ПЛАТЕЖИ ---

@router.get("/payments", summary="История всех платежей")
async def get_payments(
    page: int = 1,
    limit: int = 50,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    offset = (page - 1) * limit
    result = await db.execute(
        select(Payment, User.email)
        .join(User, Payment.user_id == User.id)
        .order_by(desc(Payment.created_at))
        .offset(offset)
        .limit(limit)
    )
    rows = result.all()
    
    payments = []
    for pay, email in rows:
        payments.append({
            "id": pay.id,
            "user_email": email,
            "amount": pay.amount,
            "status": pay.status,
            "plan_id": pay.plan_id,
            "created_at": pay.created_at
        })
    
    return payments

# --- ПРОМОКОДЫ ---

class PromoGenerateRequest(BaseModel):
    prefix: str = "LAXLY"
    plan_id: str = "pro"
    months: int = 1
    count: int = 10

@router.post("/promocodes/generate", summary="Массовая генерация кодов")
async def generate_promocodes(
    request: PromoGenerateRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    codes = []
    for _ in range(request.count):
        suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        code_str = f"{request.prefix}-{suffix}"
        
        code = ActivationCode(
            code=code_str,
            plan_id=request.plan_id,
            months=request.months
        )
        db.add(code)
        codes.append(code_str)
    
    await db.commit()
    return {"status": "ok", "generated_codes": codes}

@router.get("/promocodes", summary="Список промокодов")
async def list_promocodes(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(ActivationCode).order_by(desc(ActivationCode.created_at)).limit(100))
    codes = result.scalars().all()
    return codes

# --- МАССОВЫЕ УВЕДОМЛЕНИЯ ---

class BroadcastRequest(BaseModel):
    title: str
    message: str
    type: str = "info" # info, warning, success

@router.post("/broadcast", summary="Отправить уведомление всем пользователям")
async def broadcast_notification(
    request: BroadcastRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User.id))
    user_ids = result.scalars().all()
    
    for uid in user_ids:
        notif = Notification(
            user_id=uid,
            title=request.title,
            message=request.message,
            type=request.type
        )
        db.add(notif)
    
    await db.commit()
    return {"status": "ok", "delivered_to": len(user_ids)}

# --- ОБСЛУЖИВАНИЕ ---

@router.get("/backup", summary="Скачать бекап базы данных")
async def download_backup(
    admin: User = Depends(get_current_admin)
):
    paths = [Path("law_ai_agent.db"), Path("backend/law_ai_agent.db"), Path("/opt/law-ai-agent/backend/law_ai_agent.db")]
    db_path = None
    for p in paths:
        if p.exists():
            db_path = p
            break
            
    if not db_path:
        raise HTTPException(status_code=404, detail="Файл базы данных не найден")
    
    return FileResponse(
        path=db_path,
        filename=f"backup_laxly_{datetime.now().strftime('%Y-%m-%d_%H-%M')}.db",
        media_type="application/x-sqlite3"
    )
