import enum
from datetime import datetime
from decimal import Decimal
from sqlalchemy import Column, String, DateTime, Enum, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
import uuid

from app.database import Base
from app.models.subscription import SubscriptionPlan


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="RUB")
    status = Column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING)
    payment_method = Column(String(50), nullable=False)
    plan_type = Column(Enum(SubscriptionPlan))
    transaction_id = Column(String(255))
    external_payment_id = Column(String(255))
    payment_url = Column(String(1000))
    error_message = Column(String(1000))
    payment_metadata = Column(JSON)
    created_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)
    completed_at = Column(DateTime)

    def __repr__(self):
        return f"<Payment {self.id} - {self.amount} {self.currency}>"

