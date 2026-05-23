from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import secrets
import hashlib
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.api_key import APIKey
from app.models.subscription import SubscriptionPlan
from app.middleware.auth import get_current_user
from app.services.limit_service import limit_service

router = APIRouter(prefix="/api-keys", tags=["API Ключи"])

@router.post("", summary="Создать новый API ключ")
async def create_api_key(
    name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Создать новый API ключ для пользователя.
    Доступно только для тарифов Бизнес и Корпоративный.
    """
    plan = await limit_service._get_user_plan(str(current_user.id), db)
    
    if plan not in (SubscriptionPlan.BUSINESS, SubscriptionPlan.ENTERPRISE):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API доступ доступен только в тарифах Бизнес и Корпоративный"
        )

    # Ограничение на количество ключей
    result = await db.execute(select(APIKey).where(APIKey.user_id == current_user.id))
    keys = result.scalars().all()
    if len(keys) >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Достигнут лимит API ключей (максимум 5)"
        )

    new_key = secrets.token_urlsafe(32)
    key_hash = hashlib.sha256(new_key.encode()).hexdigest()
    key_prefix = new_key[:8]

    api_key = APIKey(
        id=str(uuid.uuid4()),
        user_id=str(current_user.id),
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=name,
        is_active=True,
        rate_limit_per_minute=60 if plan == SubscriptionPlan.BUSINESS else 300
    )
    
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)
    
    return {
        "id": api_key.id,
        "name": api_key.name,
        "key": new_key,  # Показываем только один раз
        "created_at": api_key.created_at
    }

@router.get("", summary="Список API ключей")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получить список всех API ключей пользователя."""
    result = await db.execute(
        select(APIKey).where(APIKey.user_id == current_user.id).order_by(APIKey.created_at.desc())
    )
    keys = result.scalars().all()
    
    return [{
        "id": k.id,
        "name": k.name,
        "key_preview": f"{k.key_prefix}...",
        "is_active": k.is_active,
        "created_at": k.created_at,
        "last_used_at": k.last_used_at
    } for k in keys]

@router.delete("/{key_id}", summary="Удалить API ключ")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Удалить (отозвать) API ключ."""
    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.user_id == current_user.id)
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=404, detail="Ключ не найден")
        
    await db.delete(api_key)
    await db.commit()
    
    return {"status": "ok", "message": "API ключ удален"}
