"""Тарифная модель Lexly."""
import enum


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    BUSINESS = "business"
    ENTERPRISE = "enterprise"


# ╨Ы╨╕╨╝╨╕╤В╤Л ╨┤╨╗╤П ╨║╨░╨╢╨┤╨╛╨│╨╛ ╤В╨░╤А╨╕╤Д╨░ (╤Н╨║╨╛╨╜╨╛╨╝╨╕╤З╨╜╤Л╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В)
PLAN_LIMITS = {
    SubscriptionPlan.FREE: {
        "documents_per_month": 2,
        "contracts_per_month": 1,
        "ai_requests_per_day": 3,
        "court_practice_per_day": 2,
        "law_monitoring_per_day": 2,
        "tokens_per_month": 10_000,       # Soft limit
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 30,
    },
    SubscriptionPlan.BASIC: {
        "documents_per_month": 15,
        "contracts_per_month": 10,
        "ai_requests_per_day": 20,
        "court_practice_per_day": 10,
        "law_monitoring_per_day": 10,
        "tokens_per_month": 60_000,       # Soft limit
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 90,
    },
    SubscriptionPlan.PRO: {
        "documents_per_month": 50,
        "contracts_per_month": 25,
        "ai_requests_per_day": 100,
        "court_practice_per_day": 50,
        "law_monitoring_per_day": 50,
        "tokens_per_month": 200_000,      # Soft limit
        "has_api_access": False,
        "has_priority": False,
        "data_retention_days": 365,
    },
    SubscriptionPlan.BUSINESS: {
        "documents_per_month": 200,
        "contracts_per_month": 100,
        "ai_requests_per_day": 500,
        "court_practice_per_day": 200,
        "law_monitoring_per_day": 200,
        "tokens_per_month": 1_000_000,    # Fair use limit
        "has_api_access": True,
        "has_priority": True,
        "data_retention_days": -1,        # ╨С╨╡╤Б╤Б╤А╨╛╤З╨╜╨╛
    },
    SubscriptionPlan.ENTERPRISE: {
        "documents_per_month": 999999,
        "contracts_per_month": 999999,
        "ai_requests_per_day": 999999,
        "court_practice_per_day": 999999,
        "law_monitoring_per_day": 999999,
        "tokens_per_month": 999999999,
        "has_api_access": True,
        "has_priority": True,
        "data_retention_days": -1,
    },
}


def get_plan_limit(plan: SubscriptionPlan) -> dict:
    return PLAN_LIMITS.get(plan, PLAN_LIMITS[SubscriptionPlan.FREE])


def get_plan_name_display(plan: SubscriptionPlan) -> str:
    names = {
        SubscriptionPlan.FREE: "╨С╨╡╤Б╨┐╨╗╨░╤В╨╜╤Л╨╣",
        SubscriptionPlan.BASIC: "╨С╨░╨╖╨╛╨▓╤Л╨╣",
        SubscriptionPlan.PRO: "Pro",
        SubscriptionPlan.BUSINESS: "╨С╨╕╨╖╨╜╨╡╤Б",
        SubscriptionPlan.ENTERPRISE: "VIP",
    }
    return names.get(plan, "╨С╨╡╤Б╨┐╨╗╨░╤В╨╜╤Л╨╣")
