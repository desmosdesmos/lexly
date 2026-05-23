from pydantic import BaseModel, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import enum


class DocumentType(str, enum.Enum):
    CLAIM = "claim"
    COMPLAINT = "complaint"
    DEMAND = "demand"
    CONTRACT_SALE = "contract_sale"
    CONTRACT_EMPLOYMENT = "contract_employment"
    POWER_OF_ATTORNEY = "power_of_attorney"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DocumentGenerateRequest(BaseModel):
    """Запрос на генерацию документа."""
    document_type: DocumentType
    data: Dict[str, Any]


class DocumentResponse(BaseModel):
    """Ответ с документом."""
    id: str
    document_type: str
    status: str
    generated_content: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None


class DocumentListItem(BaseModel):
    """Элемент списка документов."""
    id: str
    document_type: str
    status: str
    created_at: str


class DocumentListResponse(BaseModel):
    """Ответ со списком документов."""
    items: List[DocumentListItem]
    total: int
    page: int
    limit: int
