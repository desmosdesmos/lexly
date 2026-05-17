"""Тарифная модель Lexly."""
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
        "tokens_per_month": 10_000,
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 30,
    },
    SubscriptionPlan.PRO: {
        "documents_per_month": 30,
        "contracts_per_month": 15,
        "ai_requests_per_day": 50,
        "court_practice_per_day": 20,
        "law_monitoring_per_day": 20,
        "tokens_per_month": 100_000,
        "has_api_access": False,
        "has_priority": True,
        "data_retention_days": 365,
    },
    SubscriptionPlan.BUSINESS: {
        "documents_per_month": -1,
        "contracts_per_month": -1,
        "ai_requests_per_day": -1,
        "court_practice_per_day": -1,
        "law_monitoring_per_day": -1,
        "tokens_per_month": -1,
        "has_api_access": True,
        "has_priority": True,
        "data_retention_days": -1,
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
