from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
import logging
import json
import io

from app.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentType, DocumentStatus
from app.schemas.document import (
    DocumentGenerateRequest,
    DocumentResponse,
    DocumentListItem,
    DocumentListResponse,
)
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.limit_service import limit_service
from app.services.docx_generator import docx_generator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Документы"])


@router.post(
    "/generate",
    response_model=DocumentResponse,
    summary="Генерация документа через AI",
    status_code=status.HTTP_201_CREATED,
)
async def generate_document(
    request: DocumentGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Сгенерировать юридический документ через AI.
    
    Поддерживаемые типы:
    - claim - исковое заявление
    - complaint - жалоба
    - demand - досудебная претензия
    """
    # Проверка лимитов
    can_use, limit_info = await limit_service.check_document_limit(
        user_id=current_user.id,
        db=db,
    )

    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "documents",
                "message": f"Вы достигли лимита генерации документов ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro для разблокировки.",
                "limit_info": limit_info,
            },
        )
    
    try:
        # Подготовка данных для AI
        data = {
            "court_name": request.data.get("court_name", ""),
            "plaintiff_name": request.data.get("plaintiff", {}).get("name", ""),
            "plaintiff_inn": request.data.get("plaintiff", {}).get("inn", ""),
            "plaintiff_address": request.data.get("plaintiff", {}).get("address", ""),
            "defendant_name": request.data.get("defendant", {}).get("name", ""),
            "defendant_inn": request.data.get("defendant", {}).get("inn", ""),
            "defendant_address": request.data.get("defendant", {}).get("address", ""),
            "circumstances": request.data.get("circumstances", ""),
            "legal_basis": request.data.get("legal_basis", ""),
            "claims": request.data.get("claims", []),
            "authority_name": request.data.get("authority_name", ""),
            "applicant_name": request.data.get("applicant", {}).get("name", ""),
            "applicant_inn": request.data.get("applicant", {}).get("inn", ""),
            "applicant_address": request.data.get("applicant", {}).get("address", ""),
            "interested_party": request.data.get("interested_party", {}).get("name", ""),
            "appealed_action": request.data.get("appealed_action", ""),
            "grounds": request.data.get("grounds", ""),
            "demander_name": request.data.get("demander", {}).get("name", ""),
            "demander_inn": request.data.get("demander", {}).get("inn", ""),
            "demander_address": request.data.get("demander", {}).get("address", ""),
            "demander_from_name": request.data.get("demander_from", {}).get("name", ""),
            "demander_from_inn": request.data.get("demander_from", {}).get("inn", ""),
            "demander_from_address": request.data.get("demander_from", {}).get("address", ""),
            "demand_basis": request.data.get("demand_basis", ""),
            "demand_deadline": request.data.get("demand_deadline", "10 календарных дней"),
        }
        
        # Генерация через AI
        # Извлекаем строковое значение из Enum или оставляем как есть
        doc_type_str = request.document_type.value if hasattr(request.document_type, 'value') else str(request.document_type)
        
        generated_content = await ai_service.generate_document(
            document_type=doc_type_str,
            data=data,
        )

        # Создание записи в БД - конвертируем строку обратно в Enum если нужно
        try:
            # Если doc_type_str это строка, создаем Enum
            document_type_enum = DocumentType(doc_type_str)
        except ValueError:
            # Если не получилось, используем значение по умолчанию
            document_type_enum = DocumentType.CLAIM
        
        document = Document(
            user_id=current_user.id,
            document_type=document_type_enum,
            input_data=json.dumps(request.data, ensure_ascii=False),  # Конвертируем dict в JSON строку
            generated_content=generated_content,
            status=DocumentStatus.COMPLETED,
        )
        
        db.add(document)
        await db.commit()
        await db.refresh(document)

        # Инкремент использования
        await limit_service.increment_documents(current_user.id, db)
        
        logger.info(f"Document generated: {document.id} for user {current_user.id}")
        
        return DocumentResponse(
            id=str(document.id),
            document_type=document.document_type.value if hasattr(document.document_type, 'value') else str(document.document_type),
            status=document.status.value if hasattr(document.status, 'value') else str(document.status),
            generated_content=document.generated_content,
            created_at=str(document.created_at),
            completed_at=str(document.completed_at) if document.completed_at else None,
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        import traceback
        error_detail = f"Ошибка генерации документа: {str(e)}"
        tb = traceback.format_exc()
        logger.error(f"Document generation error: {error_detail}")
        logger.error(f"Full traceback: {tb}")
        # Временно выводим полный traceback в ответ для отладки
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"{error_detail}\n\nTraceback:\n{tb}",
        )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="Список документов пользователя",
)
async def list_documents(
    page: int = 1,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить список всех документов пользователя с пагинацией."""
    offset = (page - 1) * limit
    
    # Общее количество
    count_result = await db.execute(
        select(func.count()).select_from(Document).where(Document.user_id == current_user.id)
    )
    total = count_result.scalar() or 0
    
    # Список документов
    docs_result = await db.execute(
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    documents = docs_result.scalars().all()
    
    items = [
        DocumentListItem(
            id=str(doc.id),
            document_type=doc.document_type.value if hasattr(doc.document_type, 'value') else str(doc.document_type),
            status=doc.status.value if hasattr(doc.status, 'value') else str(doc.status),
            created_at=str(doc.created_at),
        )
        for doc in documents
    ]
    
    return DocumentListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Получить документ",
)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить конкретный документ по ID."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    
    return DocumentResponse(
        id=str(document.id),
        document_type=document.document_type.value if hasattr(document.document_type, 'value') else str(document.document_type),
        status=document.status.value if hasattr(document.status, 'value') else str(document.status),
        generated_content=document.generated_content,
        created_at=str(document.created_at),
        completed_at=str(document.completed_at) if document.completed_at else None,
    )


@router.delete(
    "/{document_id}",
    summary="Удалить документ",
    status_code=status.HTTP_200_OK,
)
async def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Удалить документ."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )
    
    await db.delete(document)
    await db.commit()

    return {"message": "Документ успешно удалён"}


@router.get(
    "/{document_id}/download",
    summary="Скачать документ в .docx",
)
async def download_document_docx(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Скачать сгенерированный документ в формате .docx."""
    result = await db.execute(
        select(Document).where(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
    )
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Документ не найден",
        )

    if not document.generated_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Документ не содержит сгенерированного содержимого",
        )

    # Парсим input_data для передачи в docx генератор
    try:
        input_data = json.loads(document.input_data) if document.input_data else {}
    except (json.JSONDecodeError, TypeError):
        input_data = {}

    # Генерируем .docx на основе содержимого
    doc_type = document.document_type.value if hasattr(document.document_type, 'value') else str(document.document_type)

    try:
        if 'claim' in doc_type:
            docx_bytes = docx_generator.generate_claim(input_data)
        elif 'complaint' in doc_type:
            docx_bytes = docx_generator.generate_complaint(input_data)
        elif 'demand' in doc_type:
            docx_bytes = docx_generator.generate_demand(input_data)
        else:
            docx_bytes = docx_generator.generate_claim(input_data)
    except Exception as e:
        logger.error(f"Docx generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка генерации .docx: {str(e)}",
        )

    # Имя файла
    type_names = {'claim': 'isk', 'complaint': 'zhaloba', 'demand': 'pretenziya'}
    filename = type_names.get(doc_type, 'document')
    safe_name = f"{filename}_{document.id[:8]}.docx"

    return StreamingResponse(
        io.BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{safe_name}"},
    )


# ---- AI-помощник для полей документов ----

class AISuggestRequest(BaseModel):
    mode: str = Field(..., description="Режим: 'improve' (улучшить текст) или 'generate' (сгенерировать)")
    text: Optional[str] = Field(None, description="Текст для улучшения (для mode=improve)")
    circumstances: Optional[str] = Field(None, description="Обстоятельства дела (для mode=generate)")
    context: Optional[str] = Field(None, description="Тип документа (claim, complaint, demand)")
    field: Optional[str] = Field(None, description="Какое поле улучшить/сгенерировать: 'legal_basis', 'claims', 'circumstances'")


@router.post(
    "/ai-suggest",
    summary="AI-помощник: улучшение или генерация текста",
)
async def ai_suggest(
    request: AISuggestRequest,
    current_user: User = Depends(get_current_user),
):
    """
    AI-помощник для конструктора документов.
    
    Режимы:
    - improve: Улучшить текст пользователя (перевести на юридический язык)
    - generate: Сгенерировать правовое обоснование или требования на основе обстоятельств
    """
    try:
        # --- Режим: УЛУЧШЕНИЕ ТЕКСТА ---
        if request.mode == 'improve':
            if not request.text or len(request.text.strip()) < 10:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Введите минимум 10 символов для улучшения"
                )

            system_prompt = """Ты — AI-помощник юриста. Переводишь текст обычных людей на правильный юридический язык.

ПРАВИЛА:
1. Сохраняй ВСЕ факты пользователя
2. Используй официально-деловой стиль
3. Правильные юридические конструкции
4. НЕ добавляй вымышленные факты
5. НЕ выдумывай статьи/законы
6. Верни ТОЛЬКО улучшенный текст"""

            user_prompt = f"Улучши текст для документа типа '{request.context}'. Поле: {request.field or ''}\n\n{request.text}"

        # --- Режим: ГЕНЕРАЦИЯ ПРАВОВОГО ОБОСНОВАНИЯ ---
        elif request.mode == 'generate' and request.field == 'legal_basis':
            if not request.circumstances or len(request.circumstances.strip()) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Сначала опишите обстоятельства дела (минимум 20 символов), чтобы AI мог подобрать нормы"
                )

            system_prompt = f"""Ты — AI-помощник юриста. На основе описания ситуации подбираешь правильные нормы законодательства РФ.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реальные, действующие нормы (ГК РФ, ГПК РФ, АПК РФ, КАС РФ, ЗоПП и др.)
2. НЕ выдумывай статьи, законы, номера
3. Если не уверен в конкретной статье — используй общие формулировки без номеров статей
4. Для искового заявления (claim) — чаще всего: ст. 309, 310, 309-310 ГК РФ (обязательства), ст. 15 (убытки), ст. 395 (неустойка)
5. Для жалобы (complaint) — ст. 218-222 КАС РФ (оспаривание решений), ст. 254 ГПК РФ
6. Для претензии (demand) — ст. 309, 310 ГК РФ, ст. 18-29 ЗоПП
7. Формулируй кратко, только ссылки на статьи с пояснением
8. Верни ТОЛЬКО текст правового обоснования, без заголовков и комментариев"""

            user_prompt = f"Документ: {request.context}\n\nОбстоятельства дела:\n{request.circumstances}\n\nПодбери правовое обоснование (ссылки на статьи с пояснением):"

        # --- Режим: ГЕНЕРАЦИЯ ТРЕБОВАНИЙ ---
        elif request.mode == 'generate' and request.field == 'claims':
            if not request.circumstances or len(request.circumstances.strip()) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Сначала опишите обстоятельства дела, чтобы AI мог сформулировать требования"
                )

            system_prompt = f"""Ты — AI-помощник юриста. Формулируешь чёткие требования для искового заявления/претензии.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Требования должны быть КОНКРЕТНЫМИ и ИСПОЛНИМЫМИ
2. Каждое требование с новой строки
3. Для взыскания долга: "Взыскать с Ответчика задолженность в размере X руб."
4. Для неустойки: "Взыскать неустойку/проценты за пользование чужими деньгами"
5. Для судебных расходов: "Взыскать расходы по уплате госпошлины"
6. НЕ выдумывай суммы — если нет конкретной суммы, используй общие формулировки
7. Верни ТОЛЬКО текст требований, каждое с новой строки, без номеров и комментариев"""

            user_prompt = f"Документ: {request.context}\n\nОбстоятельства дела:\n{request.circumstances}\n\nСформулируй требования (каждое с новой строки):"

        # --- Режим: ГЕНЕРАЦИЯ ОБСТОЯТЕЛЬСТВ ---
        elif request.mode == 'generate' and request.field == 'circumstances':
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Обстоятельства дела нужно описать самостоятельно — это фактическая основа документа"
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неизвестный режим: {request.mode} / поле: {request.field}"
            )

        result = await ai_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=1500,
        )

        return {
            "mode": request.mode,
            "field": request.field,
            "suggested_text": result.strip(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка AI-помощника: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка AI: {str(e)}",
        )
