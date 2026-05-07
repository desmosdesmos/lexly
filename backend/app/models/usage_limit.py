import enum
from datetime import datetime, date
from sqlalchemy import Column, String, DateTime, Date, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
import uuid

from app.database import Base
from app.models.subscription import SubscriptionPlan


class UsageLimit(Base):
    __tablename__ = "usage_limits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, unique=True)
    plan_type = Column(String(20), nullable=False, default=SubscriptionPlan.FREE.value)
    documents_generated = Column(Integer, nullable=False, default=0)
    contracts_reviewed = Column(Integer, nullable=False, default=0)
    max_documents = Column(Integer, nullable=False, default=5)
    max_contracts = Column(Integer, nullable=False, default=3)
    reset_date = Column(Date, nullable=False, default=date.today)
    
    # Daily AI limits (added migration 2026-04-11)
    ai_requests_today = Column(Integer, nullable=False, default=0)
    court_practice_today = Column(Integer, nullable=False, default=0)
    law_monitoring_today = Column(Integer, nullable=False, default=0)
    last_ai_request_date = Column(String(10))  # YYYY-MM-DD
    last_court_practice_date = Column(String(10))
    last_law_monitoring_date = Column(String(10))
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<UsageLimit {self.id} - {self.plan_type}>"

    def can_generate_document(self) -> bool:
        """Проверить, можно ли сгенерировать документ."""
        return self.documents_generated < self.max_documents

    def can_review_contract(self) -> bool:
        """Проверить, можно ли проверить договор."""
        return self.contracts_reviewed < self.max_contracts

    def remaining_documents(self) -> int:
        """Оставшееся количество документов."""
        return max(0, self.max_documents - self.documents_generated)

    def remaining_contracts(self) -> int:
        """Оставшееся количество проверок договоров."""
        return max(0, self.max_contracts - self.contracts_reviewed)

