from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from decimal import Decimal
from datetime import datetime
from datetime import date as date_type
import uuid
import json
import secrets
import string
import logging
from pydantic import BaseModel

logger = logging.getLogger(__name__)

from app.database import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus
from app.models.activation_code import ActivationCode
from app.schemas.payment import (
    PaymentResponse,
    PaymentPlan,
    PlanFeatures,
    SubscribeRequest,
    PaymentHistoryResponse,
    PaymentHistoryItem,
)
from app.services.usage_limit_service import usage_limit_service
from app.services.telegram_notifier import telegram_notifier
from app.middleware.auth import get_current_user
from app.config import settings
from app.services.yookassa_service import yookassa_service

router = APIRouter(prefix="/payments", tags=["Оплата"])

# ... (PLANS and get_plans unchanged)

@router.post(
    "/subscribe",
    summary="Оформить подписку",
)
async def subscribe(
    subscribe_data: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Оформить подписку на тарифный план.
    
    - **plan_id**: ID тарифного плана (basic, pro, business)
    - **payment_method**: Способ оплаты (card)
    """
    plan_id = subscribe_data.plan_id
    
    # Проверка, что план не free
    if plan_id == SubscriptionPlan.FREE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Нельзя оформить бесплатную подписку. Вы уже на бесплатном тарифе.",
        )
    
    # Поиск плана
    plan = next((p for p in PLANS if p.id == plan_id), None)
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Тарифный план не найден",
        )
    
    # Создание записи платежа в БД (PENDING)
    payment_id = uuid.uuid4()
    payment = Payment(
        id=payment_id,
        user_id=current_user.id,
        amount=plan.price,
        currency=plan.currency,
        status=PaymentStatus.PENDING,
        payment_method=subscribe_data.payment_method,
        plan_type=plan_id,
    )
    
    db.add(payment)
    await db.commit()
    
    # Создание платежа в YooKassa
    try:
        yookassa_payment = await yookassa_service.create_payment(
            amount=float(plan.price),
            description=f"Оплата подписки {plan.name} для {current_user.email}",
            metadata={
                "user_id": str(current_user.id),
                "payment_id": str(payment_id),
                "plan_id": plan_id.value
            }
        )
        
        payment.external_payment_id = yookassa_payment.id
        payment.payment_url = yookassa_payment.confirmation.confirmation_url
        await db.commit()
        await db.refresh(payment)
        
        return {
            "payment_url": payment.payment_url,
            "session_id": str(payment.id),
            "plan_id": plan_id.value,
            "amount": float(plan.price),
            "currency": plan.currency,
        }
    except Exception as e:
        logger.error(f"YooKassa payment creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка при создании платежа в платёжной системе"
        )


@router.post(
    "/webhook",
    summary="Webhook от платёжной системы",
)
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Обработать webhook от ЮKassa.
    """
    try:
        body = await request.json()
        logger.info(f"Received YooKassa webhook: {body}")
        
        event = body.get("event")
        obj = body.get("object", {})
        
        if event == "payment.succeeded":
            metadata = obj.get("metadata", {})
            payment_id = metadata.get("payment_id")
            user_id = metadata.get("user_id")
            
            if not payment_id:
                logger.error("No payment_id in YooKassa webhook metadata")
                return {"status": "error", "message": "No payment_id"}

            # Обновление платежа
            payment_result = await db.execute(
                select(Payment).where(Payment.id == payment_id)
            )
            payment = payment_result.scalar_one_or_none()
            
            if payment and payment.status != PaymentStatus.COMPLETED:
                payment.status = PaymentStatus.COMPLETED
                payment.completed_at = datetime.utcnow()
                payment.transaction_id = obj.get("id")
                
                # Обновление подписки пользователя
                sub_result = await db.execute(
                    select(Subscription).where(Subscription.user_id == payment.user_id)
                )
                subscription = sub_result.scalar_one_or_none()
                
                if not subscription:
                    subscription = Subscription(
                        user_id=payment.user_id,
                        plan_type=payment.plan_type,
                        status=SubscriptionStatus.ACTIVE,
                        auto_renew=True
                    )
                    db.add(subscription)
                else:
                    subscription.plan_type = payment.plan_type
                    subscription.status = SubscriptionStatus.ACTIVE
                    subscription.auto_renew = True
                
                # Обновление лимитов
                await usage_limit_service.update_plan_limits(
                    str(payment.user_id),
                    payment.plan_type,
                    db,
                )
                
                # Уведомление в Telegram
                try:
                    user_result = await db.execute(select(User).where(User.id == payment.user_id))
                    user = user_result.scalar_one_or_none()
                    if user:
                        await telegram_notifier.notify_subscription_activated(
                            user_email=user.email,
                            plan_id=payment.plan_type,
                            code="PAYMENT"
                        )
                except Exception as te:
                    logger.warning(f"Failed to send Telegram notification: {te}")

                await db.commit()
                logger.info(f"Payment {payment_id} completed successfully")
        
        elif event == "payment.canceled":
            metadata = obj.get("metadata", {})
            payment_id = metadata.get("payment_id")
            if payment_id:
                payment_result = await db.execute(
                    select(Payment).where(Payment.id == payment_id)
                )
                payment = payment_result.scalar_one_or_none()
                if payment:
                    payment.status = PaymentStatus.FAILED
                    await db.commit()
                    logger.info(f"Payment {payment_id} canceled")

        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return {"status": "error", "message": str(e)}


@router.get(
    "/history",
    response_model=PaymentHistoryResponse,
    summary="История платежей",
)
async def payment_history(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить историю платежей пользователя.
    """
    offset = (page - 1) * limit
    
    # Общее количество
    count_result = await db.execute(
        select(func.count()).select_from(Payment).where(Payment.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Список платежей
    payments_result = await db.execute(
        select(Payment)
        .where(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    payments = payments_result.scalars().all()
    
    items = [
        PaymentHistoryItem(
            id=str(p.id),
            plan_id=p.plan_type,
            amount=p.amount,
            currency=p.currency,
            status=p.status,
            payment_method=p.payment_method,
            created_at=p.created_at,
        )
        for p in payments
    ]
    
    return PaymentHistoryResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


# ========== Коды активации подписки ==========

class GenerateCodeResponse(BaseModel):
    code: str
    plan_id: str
    months: int


@router.post(
    "/admin/generate-code",
    response_model=GenerateCodeResponse,
    summary="Сгенерировать код активации (админ)",
)
async def admin_generate_code(
    plan_id: str = "pro",
    months: int = 1,
    db: AsyncSession = Depends(get_db),
):
    """
    Сгенерировать код активации подписки и сохранить в БД.
    """
    import secrets
    import string
    
    # Генерируем уникальный код
    while True:
        code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        # Проверяем что код уникален
        existing = await db.execute(select(ActivationCode).where(ActivationCode.code == code))
        if not existing.scalar_one_or_none():
            break
    
    # Сохраняем в БД
    activation_code = ActivationCode(
        code=code,
        plan_id=plan_id,
        months=months,
    )
    db.add(activation_code)
    await db.commit()
    
    return GenerateCodeResponse(
        code=code,
        plan_id=plan_id,
        months=months,
    )


class ActivateCodeRequest(BaseModel):
    code: str


@router.post(
    "/activate-code",
    summary="Активировать подписку по коду",
)
async def activate_subscription_code(
    request: ActivateCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Активировать подписку по коду активации.
    Код можно использовать только 1 раз.
    """
    code = request.code.upper().strip()
    
    # Ищем код в БД
    result = await db.execute(
        select(ActivationCode).where(ActivationCode.code == code)
    )
    activation_code = result.scalar_one_or_none()
    
    if not activation_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный код активации",
        )
    
    if activation_code.is_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Этот код уже использован",
        )
    
    plan_id = activation_code.plan_id
    months = activation_code.months

    # Находим подписку пользователя
    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == current_user.id)
    )
    subscription = sub_result.scalar_one_or_none()

    # Если подписки нет - создаём
    if not subscription:
        subscription = Subscription(
            user_id=current_user.id,
            plan_type=SubscriptionPlan.FREE.value,
            status=SubscriptionStatus.ACTIVE,
        )
        db.add(subscription)
        await db.flush()
    
    from datetime import date as date_type
    import calendar

    # Рассчитываем дату окончания подписки
    today = date_type.today()
    year = today.year
    month = today.month + months
    
    # Переносим год если месяц > 12
    while month > 12:
        year += 1
        month -= 1
    
    # Последний день месяца
    last_day = calendar.monthrange(year, month)[1]
    end_date = date_type(year, month, min(today.day, last_day))

    # Обновляем подписку
    subscription.plan_type = plan_id
    subscription.status = SubscriptionStatus.ACTIVE
    subscription.end_date = end_date
    subscription.auto_renew = True
    
    # Помечаем код как использованный
    activation_code.is_used = True
    activation_code.used_by_user_id = str(current_user.id)
    activation_code.used_at = datetime.utcnow()

    # TODO: Payment запись не создаём для SQLite (UUID проблема)
    # В продакшене с PostgreSQL - создавать Payment
    
    # Обновляем лимиты
    await usage_limit_service.update_plan_limits(
        str(current_user.id),
        plan_id,
        db,
    )
    
    await db.commit()
    
    # Уведомление в Telegram
    try:
        await telegram_notifier.notify_subscription_activated(
            user_email=current_user.email,
            plan_id=plan_id,
            code=code,
        )
    except Exception as e:
        logger.warning(f"Failed to send Telegram notification: {e}")
    
    return {
        "message": "Подписка активирована!",
        "plan_id": plan_id,
        "end_date": subscription.end_date.isoformat(),
    }

