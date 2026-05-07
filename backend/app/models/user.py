import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, Text
from sqlalchemy.sql import func
import uuid

from app.database import Base


class UserType(str, enum.Enum):
    INDIVIDUAL = "individual"
    LEGAL = "legal"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(500), nullable=False)
    user_type = Column(String(20), nullable=False, default=UserType.INDIVIDUAL.value)
    phone = Column(String(20))
    company_name = Column(String(500))
    company_inn = Column(String(12))
    is_active = Column(Boolean, nullable=False, default=True)
    email_verified = Column(Boolean, nullable=False, default=False)
    email_verification_token = Column(String(255))
    email_verification_code = Column(String(6))
    email_verification_code_expires = Column(DateTime)
    password_reset_token = Column(String(255))
    password_reset_expires_at = Column(DateTime)
    last_login_at = Column(DateTime)
    
    # Legal compliance fields
    pdp_consent = Column(Boolean, nullable=False, default=False)  # Personal Data Processing consent
    pdp_consent_date = Column(DateTime)
    marketing_consent = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<User {self.email}>"

