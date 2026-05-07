from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usage_limit import UsageLimit
from app.models.subscription import Subscription, SubscriptionPlan


# Лимиты для разных тарифов
PLAN_LIMITS = {
    SubscriptionPlan.FREE: {
        "max_documents": 5,
        "max_contracts": 3,
    },
    SubscriptionPlan.BASIC: {
        "max_documents": 30,
        "max_contracts": 20,
    },
    SubscriptionPlan.PRO: {
        "max_documents": 200,
        "max_contracts": 100,
    },
    SubscriptionPlan.BUSINESS: {
        "max_documents": -1,  # Безлимит
        "max_contracts": -1,
    },
}


class UsageLimitService:
    """Сервис для управления лимитами использования."""
    
    @staticmethod
    async def get_usage_limits(user_id: str, db: AsyncSession) -> Optional[UsageLimit]:
        """Получить лимиты пользователя."""
        result = await db.execute(
            select(UsageLimit).where(UsageLimit.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def check_document_limit(user_id: str, db: AsyncSession) -> bool:
        """
        Проверить лимит генерации документов.
        
        Returns:
            True если лимит не превышен
        
        Raises:
            HTTPException если лимит превышен
        """
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if not usage:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Лимиты использования не найдены",
            )
        
        # Безлимитный тариф
        if usage.max_documents == -1:
            return True
        
        if usage.documents_generated >= usage.max_documents:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Превышен лимит генерации документов для вашего тарифа. "
                    f"Доступно: {usage.max_documents}, использовано: {usage.documents_generated}"
                ),
            )
        
        return True
    
    @staticmethod
    async def check_contract_limit(user_id: str, db: AsyncSession) -> bool:
        """
        Проверить лимит проверки договоров.
        
        Returns:
            True если лимит не превышен
        
        Raises:
            HTTPException если лимит превышен
        """
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if not usage:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Лимиты использования не найдены",
            )
        
        # Безлимитный тариф
        if usage.max_contracts == -1:
            return True
        
        if usage.contracts_reviewed >= usage.max_contracts:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    f"Превышен лимит проверки договоров для вашего тарифа. "
                    f"Доступно: {usage.max_contracts}, использовано: {usage.contracts_reviewed}"
                ),
            )
        
        return True
    
    @staticmethod
    async def increment_documents_generated(user_id: str, db: AsyncSession):
        """Увеличить счётчик сгенерированных документов."""
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if usage:
            usage.documents_generated += 1
            await db.commit()
    
    @staticmethod
    async def increment_contracts_reviewed(user_id: str, db: AsyncSession):
        """Увеличить счётчик проверенных договоров."""
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if usage:
            usage.contracts_reviewed += 1
            await db.commit()
    
    @staticmethod
    async def update_plan_limits(user_id: str, plan: SubscriptionPlan, db: AsyncSession):
        """Обновить лимиты при смене тарифа."""
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if not usage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Лимиты использования не найдены",
            )
        
        limits = PLAN_LIMITS.get(plan, PLAN_LIMITS[SubscriptionPlan.FREE])
        
        usage.plan_type = plan
        usage.max_documents = limits["max_documents"]
        usage.max_contracts = limits["max_contracts"]
        usage.documents_generated = 0
        usage.contracts_reviewed = 0
        
        await db.commit()
        return usage


usage_limit_service = UsageLimitService()


async def check_and_increment_usage(
    user_id: str,
    resource_type: str,
    db: AsyncSession,
) -> bool:
    """
    Проверить лимит и увеличить счётчик.
    
    Args:
        user_id: ID пользователя
        resource_type: 'documents' или 'contracts'
        db: Сессия БД
    
    Returns:
        True если лимит не превышен, False если превышен
    """
    try:
        if resource_type == "documents":
            await UsageLimitService.check_document_limit(user_id, db)
            await UsageLimitService.increment_documents_generated(user_id, db)
        elif resource_type == "contracts":
            await UsageLimitService.check_contract_limit(user_id, db)
            await UsageLimitService.increment_contracts_reviewed(user_id, db)
        else:
            return False
        
        return True
    except HTTPException:
        return False

