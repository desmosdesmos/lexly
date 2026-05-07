"""Модель кода активации подписки."""
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Boolean, Integer, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class ActivationCode(Base):
    __tablename__ = "activation_codes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), unique=True, nullable=False, index=True)
    plan_id = Column(String(20), nullable=False)  # basic, pro, enterprise
    months = Column(Integer, nullable=False, default=1)
    is_used = Column(Boolean, nullable=False, default=False)
    used_by_user_id = Column(String(36), ForeignKey("users.id"))
    used_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    def __repr__(self):
        return f"<ActivationCode {self.code} - {self.plan_id}>"
