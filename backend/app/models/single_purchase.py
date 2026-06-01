from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
import uuid

from app.database import Base

class SinglePurchase(Base):
    __tablename__ = "single_purchases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default="RUB")
    status = Column(String(20), nullable=False, default="pending", index=True)
    payment_method = Column(String(50))
    transaction_id = Column(String(255))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    completed_at = Column(DateTime)

    def __repr__(self):
        return f"<SinglePurchase {self.id} - {self.status}>"
