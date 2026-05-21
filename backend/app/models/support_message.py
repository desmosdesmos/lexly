from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    text = Column(Text, nullable=True)  # Allow null if only image is sent
    image_url = Column(String(500), nullable=True)
    sender = Column(String(20), nullable=False)  # 'user' or 'support'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    def __repr__(self):
        return f"<SupportMessage {self.sender}: {self.text[:20]}...>"
