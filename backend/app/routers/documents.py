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
    - contract_sale - договор купли-продажи
    - contract_employment - трудовой договор
    - power_of_attorney - доверенность
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
        # Подготовка данных для AI - теперь поддерживаем все поля из запроса
        data = request.data.copy()
        
        # Добавляем маппинг для обратной совместимости и удобства шаблонов
        # Если вложенные объекты есть, раскрываем их в плоскую структуру для плейсхолдеров
        if "plaintiff" in data and isinstance(data["plaintiff"], dict):
            p = data["plaintiff"]
            data["plaintiff_name"] = p.get("name", "")
            data["plaintiff_inn"] = p.get("inn", "")
            data["plaintiff_address"] = p.get("address", "")
            
        if "defendant" in data and isinstance(data["defendant"], dict):
            d = data["defendant"]
            data["defendant_name"] = d.get("name", "")
            data["defendant_inn"] = d.get("inn", "")
            data["defendant_address"] = d.get("address", "")

        if "applicant" in data and isinstance(data["applicant"], dict):
            a = data["applicant"]
            data["applicant_name"] = a.get("name", "")
            data["applicant_inn"] = a.get("inn", "")
            data["applicant_address"] = a.get("address", "")
            
        if "demander" in data and isinstance(data["demander"], dict):
            dm = data["demander"]
            data["demander_name"] = dm.get("name", "")
            data["demander_inn"] = dm.get("inn", "")
            data["demander_address"] = dm.get("address", "")

        if "demander_from" in data and isinstance(data["demander_from"], dict):
            df = data["demander_from"]
            data["demander_from_name"] = df.get("name", "")
            data["demander_from_inn"] = df.get("inn", "")
            data["demander_from_address"] = df.get("address", "")

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
        if doc_type == 'claim':
            docx_bytes = docx_generator.generate_claim(input_data)
        elif doc_type == 'complaint':
            docx_bytes = docx_generator.generate_complaint(input_data)
        elif doc_type == 'demand':
            docx_bytes = docx_generator.generate_demand(input_data)
        else:
            # Для новых типов используем генерацию из текста (AI уже составил структуру)
            title_map = {
                'contract_sale': 'Договор купли-продажи',
                'contract_employment': 'Трудовой договор',
                'power_of_attorney': 'Доверенность'
            }
            title = title_map.get(doc_type, 'Юридический документ')
            docx_bytes = docx_generator.generate_from_plain_text(title, document.generated_content)
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
                    detail="Сначала опишите обстоятельства или условия (минимум 20 символов), чтобы AI мог подобрать нормы"
                )

            # Контекстное определение системы права
            is_contract = 'contract' in str(request.context).lower() or 'attorney' in str(request.context).lower()
            
            if is_contract:
                purpose = "оклад и условия оплаты" if "employment" in str(request.context).lower() else "цену и порядок расчетов"
                system_prompt = f"""Ты — AI-помощник юриста. Твоя задача — сформулировать ПУНКТЫ ДОГОВОРА про {purpose}.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать термины: 'Иск', 'Суд', 'Взыскать', 'Истец', 'Ответчик'.

ПРАВИЛА:
1. Используй ТОЛЬКО реальные нормы ТК РФ (для трудовых) или ГК РФ (для купли-продажи).
2. Формулируй как готовые пункты договора: "Оклад устанавливается в размере...", "Оплата производится в течение...".
3. Верни ТОЛЬКО текст условий."""
            else:
                system_prompt = f"""Ты — AI-помощник юриста. На основе описания ситуации подбираешь правильные нормы законодательства РФ для ПРОЦЕССУАЛЬНОГО ДОКУМЕНТА (иск, жалоба).

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реальные, действующие нормы (ГК РФ, ГПК РФ, АПК РФ, КАС РФ, ЗоПП и др.)
2. Для искового заявления (claim) — чаще всего: ст. 309, 310 ГК РФ (обязательства), ст. 15 (убытки), ст. 395 (неустойка)
3. Для жалобы (complaint) — ст. 218-222 КАС РФ (оспаривание решений), ст. 254 ГПК РФ
4. Для претензии (demand) — ст. 309, 310 ГК РФ, ст. 18-29 ЗоПП
5. Верни ТОЛЬКО текст правового обоснования, без заголовков и комментариев"""

        # --- Режим: ГЕНЕРАЦИЯ ТРЕБОВАНИЙ / УСЛОВИЙ ---
        elif request.mode == 'generate' and request.field == 'claims':
            if not request.circumstances or len(request.circumstances.strip()) < 20:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Сначала опишите обстоятельства или суть документа, чтобы AI мог сформулировать пункты"
                )

            is_contract = 'contract' in str(request.context).lower() or 'attorney' in str(request.context).lower()

            if is_contract:
                system_prompt = f"""Ты — AI-помощник юриста. Формулируешь чёткие УСЛОВИЯ И ОБЯЗАТЕЛЬСТВА для ДОГОВОРА.
КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать о судах и взысканиях.

ПРАВИЛА:
1. Пиши условия в утвердительной форме: "Работодатель обязуется...", "Покупатель обязуется оплатить..."
2. Каждое условие с новой строки.
3. Верни ТОЛЬКО текст условий, без номеров и комментариев."""
            else:
                system_prompt = f"""Ты — AI-помощник юриста. Формулируешь чёткие ТРЕБОВАНИЯ для искового заявления/претензии.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Требования должны быть КОНКРЕТНЫМИ и ИСПОЛНИМЫМИ
2. Каждое требование с новой строки
3. Для взыскания долга: "Взыскать с Ответчика задолженность в размере X руб."
4. НЕ выдумывай суммы — используй общие формулировки если нет цифр
5. Верни ТОЛЬКО текст требований, каждое с новой строки, без номеров и комментариев"""

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
