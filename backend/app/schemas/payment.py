from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from decimal import Decimal
import enum


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    BUSINESS = "business"


class PaymentResponse(BaseModel):
    id: str
    amount: Decimal
    currency: str
    status: PaymentStatus
    payment_method: str
    plan_type: Optional[SubscriptionPlan] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PlanFeatures(BaseModel):
    documents_per_month: int
    contracts_per_month: int
    priority_support: bool
    api_access: bool
    team_members: Optional[int] = None
    custom_integrations: Optional[bool] = None


class PaymentPlan(BaseModel):
    id: SubscriptionPlan
    name: str
    price: Decimal
    currency: str
    billing_period: Optional[str] = None
    features: PlanFeatures


class SubscribeRequest(BaseModel):
    plan_id: SubscriptionPlan
    payment_method: str = "card"


class PaymentHistoryItem(BaseModel):
    id: str
    plan_id: Optional[SubscriptionPlan] = None
    amount: Decimal
    currency: str
    status: PaymentStatus
    payment_method: str
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentHistoryResponse(BaseModel):
    items: List[PaymentHistoryItem]
    total: int
    page: int
    limit: int

