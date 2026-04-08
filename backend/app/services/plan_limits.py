"""Новая тарифная модель Lexly."""
import enum


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"


# Лимиты для каждого тарифа
PLAN_LIMITS = {
    SubscriptionPlan.FREE: {
        "documents_per_month": 2,
        "contracts_per_month": 1,
        "ai_requests_per_day": 3,
        "court_practice_per_day": 2,
        "law_monitoring_per_day": 2,
        "tokens_per_month": 50_000,       # Soft limit
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 90,
    },
    SubscriptionPlan.PRO: {
        "documents_per_month": 50,
        "contracts_per_month": 15,
        "ai_requests_per_day": -1,         # Безлимит (soft limit по токенам)
        "court_practice_per_day": -1,
        "law_monitoring_per_day": -1,
        "tokens_per_month": 300_000,       # Soft limit
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 365,
    },
    SubscriptionPlan.BUSINESS: {
        "documents_per_month": -1,          # Безлимит с fair use
        "contracts_per_month": -1,
        "ai_requests_per_day": -1,
        "court_practice_per_day": -1,
        "law_monitoring_per_day": -1,
        "tokens_per_month": 2_000_000,     # Fair use limit
        "has_api_access": True,
        "has_priority": True,
        "data_retention_days": -1,          # Бессрочно
    },
}


def get_plan_limit(plan: SubscriptionPlan) -> dict:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS[SubscriptionPlan.FREE])


def get_plan_name_display(plan: SubscriptionPlan) -> str:
    names = {
        SubscriptionPlan.FREE: "Бесплатный",
        SubscriptionPlan.PRO: "Pro",
        SubscriptionPlan.BUSINESS: "Бизнес",
    }
    return names.get(plan, "Бесплатный")
