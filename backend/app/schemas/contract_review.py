from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import enum


class RiskSeverity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskType(str, enum.Enum):
    FINANCIAL = "financial"
    LEGAL = "legal"
    OPERATIONAL = "operational"
    REPUTATIONAL = "reputational"


class RiskItem(BaseModel):
    id: int
    type: RiskType
    severity: RiskSeverity
    clause: str
    text: str
    explanation: str
    recommendation: str


class ContractAnalysis(BaseModel):
    summary: str
    risk_level: RiskSeverity
    risks: List[RiskItem]
    recommendations: List[str]


class ContractReviewResponse(BaseModel):
    id: str
    original_file_name: str
    status: str
    analysis: Optional[ContractAnalysis] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContractReviewListItem(BaseModel):
    id: str
    original_file_name: str
    status: str
    risk_level: Optional[RiskSeverity] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ContractReviewListResponse(BaseModel):
    items: List[ContractReviewListItem]
    total: int
    page: int
    limit: int

