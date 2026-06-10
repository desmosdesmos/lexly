from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from decimal import Decimal
from datetime import datetime
import uuid
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
        id=SubscriptionPlan.PRO,
        name="Pro",
        price=Decimal("290"),
        currency="RUB",
        billing_period="monthly",
        features=PlanFeatures(
            documents_per_month=50,
            contracts_per_month=25,
            priority_support=True,
            api_access=False,
        ),
    ),
    PaymentPlan(
        id=SubscriptionPlan.BUSINESS,
        name="Бизнес",
        price=Decimal("990"),
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
        price=Decimal("1990"),
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
    request: Request,
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
    payment_id = str(uuid.uuid4())
    payment = Payment(
        id=payment_id,
        user_id=str(current_user.id),
        amount=plan.price,
        currency=plan.currency,
        status=PaymentStatus.PENDING,
        payment_method=subscribe_data.payment_method,
        plan_type=plan_id,
    )
    
    db.add(payment)
    await db.commit()
    
    # Если секретный ключ YooKassa не настроен — используем встроенную тестовую песочницу
    if not settings.YOOKASSA_SECRET_KEY:
        logger.info(f"YooKassa key is not set. Using local mock checkout for payment {payment_id}")
        base_url = str(request.base_url).rstrip('/')
        payment.payment_url = f"{base_url}/api/v1/payments/confirm-mock/{payment_id}"
        await db.commit()
        await db.refresh(payment)
        return {
            "payment_url": payment.payment_url,
            "session_id": str(payment.id),
            "plan_id": plan_id.value,
            "amount": float(plan.price),
            "currency": plan.currency,
        }
    
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


@router.get(
    "/check/{payment_id}",
    summary="Проверить статус платежа вручную",
)
async def check_payment_status(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Вручную проверить статус платежа в ЮKassa и обновить подписку.
    Полезно, если webhook не дошел.
    """
    # 1. Ищем платеж в нашей БД
    payment_result = await db.execute(
        select(Payment).where(Payment.id == payment_id)
    )
    payment = payment_result.scalar_one_or_none()
    
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
    
    if not payment.external_payment_id:
        return {"status": payment.status, "message": "Внешний ID платежа отсутствует"}

    if payment.status == PaymentStatus.COMPLETED:
        return {"status": "completed", "message": "Платеж уже обработан"}

    # 2. Запрашиваем ЮKassa
    try:
        yookassa_payment = await yookassa_service.get_payment(payment.external_payment_id)
        
        if yookassa_payment.status == "succeeded":
            # Обновляем как при вебхуке
            payment.status = PaymentStatus.COMPLETED
            payment.completed_at = datetime.utcnow()
            payment.transaction_id = yookassa_payment.id
            
            # Обновление подписки
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
                        code="MANUAL_CHECK"
                    )
            except Exception as te:
                logger.warning(f"Failed to send Telegram notification: {te}")

            await db.commit()
            return {"status": "completed", "message": "Платеж успешно подтвержден!"}
            
        elif yookassa_payment.status == "canceled":
            payment.status = PaymentStatus.FAILED
            await db.commit()
            return {"status": "failed", "message": "Платеж отменен в ЮKassa"}
            
        return {"status": yookassa_payment.status, "message": "Платеж еще в обработке"}
        
    except Exception as e:
        logger.error(f"Error checking payment {payment_id}: {e}")
        return {"status": "error", "message": str(e)}


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


# ========== Тестовая Песочница Оплаты (MOCK Sandbox) ==========

from fastapi.responses import HTMLResponse, RedirectResponse

@router.get("/confirm-mock/{payment_id}", response_class=HTMLResponse)
async def get_confirm_mock(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Отрисовка страницы подтверждения оплаты в песочнице."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        return HTMLResponse("<h1>Платеж не найден</h1>", status_code=404)
        
    plan_name = "Подписка"
    plan = next((p for p in PLANS if p.id == payment.plan_type), None)
    if plan:
        plan_name = plan.name

    cancel_url = settings.YOOKASSA_RETURN_URL or "/dashboard/profile"

    return HTMLResponse(content=f"""
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Песочница Оплаты Laxly</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{
                background-color: #070A13;
                color: #f1f5f9;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
            }}
            .card {{
                background-color: #0e1325;
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 28px;
                padding: 40px;
                width: 90%;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0,0,0,0.6);
            }}
            .logo {{
                font-size: 26px;
                font-weight: 900;
                color: #ffffff;
                letter-spacing: -0.03em;
                margin-bottom: 20px;
            }}
            .logo span {{
                color: #0A84FF;
            }}
            h1 {{
                font-size: 18px;
                margin-top: 0;
                font-weight: 700;
                color: #94a3b8;
                text-transform: uppercase;
                letter-spacing: 0.1em;
            }}
            .amount {{
                font-size: 42px;
                font-weight: 900;
                margin: 25px 0 5px 0;
                color: #ffffff;
            }}
            .plan {{
                font-size: 14px;
                color: #a78bfa;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 35px;
            }}
            .btn {{
                background: linear-gradient(135deg, #0A84FF 0%, #5E5CE6 100%);
                color: white;
                border: none;
                padding: 16px 28px;
                border-radius: 14px;
                font-size: 14px;
                font-weight: 850;
                cursor: pointer;
                width: 100%;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                transition: transform 0.1s ease, filter 0.2s ease;
                box-shadow: 0 10px 20px rgba(10, 132, 255, 0.15);
            }}
            .btn:hover {{
                filter: brightness(1.1);
            }}
            .btn:active {{
                transform: scale(0.97);
            }}
            .cancel-link {{
                display: inline-block;
                margin-top: 25px;
                color: #64748b;
                text-decoration: none;
                font-size: 13px;
                font-weight: 600;
                transition: color 0.2s ease;
            }}
            .cancel-link:hover {{
                color: #cbd5e1;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <div class="logo">Laxly<span>.</span> Sandbox</div>
            <h1>Тестовая оплата подписки</h1>
            <div class="amount">{payment.amount} ₽</div>
            <div class="plan">Тариф: {plan_name}</div>
            
            <form action="/api/v1/payments/confirm-mock/{payment_id}" method="POST">
                <button type="submit" class="btn">Подтвердить тестовый платёж</button>
            </form>
            
            <a href="{cancel_url}" class="cancel-link">Вернуться назад</a>
        </div>
    </body>
    </html>
    """, status_code=200)

@router.post("/confirm-mock/{payment_id}")
async def post_confirm_mock(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Имитация подтверждения успешной оплаты подписки."""
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Платеж не найден")
        
    redirect_url = settings.YOOKASSA_RETURN_URL or "/dashboard/profile"
        
    if payment.status == PaymentStatus.COMPLETED:
        return RedirectResponse(url=f"{redirect_url}?payment=already_processed", status_code=303)
        
    # Обновляем статус платежа
    payment.status = PaymentStatus.COMPLETED
    payment.completed_at = datetime.utcnow()
    payment.transaction_id = f"mock_{uuid.uuid4().hex[:12]}"
    
    # Обновление или создание подписки
    sub_result = await db.execute(select(Subscription).where(Subscription.user_id == payment.user_id))
    subscription = sub_result.scalar_one_or_none()
    
    # Рассчитываем дату окончания подписки (на 1 месяц вперед)
    from datetime import date as date_type
    import calendar
    today = date_type.today()
    year = today.year
    month = today.month + 1
    if month > 12:
        year += 1
        month -= 12
    last_day = calendar.monthrange(year, month)[1]
    end_date = date_type(year, month, min(today.day, last_day))
    
    if not subscription:
        subscription = Subscription(
            user_id=payment.user_id,
            plan_type=payment.plan_type,
            status=SubscriptionStatus.ACTIVE,
            end_date=end_date,
            auto_renew=True
        )
        db.add(subscription)
    else:
        subscription.plan_type = payment.plan_type
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.end_date = end_date
        subscription.auto_renew = True
        
    # Обновление лимитов
    await usage_limit_service.update_plan_limits(str(payment.user_id), payment.plan_type, db)
    await db.commit()
    
    # Уведомление в Telegram
    try:
        user_result = await db.execute(select(User).where(User.id == payment.user_id))
        user = user_result.scalar_one_or_none()
        if user:
            await telegram_notifier.notify_subscription_activated(
                user_email=user.email,
                plan_id=payment.plan_type,
                code="SANDBOX_MOCK"
            )
    except Exception as te:
        logger.warning(f"Failed to send Telegram notification: {te}")
        
    return RedirectResponse(url=f"{redirect_url}?payment=success", status_code=303)
