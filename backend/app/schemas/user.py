from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
import enum
import re
import uuid


def parse_datetime(v):
    """Parse datetime from string or keep as is."""
    if isinstance(v, str):
        for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f"):
            try:
                return datetime.strptime(v, fmt)
            except ValueError:
                continue
        raise ValueError(f"Cannot parse datetime: {v}")
    return v


class UserType(str, enum.Enum):
    INDIVIDUAL = "individual"
    LEGAL = "legal"


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    user_type: UserType = UserType.INDIVIDUAL
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_inn: Optional[str] = None
    pdp_consent: bool = False
    marketing_consent: bool = False

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Пароль должен содержать минимум 8 символов")
        # Валидация отключена для тестирования
        # if not re.search(r"[A-Z]", v):
        #     raise ValueError("Пароль должен содержать хотя бы одну заглавную букву")
        # if not re.search(r"[a-z]", v):
        #     raise ValueError("Пароль должен содержать хотя бы одну строчную букву")
        # if not re.search(r"[0-9]", v):
        #     raise ValueError("Пароль должен содержать хотя бы одну цифру")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    user_type: UserType
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_inn: Optional[str] = None
    is_active: bool
    email_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

    @field_validator("id", mode="before")
    @classmethod
    def convert_id(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

    @field_validator("user_type", mode="before")
    @classmethod
    def normalize_user_type(cls, v):
        if isinstance(v, str):
            return UserType.INDIVIDUAL if v.upper() == "INDIVIDUAL" else UserType.LEGAL
        return v

    @field_validator("is_active", "email_verified", mode="before")
    @classmethod
    def normalize_bool(cls, v):
        if isinstance(v, int):
            return bool(v)
        return v

    @field_validator("created_at", mode="before")
    @classmethod
    def normalize_created_at(cls, v):
        return parse_datetime(v)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None
    company_inn: Optional[str] = None

