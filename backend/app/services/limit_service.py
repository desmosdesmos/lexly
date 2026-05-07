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
                plan_type=SubscriptionPlan.FREE,
                max_documents=2,
                max_contracts=1,
                documents_generated=0,
                contracts_reviewed=0,
                tokens_used_this_month=0,
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
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            return SubscriptionPlan.FREE

        # Проверить subscription_type в user model
        sub_type = getattr(user, 'subscription_type', None)
        if sub_type in ('free', 'pro', 'business'):
            return SubscriptionPlan(sub_type)

        # Fallback: проверить старую подписку
        from app.models.subscription import Subscription
        result = await db.execute(
            select(Subscription).where(Subscription.user_id == user_id)
        )
        sub = result.scalar_one_or_none()
        if sub and sub.plan_type == 'pro':
            return SubscriptionPlan.PRO
        if sub and sub.plan_type == 'enterprise':
            return SubscriptionPlan.BUSINESS

        return SubscriptionPlan.FREE

    @staticmethod
    async def _reset_daily_if_needed(usage: UsageLimit) -> bool:
        """Сбросить daily счётчики если наступил новый день."""
        today = date.today().isoformat()
        reset = False

        # Проверка для старых записей (без last_ai_request_date)
        last_date = getattr(usage, 'last_ai_request_date', None)
        if last_date and last_date != today:
            usage.ai_requests_today = 0
            usage.court_practice_today = 0
            usage.law_monitoring_today = 0
            reset = True

        # Обновляем даты
        if hasattr(usage, 'last_ai_request_date'):
            usage.last_ai_request_date = today
        if hasattr(usage, 'last_court_practice_date'):
            usage.last_court_practice_date = today
        if hasattr(usage, 'last_law_monitoring_date'):
            usage.last_law_monitoring_date = today
        return reset

    @staticmethod
    async def _reset_monthly_if_needed(usage: UsageLimit) -> bool:
        """Сбросить monthly счётчики если наступил новый месяц."""
        current_month = date.today().strftime('%Y-%m')
        reset = False

        # Проверяем по reset_date
        if usage.reset_date:
            reset_month = usage.reset_date.strftime('%Y-%m') if hasattr(usage.reset_date, 'strftime') else str(usage.reset_date)[:7]
            if reset_month != current_month:
                usage.documents_generated = 0
                usage.contracts_reviewed = 0
                usage.tokens_used_this_month = 0
                usage.reset_date = date.today()
                reset = True
        else:
            usage.reset_date = date.today()
            reset = True

        return reset

    # ---- Проверки лимитов ----

    @staticmethod
    async def check_document_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """
        Проверить лимит документов.
        Returns: (можно_использовать, инфо_о_лимите)
        """
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_monthly_if_needed(usage)

        max_docs = limits['documents_per_month']
        if max_docs == -1:
            return True, {"max": -1, "used": usage.documents_generated, "remaining": -1}

        if usage.documents_generated >= max_docs:
            return False, {
                "max": max_docs,
                "used": usage.documents_generated,
                "remaining": 0,
                "plan": plan.value,
                "upgrade_required": True,
            }

        return True, {
            "max": max_docs,
            "used": usage.documents_generated,
            "remaining": max_docs - usage.documents_generated,
            "plan": plan.value,
        }

    @staticmethod
    async def check_contract_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """Проверить лимит проверок договоров."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_monthly_if_needed(usage)

        max_contracts = limits['contracts_per_month']
        if max_contracts == -1:
            return True, {"max": -1, "used": usage.contracts_reviewed, "remaining": -1}

        if usage.contracts_reviewed >= max_contracts:
            return False, {
                "max": max_contracts,
                "used": usage.contracts_reviewed,
                "remaining": 0,
                "plan": plan.value,
                "upgrade_required": True,
            }

        return True, {
            "max": max_contracts,
            "used": usage.contracts_reviewed,
            "remaining": max_contracts - usage.contracts_reviewed,
            "plan": plan.value,
        }

    @staticmethod
    async def check_ai_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """Проверить дневной лимит AI-запросов."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_daily_if_needed(usage)

        max_ai = limits['ai_requests_per_day']
        if max_ai == -1:
            # Soft limit по токенам
            return True, {"max": -1, "used": usage.ai_requests_today, "remaining": -1}

        if usage.ai_requests_today >= max_ai:
            return False, {
                "max": max_ai,
                "used": usage.ai_requests_today,
                "remaining": 0,
                "plan": plan.value,
                "upgrade_required": True,
            }

        return True, {
            "max": max_ai,
            "used": usage.ai_requests_today,
            "remaining": max_ai - usage.ai_requests_today,
            "plan": plan.value,
        }

    @staticmethod
    async def check_court_practice_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """Проверить дневной лимит судебной практики."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_daily_if_needed(usage)

        max_cp = limits['court_practice_per_day']
        if max_cp == -1:
            return True, {"max": -1, "used": usage.court_practice_today, "remaining": -1}

        if usage.court_practice_today >= max_cp:
            return False, {
                "max": max_cp,
                "used": usage.court_practice_today,
                "remaining": 0,
                "plan": plan.value,
                "upgrade_required": True,
            }

        return True, {
            "max": max_cp,
            "used": usage.court_practice_today,
            "remaining": max_cp - usage.court_practice_today,
            "plan": plan.value,
        }

    @staticmethod
    async def check_law_monitoring_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """Проверить дневной лимит мониторинга законов."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_daily_if_needed(usage)

        max_lm = limits['law_monitoring_per_day']
        if max_lm == -1:
            return True, {"max": -1, "used": usage.law_monitoring_today, "remaining": -1}

        if usage.law_monitoring_today >= max_lm:
            return False, {
                "max": max_lm,
                "used": usage.law_monitoring_today,
                "remaining": 0,
                "plan": plan.value,
                "upgrade_required": True,
            }

        return True, {
            "max": max_lm,
            "used": usage.law_monitoring_today,
            "remaining": max_lm - usage.law_monitoring_today,
            "plan": plan.value,
        }

    @staticmethod
    async def check_token_limit(user_id: str, db: AsyncSession) -> tuple[bool, dict]:
        """Проверить soft limit токенов."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_monthly_if_needed(usage)

        max_tokens = limits['tokens_per_month']
        if usage.tokens_used_this_month >= max_tokens:
            return False, {
                "max": max_tokens,
                "used": usage.tokens_used_this_month,
                "remaining": 0,
                "soft_limit_reached": True,
            }

        return True, {
            "max": max_tokens,
            "used": usage.tokens_used_this_month,
            "remaining": max_tokens - usage.tokens_used_this_month,
        }

    # ---- Инкременты ----

    @staticmethod
    async def increment_documents(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_monthly_if_needed(usage)
        usage.documents_generated += 1
        await db.commit()

    @staticmethod
    async def increment_contracts(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_monthly_if_needed(usage)
        usage.contracts_reviewed += 1
        await db.commit()

    @staticmethod
    async def increment_ai_request(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_daily_if_needed(usage)
        usage.ai_requests_today += 1
        await db.commit()

    @staticmethod
    async def increment_court_practice(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_daily_if_needed(usage)
        usage.court_practice_today += 1
        await db.commit()

    @staticmethod
    async def increment_law_monitoring(user_id: str, db: AsyncSession):
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_daily_if_needed(usage)
        usage.law_monitoring_today += 1
        await db.commit()

    @staticmethod
    async def add_token_usage(user_id: str, db: AsyncSession, tokens: int, request_type: str):
        """Добавить учёт токенов."""
        import uuid
        usage = await LimitService._get_or_create_limits(user_id, db)
        await LimitService._reset_monthly_if_needed(usage)
        usage.tokens_used_this_month += tokens

        # Запись в token_usage
        from app.database import get_db_session
        try:
            await db.execute(
                'INSERT INTO token_usage (id, user_id, request_type, tokens_used) VALUES (?, ?, ?, ?)',
                (str(uuid.uuid4()), user_id, request_type, tokens)
            )
        except Exception:
            pass  # token_usage может не существовать в старых БД

        await db.commit()

    # ---- Получение полного статуса ----

    @staticmethod
    async def get_usage_status(user_id: str, db: AsyncSession) -> dict:
        """Полный статус использования для профиля."""
        usage = await LimitService._get_or_create_limits(user_id, db)
        plan = await LimitService._get_user_plan(user_id, db)
        limits = get_plan_limit(plan)

        await LimitService._reset_monthly_if_needed(usage)
        await LimitService._reset_daily_if_needed(usage)

        return {
            "plan": plan.value,
            "plan_name": {
                "free": "Бесплатный", 
                "basic": "Базовый", 
                "pro": "Pro", 
                "business": "Бизнес"
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
            },
            "court_practice": {
                "used": usage.court_practice_today,
                "max": limits['court_practice_per_day'],
            },
            "law_monitoring": {
                "used": usage.law_monitoring_today,
                "max": limits['law_monitoring_per_day'],
            },
            "tokens": {
                "used": usage.tokens_used_this_month,
                "max": limits['tokens_per_month'],
            },
        }


limit_service = LimitService()
