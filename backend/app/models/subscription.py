import enum
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Boolean, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class SubscriptionPlan(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    CANCELLED = "cancelled"
    PENDING = "pending"


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_type = Column(String(20), nullable=False, default=SubscriptionPlan.FREE.value)
    status = Column(String(20), nullable=False, default=SubscriptionStatus.ACTIVE.value)
    start_date = Column(Date, nullable=False, default=date.today)
    end_date = Column(Date)
    auto_renew = Column(Boolean, nullable=False, default=False)
    payment_method = Column(String(50))
    external_subscription_id = Column(String(255))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Subscription {self.id} - {self.plan_type}>"

