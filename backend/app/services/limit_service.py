"""Сервис лимитов Lexly — строгий контроль использования."""
from typing import Optional
from datetime import datetime, date
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.usage_limit import UsageLimit
from app.models.user import User
from app.services.plan_limits import PLAN_LIMITS, SubscriptionPlan, get_plan_limit


class LimitService:
    """Строгий контроль лимитов по тарифам."""

    @staticmethod
    async def _get_or_create_limits(user_id: str, db: AsyncSession) -> UsageLimit:
        """Получить или создать лимиты пользователя."""
        result = await db.execute(
            select(UsageLimit).where(UsageLimit.user_id == user_id)
        )
        usage = result.scalar_one_or_none()

        if not usage:
            usage = UsageLimit(
                id=str(uuid.uuid4()),
                user_id=user_id,
                plan_type=SubscriptionPlan.FREE.value,
                max_documents=2,
                max_contracts=2,
                documents_generated=0,
                contracts_reviewed=0,
                ai_requests_today=0,
                court_practice_today=0,
                law_monitoring_today=0,
            )
            db.add(usage)
            await db.flush()

        return usage

    @staticmethod
    async def _get_user_plan(user_id: str, db: AsyncSession) -> SubscriptionPlan:
        """Получить тариф пользователя."""
        from app.models.subscription import Subscription
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        sub = result.scalar_one_or_none()
        if sub:
            try:
                # Мапим типы тарифов на наш SubscriptionPlan enum
                p = sub.plan_type.lower()
                return SubscriptionPlan(p)
            except ValueError:
                # Если вдруг в БД старое значение типа 'basic'
                return SubscriptionPlan.FREE
        
        return SubscriptionPlan.FREE

    @staticmethod
    async def _reset_daily_if_needed(usage: UsageLimit) -> bool:
        """Сбросить daily счётчики если наступил новый день."""
        today = date.today().isoformat()
        reset = False
        if hasattr(usage, 'last_ai_request_date') and usage.last_ai_request_date != today:
            usage.ai_requests_today = 0
            usage.court_practice_today = 0
            usage.law_monitoring_today = 0
            usage.last_ai_request_date = today
            reset = True
        return reset

    @staticmethod
    async def _reset_monthly_if_needed(usage: UsageLimit) -> bool:
        """Сбросить monthly счётчики если наступил новый месяц."""
        current_month = date.today().strftime('%Y-%m')
        reset = False
        if usage.reset_date:
            reset_month = str(usage.reset_date)[:7]
            if reset_month != current_month:
                usage.documents_generated = 0
                usage.contracts_reviewed = 0
                usage.reset_date = date.today()
                reset = True
        return reset

    @staticmethod
    async def check_document_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_monthly_if_needed(usage)
        max_docs = limits['documents_per_month']
        if max_docs == -1: return True, {"max": -1, "used": usage.documents_generated, "remaining": -1}
        if usage.documents_generated >= max_docs:
            return False, {"max": max_docs, "used": usage.documents_generated, "remaining": 0, "plan": plan.value, "upgrade_required": True}
        return True, {"max": max_docs, "used": usage.documents_generated, "remaining": max_docs - usage.documents_generated, "plan": plan.value}

    @staticmethod
    async def check_contract_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_monthly_if_needed(usage)
        max_contracts = limits['contracts_per_month']
        if max_contracts == -1: return True, {"max": -1, "used": usage.contracts_reviewed, "remaining": -1}
        if usage.contracts_reviewed >= max_contracts:
            return False, {"max": max_contracts, "used": usage.contracts_reviewed, "remaining": 0, "plan": plan.value, "upgrade_required": True}
        return True, {"max": max_contracts, "used": usage.contracts_reviewed, "remaining": max_contracts - usage.contracts_reviewed, "plan": plan.value}

    @staticmethod
    async def check_ai_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_daily_if_needed(usage)
        max_ai = limits['ai_requests_per_day']
        if max_ai == -1: return True, {"max": -1, "used": usage.ai_requests_today, "remaining": -1}
        if usage.ai_requests_today >= max_ai:
            return False, {"max": max_ai, "used": usage.ai_requests_today, "remaining": 0, "plan": plan.value, "upgrade_required": True}
        return True, {"max": max_ai, "used": usage.ai_requests_today, "remaining": max_ai - usage.ai_requests_today, "plan": plan.value}

    @staticmethod
    async def check_court_practice_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_daily_if_needed(usage)
        max_limit = limits['court_practice_per_day']
        if max_limit == -1: return True, {"max": -1, "used": usage.court_practice_today, "remaining": -1}
        if usage.court_practice_today >= max_limit:
            return False, {"max": max_limit, "used": usage.court_practice_today, "remaining": 0, "plan": plan.value, "upgrade_required": True}
        return True, {"max": max_limit, "used": usage.court_practice_today, "remaining": max_limit - usage.court_practice_today, "plan": plan.value}

    @staticmethod
    async def check_law_monitoring_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_daily_if_needed(usage)
        max_limit = limits['law_monitoring_per_day']
        if max_limit == -1: return True, {"max": -1, "used": usage.law_monitoring_today, "remaining": -1}
        if usage.law_monitoring_today >= max_limit:
            return False, {"max": max_limit, "used": usage.law_monitoring_today, "remaining": 0, "plan": plan.value, "upgrade_required": True}
        return True, {"max": max_limit, "used": usage.law_monitoring_today, "remaining": max_limit - usage.law_monitoring_today, "plan": plan.value}

    @staticmethod
    async def increment_documents(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        usage.documents_generated += 1
        await db.commit()

    @staticmethod
    async def increment_contracts(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        usage.contracts_reviewed += 1
        await db.commit()

    @staticmethod
    async def increment_ai_request(user_id: str, db: AsyncSession):
        """Увеличить счетчик AI запросов."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        usage.ai_requests_today += 1
        await db.commit()

    @staticmethod
    async def increment_court_practice(user_id: str, db: AsyncSession):
        """Увеличить счетчик судебной практики."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        usage.court_practice_today += 1
        await db.commit()

    @staticmethod
    async def increment_law_monitoring(user_id: str, db: AsyncSession):
        """Увеличить счетчик мониторинга законодательства."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        usage.law_monitoring_today += 1
        await db.commit()

    @staticmethod
    async def get_usage_status(user_id: str, db: AsyncSession) -> dict:
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)
        await LimitService._reset_monthly_if_needed(usage)
        await LimitService._reset_daily_if_needed(usage)

        return {
            "plan": plan.value,
            "plan_name": {
                "free": "Бесплатный", 
                "pro": "Pro", 
                "business": "Бизнес",
                "enterprise": "Корпоративный"
            }.get(plan.value, "Бесплатный"),
            "documents": {
                "used": usage.documents_generated,
                "max": limits['documents_per_month'],
                "remaining": max(0, limits['documents_per_month'] - usage.documents_generated) if limits['documents_per_month'] != -1 else -1,
            },
            "contracts": {
                "used": usage.contracts_reviewed,
                "max": limits['contracts_per_month'],
                "remaining": max(0, limits['contracts_per_month'] - usage.contracts_reviewed) if limits['contracts_per_month'] != -1 else -1,
            },
            "ai_requests": {
                "used": usage.ai_requests_today,
                "max": limits['ai_requests_per_day'],
                "remaining": max(0, limits['ai_requests_per_day'] - usage.ai_requests_today) if limits['ai_requests_per_day'] != -1 else -1,
            }
        }


limit_service = LimitService()
