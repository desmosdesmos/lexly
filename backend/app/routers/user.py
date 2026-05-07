from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from datetime import date
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.subscription import Subscription, SubscriptionPlan
from app.services.limit_service import limit_service
from app.models.request_log import RequestLog
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.usage import UsageResponse, UsageLimitItem
from app.services.auth_service import hash_password, verify_password
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/user", tags=["Пользователь"])


@router.get("/test")
async def test_endpoint():
    """Test endpoint without auth."""
    return {"msg": "auth works!"}


@router.get(
    "/profile",
    summary="Профиль пользователя",
)
async def get_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Получить профиль текущего пользователя.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "user_type": current_user.user_type.value if hasattr(current_user.user_type, 'value') else str(current_user.user_type),
        "phone": current_user.phone,
        "company_name": current_user.company_name,
        "company_inn": current_user.company_inn,
        "is_active": bool(current_user.is_active),
        "email_verified": bool(current_user.email_verified),
        "created_at": str(current_user.created_at),
    }


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Обновить профиль",
)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Обновить данные профиля.
    """
    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)

    return current_user


@router.get(
    "/usage",
    response_model=UsageResponse,
    summary="Использование лимитов",
)
async def get_usage(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить информацию об использовании лимитов.
    """
    usage_status = await limit_service.get_usage_status(current_user.id, db)

    return UsageResponse(
        plan=usage_status["plan"],
        limits={
            "documents": UsageLimitItem(
                max=usage_status["documents"]["max"],
                used=usage_status["documents"]["used"],
                remaining=usage_status["documents"]["remaining"],
                reset_date=date.today(),
            ),
            "contracts": UsageLimitItem(
                max=usage_status["contracts"]["max"],
                used=usage_status["contracts"]["used"],
                remaining=usage_status["contracts"]["remaining"],
                reset_date=date.today(),
            ),
        },
    )


@router.get(
    "/history",
    summary="История запросов",
)
async def get_history(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить историю запросов пользователя.
    """
    offset = (page - 1) * limit

    # Общее количество
    count_result = await db.execute(
        select(func.count()).select_from(RequestLog).where(RequestLog.user_id == current_user.id)
    )
    total = count_result.scalar() or 0

    # Список запросов
    logs_result = await db.execute(
        select(RequestLog)
        .where(RequestLog.user_id == current_user.id)
        .order_by(RequestLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    logs = logs_result.scalars().all()

    items = [
        {
            "id": str(log.id),
            "type": "document_generation" if "documents" in log.endpoint else "contract_review",
            "status": "completed" if log.response_status and log.response_status < 400 else "failed",
            "created_at": log.created_at.isoformat() if hasattr(log.created_at, 'isoformat') else str(log.created_at),
            "tokens_used": log.ai_tokens_used,
        }
        for log in logs
    ]

    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
    }


# ========== Смена пароля ==========

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


@router.post(
    "/change-password",
    summary="Сменить пароль",
    status_code=status.HTTP_200_OK,
)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Сменить пароль пользователя.

    - **current_password**: Текущий пароль
    - **new_password**: Новый пароль (минимум 8 символов)
    """
    # Проверяем текущий пароль
    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный текущий пароль",
        )

    # Валидация нового пароля
    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новый пароль должен содержать минимум 8 символов",
        )

    # Устанавливаем новый пароль
    current_user.password_hash = hash_password(request.new_password)
    await db.commit()

    return {"message": "Пароль успешно изменен"}
