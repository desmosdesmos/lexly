from pydantic import BaseModel
from datetime import date


class UsageLimitItem(BaseModel):
    max: int
    used: int
    remaining: int
    reset_date: date


class UsageResponse(BaseModel):
    plan: str
    limits: dict[str, UsageLimitItem]

