from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from decimal import Decimal
from datetime import datetime
import uuid
import json

from app.database import get_db
from app.models.user import User
from app.models.payment import Payment, PaymentStatus
from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus
from app.schemas.payment import (
    PaymentResponse,
    PaymentPlan,
    PlanFeatures,
    SubscribeRequest,
    PaymentHistoryResponse,
    PaymentHistoryItem,
)
from app.services.usage_limit_service import usage_limit_service
from app.middleware.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/payments", tags=["Оплата"])

# Тарифные планы
PLANS = [
    PaymentPlan(
        id=SubscriptionPlan.FREE,
        name="Бесплатный",
        price=Decimal("0"),
        currency="RUB",
        billing_period=None,
        features=PlanFeatures(
            documents_per_month=5,
            contracts_per_month=3,
            priority_support=False,
            api_access=False,
        ),
    ),
    PaymentPlan(
        id=SubscriptionPlan.BASIC,
        name="Базовый",
        price=Decimal("990"),
        currency="RUB",
        billing_period="monthly",
        features=PlanFeatures(
            documents_per_month=30,
            contracts_per_month=20,
            priority_support=False,
            api_access=False,
        ),
    ),
    PaymentPlan(
        id=SubscriptionPlan.PRO,
        name="Профессиональный",
        price=Decimal("2990"),
        currency="RUB",
        billing_period="monthly",
        features=PlanFeatures(
            documents_per_month=200,
            contracts_per_month=100,
            priority_support=True,
            api_access=True,
        ),
    ),
    PaymentPlan(
        id=SubscriptionPlan.ENTERPRISE,
        name="Корпоративный",
        price=Decimal("9990"),
        currency="RUB",
        billing_period="monthly",
        features=PlanFeatures(
            documents_per_month=-1,
            contracts_per_month=-1,
            priority_support=True,
            api_access=True,
            team_members=10,
            custom_integrations=True,
        ),
    ),
]


@router.get(
    "/plans",
    summary="Тарифные планы",
)
async def get_plans():
    """
    Получить список всех тарифных планов.
    """
    return {"plans": PLANS}


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
    
    - **plan_id**: ID тарифного плана (basic, pro, enterprise)
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
    
    # Создание платежа
    payment = Payment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        amount=plan.price,
        currency=plan.currency,
        status=PaymentStatus.PENDING,
        payment_method=subscribe_data.payment_method,
        plan_type=plan_id,
    )
    
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    
    # В реальном приложении здесь создаётся сессия Stripe/YooKassa
    # и возвращается URL для оплаты
    payment_url = f"https://payment-gateway.example/pay/{payment.id}"
    
    payment.payment_url = payment_url
    await db.commit()
    
    return {
        "payment_url": payment_url,
        "session_id": str(payment.id),
        "plan_id": plan_id.value,
        "amount": float(plan.price),
        "currency": plan.currency,
    }


@router.post(
    "/webhook",
    summary="Webhook от платёжной системы",
)
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Обработать webhook от платёжной системы.
    """
    try:
        body = await request.json()
        
        event = body.get("event")
        session_id = body.get("session_id")
        user_id = body.get("user_id")
        
        if event == "payment.completed":
            # Обновление платежа
            payment_result = await db.execute(
                select(Payment).where(Payment.id == session_id)
            )
            payment = payment_result.scalar_one_or_none()
            
            if payment:
                payment.status = PaymentStatus.COMPLETED
                payment.completed_at = datetime.utcnow()
                payment.transaction_id = body.get("transaction_id")
                
                # Обновление подписки пользователя
                sub_result = await db.execute(
                    select(Subscription).where(Subscription.user_id == payment.user_id)
                )
                subscription = sub_result.scalar_one_or_none()
                
                if subscription:
                    subscription.plan_type = payment.plan_type
                    subscription.status = SubscriptionStatus.ACTIVE
                    subscription.auto_renew = True
                
                # Обновление лимитов
                await usage_limit_service.update_plan_limits(
                    str(payment.user_id),
                    payment.plan_type,
                    db,
                )
                
                await db.commit()
        
        return {"status": "ok"}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ошибка обработки webhook: {str(e)}",
        )


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

