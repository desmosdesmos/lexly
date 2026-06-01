import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Enum, Integer, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class DocumentType(str, enum.Enum):
    CLAIM = "claim"
    COMPLAINT = "complaint"
    DEMAND = "demand"
    CONTRACT_SALE = "contract_sale"
    CONTRACT_EMPLOYMENT = "contract_employment"
    POWER_OF_ATTORNEY = "power_of_attorney"
    WB_CLAIM = "wb_claim"
    ZOZP_CLAIM = "zozp_claim"
    AUTO_FINE = "auto_fine"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(String(20), nullable=False)
    input_data = Column(Text, nullable=False)  # JSON as text for SQLite
    generated_content = Column(Text)
    status = Column(String(20), nullable=False, default=DocumentStatus.PENDING.value)
    error_message = Column(Text)
    ai_tokens_used = Column(Integer, nullable=False, default=0)
    n8n_workflow_id = Column(String(255))
    n8n_execution_id = Column(String(255))
    created_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)
    completed_at = Column(DateTime)

    def __repr__(self):
        return f"<Document {self.id} - {self.document_type}>"

