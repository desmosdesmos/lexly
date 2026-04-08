from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
import logging
import os
import uuid
import json
from pathlib import Path

from app.database import get_db
from app.models.user import User
from app.models.contract_review import ContractReview
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.limit_service import limit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/contracts", tags=["Договоры"])

# Директория для загрузки файлов
UPLOAD_DIR = Path("./uploads/contracts")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ


async def extract_text_from_file(file_path: Path) -> str:
    """Извлечение текста из файла."""
    ext = file_path.suffix.lower()
    
    if ext == ".txt":
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    
    elif ext == ".pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(str(file_path))
            text = ""
            for page in reader.pages:
                text += page.extract_text() or ""
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка извлечения текста из PDF: {str(e)}",
            )
    
    elif ext in [".doc", ".docx"]:
        try:
            from docx import Document as DocxDocument
            doc = DocxDocument(str(file_path))
            return "\n".join([p.text for p in doc.paragraphs])
        except Exception as e:
            logger.error(f"Error extracting text from DOCX: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка извлечения текста из документа: {str(e)}",
            )
    
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неподдерживаемый формат файла: {ext}",
        )


@router.post(
    "/review",
    summary="Проверка договора через AI",
    status_code=status.HTTP_200_OK,
)
async def review_contract(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Загрузить договор для AI-анализа на риски.
    
    Поддерживаемые форматы: PDF, DOC, DOCX, TXT
    Максимальный размер: 10 МБ
    """
    # Проверка размера файла
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Размер файла не должен превышать 10 МБ",
        )
    
    # Проверка формата
    file_ext = Path(file.filename).suffix.lower() if file.filename else ""
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неподдерживаемый формат. Допускаются: {', '.join(ALLOWED_EXTENSIONS)}",
        )
    
    # Проверка лимитов
    can_use, limit_info = await limit_service.check_contract_limit(
        user_id=current_user.id,
        db=db,
    )

    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "contracts",
                "message": f"Вы достигли лимита проверки договоров ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro.",
                "limit_info": limit_info,
            },
        )
    
    # Сохранение файла
    file_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{file_id}{file_ext}"
    
    with open(file_path, "wb") as f:
        f.write(file_content)
    
    try:
        # Извлечение текста
        extracted_text = await extract_text_from_file(file_path)
        
        if not extracted_text or len(extracted_text.strip()) < 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось извлечь достаточно текста из документа",
            )
        
        # AI анализ
        analysis_result = await ai_service.review_contract(extracted_text)
        
        # Определение уровня риска
        risks = analysis_result.get("risks", [])
        if not risks:
            risk_level = "low"
        else:
            severities = [r.get("severity", "low") for r in risks]
            if "critical" in severities:
                risk_level = "critical"
            elif "high" in severities:
                risk_level = "high"
            elif "medium" in severities:
                risk_level = "medium"
            else:
                risk_level = "low"
        
        # Создание записи в БД
        review = ContractReview(
            user_id=current_user.id,
            original_file_name=file.filename or "unknown",
            file_path=str(file_path),
            extracted_text=extracted_text[:10000],  # Ограничиваем длину
            analysis_result=json.dumps(analysis_result, ensure_ascii=False),  # Конвертируем dict в JSON строку
            risks=json.dumps(risks, ensure_ascii=False),  # Конвертируем list в JSON строку
            recommendations=json.dumps(analysis_result.get("recommendations", []), ensure_ascii=False),  # Конвертируем list в JSON строку
            risk_level=risk_level,
        )
        
        db.add(review)
        await db.commit()
        await db.refresh(review)

        # Инкремент использования
        await limit_service.increment_contracts(current_user.id, db)
        
        logger.info(f"Contract reviewed: {review.id} for user {current_user.id}")
        
        return {
            "id": str(review.id),
            "original_file_name": review.original_file_name,
            "status": "completed",
            "risk_level": review.risk_level,
            "analysis": json.loads(review.analysis_result) if isinstance(review.analysis_result, str) else review.analysis_result,
            "created_at": str(review.created_at),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Contract review error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка анализа договора: {str(e)}",
        )


@router.get(
    "",
    summary="Список проверок договоров",
)
async def list_reviews(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить список всех проверок пользователя."""
    offset = (page - 1) * limit
    
    # Общее количество
    count_result = await db.execute(
        select(func.count()).select_from(ContractReview).where(ContractReview.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Список проверок
    reviews_result = await db.execute(
        select(ContractReview)
        .where(ContractReview.user_id == current_user.id)
        .order_by(ContractReview.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    reviews = reviews_result.scalars().all()
    
    items = [
        {
            "id": str(review.id),
            "original_file_name": review.original_file_name,
            "status": "completed",
            "risk_level": review.risk_level,
            "created_at": str(review.created_at),
        }
        for review in reviews
    ]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get(
    "/{review_id}",
    summary="Получить результат проверки",
)
async def get_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить конкретный результат проверки."""
    result = await db.execute(
        select(ContractReview).where(
            ContractReview.id == review_id,
            ContractReview.user_id == current_user.id,
        )
    )
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проверка не найдена",
        )
    
    return {
        "id": str(review.id),
        "original_file_name": review.original_file_name,
        "status": "completed",
        "risk_level": review.risk_level,
        "analysis": json.loads(review.analysis_result) if isinstance(review.analysis_result, str) else review.analysis_result,
        "created_at": str(review.created_at),
        "completed_at": str(review.completed_at) if review.completed_at else None,
    }


@router.delete(
    "/{review_id}",
    summary="Удалить проверку",
    status_code=status.HTTP_200_OK,
)
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Удалить результат проверки."""
    result = await db.execute(
        select(ContractReview).where(
            ContractReview.id == review_id,
            ContractReview.user_id == current_user.id,
        )
    )
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Проверка не найдена",
        )
    
    # Удаление файла
    if review.file_path and os.path.exists(review.file_path):
        os.remove(review.file_path)
    
    await db.delete(review)
    await db.commit()
    
    return {"message": "Проверка успешно удалена"}
