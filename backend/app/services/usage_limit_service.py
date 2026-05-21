from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.usage_limit import UsageLimit
from app.models.subscription import Subscription, SubscriptionPlan
from app.services.plan_limits import PLAN_LIMITS, get_plan_limit


class UsageLimitService:
    """Сервис для управления лимитами использования (совместимость)."""
    
    @staticmethod
    async def get_usage_limits(user_id: str, db: AsyncSession) -> Optional[UsageLimit]:
        """Получить лимиты пользователя."""
        result = await db.execute(
            select(UsageLimit).where(UsageLimit.user_id == user_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def check_document_limit(user_id: str, db: AsyncSession) -> bool:
        from app.services.limit_service import limit_service
        allowed, _ = await limit_service.check_document_limit(user_id, db)
        if not allowed:
            raise HTTPException(status_code=429, detail="Превышен лимит документов")
        return True
    
    @staticmethod
    async def check_contract_limit(user_id: str, db: AsyncSession) -> bool:
        from app.services.limit_service import limit_service
        allowed, _ = await limit_service.check_contract_limit(user_id, db)
        if not allowed:
            raise HTTPException(status_code=429, detail="Превышен лимит проверок договоров")
        return True
    
    @staticmethod
    async def increment_documents_generated(user_id: str, db: AsyncSession):
        from app.services.limit_service import limit_service
        await limit_service.increment_documents(user_id, db)
    
    @staticmethod
    async def increment_contracts_reviewed(user_id: str, db: AsyncSession):
        from app.services.limit_service import limit_service
        await limit_service.increment_contracts(user_id, db)
    
    @staticmethod
    async def update_plan_limits(user_id: str, plan: str, db: AsyncSession):
        """Обновить лимиты при смене тарифа."""
        usage = await UsageLimitService.get_usage_limits(user_id, db)
        
        if not usage:
            # Создаем если нет
            import uuid
            usage = UsageLimit(
                id=str(uuid.uuid4()),
                user_id=user_id,
                documents_generated=0,
                contracts_reviewed=0
            )
            db.add(usage)
            await db.flush()
        
        # Конвертируем строку в Enum если нужно
        try:
            if isinstance(plan, str):
                p_enum = SubscriptionPlan(plan.lower())
            else:
                p_enum = plan
        except ValueError:
            # Если пришел enterprise или vip, мапим на business
            if plan.lower() in ('enterprise', 'vip'):
                p_enum = SubscriptionPlan.BUSINESS
            else:
                p_enum = SubscriptionPlan.FREE

        limits = get_plan_limit(p_enum)
        
        usage.plan_type = p_enum.value
        usage.max_documents = limits["documents_per_month"]
        usage.max_contracts = limits["contracts_per_month"]
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
