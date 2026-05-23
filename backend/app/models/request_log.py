from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, JSON
from sqlalchemy.sql import func
import uuid

from app.database import Base


class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), index=True)
    endpoint = Column(String(500), nullable=False)
    http_method = Column(String(10), nullable=False)
    request_data = Column(String)  # JSON as string for SQLite compatibility
    response_status = Column(Integer)
    response_data = Column(String)  # JSON as string for SQLite compatibility
    ai_tokens_used = Column(Integer, nullable=False, default=0)
    ip_address = Column(String(45))  # Supports IPv6
    user_agent = Column(String(500))
    execution_time_ms = Column(Integer)
    created_at = Column(DateTime, nullable=False, server_default=func.now(), index=True)

    def __repr__(self):
        return f"<RequestLog {self.id} - {self.endpoint}>"

