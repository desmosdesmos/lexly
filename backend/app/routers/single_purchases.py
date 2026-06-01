from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.single_purchase import SinglePurchase
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/purchases", tags=["Разовые покупки"])

class PurchaseCreate(BaseModel):
    document_id: str
    amount: float
    payment_method: Optional[str] = "card"

@router.post(
    "/create",
    summary="Создать запись о разовой покупке",
)
async def create_purchase(
    request: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Инициализация разовой покупки документа."""
    # Проверка существования документа
    doc_result = await db.execute(
        select(Document).where(Document.id == request.document_id)
    )
    document = doc_result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Документ не найден")

    purchase = SinglePurchase(
        user_id=current_user.id,
        document_id=request.document_id,
        amount=request.amount,
        status="pending",
        payment_method=request.payment_method,
        transaction_id=str(uuid.uuid4()) # В реальности здесь будет ID от платежной системы
    )
    
    db.add(purchase)
    await db.commit()
    await db.refresh(purchase)
    
    return {
        "purchase_id": purchase.id,
        "amount": purchase.amount,
        "status": purchase.status,
        "payment_url": f"https://payment-mock.ru/pay/{purchase.transaction_id}" # Ссылка на оплату
    }

@router.post(
    "/{purchase_id}/confirm-mock",
    summary="Подтверждение оплаты (MOCK)",
)
async def confirm_purchase_mock(
    purchase_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Имитация подтверждения оплаты от платежной системы."""
    result = await db.execute(
        select(SinglePurchase).where(SinglePurchase.id == purchase_id)
    )
    purchase = result.scalar_one_or_none()
    
    if not purchase:
        raise HTTPException(status_code=404, detail="Покупка не найдена")
    
    purchase.status = "completed"
    purchase.completed_at = datetime.now()
    
    await db.commit()
    
    return {"status": "success", "message": "Оплата подтверждена"}

@router.get(
    "/stats",
    summary="Статистика покупок (для админа)",
)
async def get_purchase_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить общую сумму продаж по разовым покупкам."""
    # В реальном приложении здесь нужна проверка на админа
    from sqlalchemy import func
    result = await db.execute(
        select(func.sum(SinglePurchase.amount)).where(SinglePurchase.status == "completed")
    )
    total_revenue = result.scalar() or 0
    
    count_result = await db.execute(
        select(func.count(SinglePurchase.id)).where(SinglePurchase.status == "completed")
    )
    total_count = count_result.scalar() or 0
    
    return {
        "total_revenue": total_revenue,
        "total_sales": total_count,
        "currency": "RUB"
    }
