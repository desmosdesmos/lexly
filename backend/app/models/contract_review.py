import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, BigInteger, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class ContractReview(Base):
    __tablename__ = "contract_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    original_file_name = Column(String(500), nullable=False)
    file_path = Column(String(1000), nullable=False)
    extracted_text = Column(Text)
    analysis_result = Column(Text)  # JSON as text for SQLite
    risk_level = Column(String(20), default="low")
    risks = Column(Text)  # JSON as text
    recommendations = Column(Text)  # JSON as text
    ai_tokens_used = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending")
    error_message = Column(Text)
    n8n_workflow_id = Column(String(255))
    n8n_execution_id = Column(String(255))
    created_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)
    completed_at = Column(DateTime)

    def __repr__(self):
        return f"<ContractReview {self.id} - {self.original_file_name}>"

