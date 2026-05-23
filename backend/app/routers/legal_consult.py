from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import os
import uuid
from pathlib import Path
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.limit_service import limit_service
from app.services.garant_service import garant_parser
from app.services.file_service import file_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/legal", tags=["Юридическая консультация"])

# Временная папка для консультаций по файлам
CONSULT_UPLOAD_DIR = Path("./uploads/consult")
CONSULT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class ConsultRequest(BaseModel):
    question: str = Field(..., description="Юридический вопрос", min_length=5)


@router.post(
    "/consult",
    summary="Юридическая консультация с поиском по законам",
)
async def legal_consultation(
    request: ConsultRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить профессиональную юридическую консультацию.
    
    Система сначала ищет актуальные нормы права через реестры, а затем формирует ответ.
    """
    # 1. Проверка лимитов
    can_use, limit_info = await limit_service.check_ai_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "message": "Лимит AI-консультаций исчерпан. Перейдите на Pro.",
                "limit_info": limit_info
            }
        )

    try:
        # 2. Поиск актуальных норм (Grounding)
        # Извлекаем ключевые слова для поиска из вопроса
        search_results = await garant_parser.search_law_changes(query=request.question, limit=5)
        
        grounding_context = ""
        if search_results:
            grounding_context = "\nАКТУАЛЬНЫЕ НОРМЫ И ИЗМЕНЕНИЯ (база для ответа):\n"
            for res in search_results:
                grounding_context += f"- {res['title']} ({res['url']}): {res['description'][:300]}\n"

        # 3. Генерация ответа через AI
        system_prompt = """Ты — ГЛАВНЫЙ ЮРИДИЧЕСКИЙ КОНСУЛЬТАНТ РФ. 
Твоя задача: дать точный, структурированный и юридически обоснованный ответ.

ПРАВИЛА:
1. Опирайся на предоставленный контекст актуальных норм, если он релевантен вопросу.
2. Давай ссылки на конкретные статьи кодексов (ГК, ТК, УК, КоАП и др.).
3. Учитывай правоприменительную практику 2024-2026 годов.
4. В конце ответа добавь блок 'ИСТОЧНИКИ' со ссылками на найденные законы.
5. Пиши в профессиональном стиле, структурируй ответ по пунктам."""

        user_prompt = f"ВОПРОС: {request.question}\n{grounding_context}\n\nДай подробную консультацию."

        answer = await ai_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.1,
            max_tokens=4000
        )

        # 4. Учет лимита
        await limit_service.increment_ai_request(current_user.id, db)

        return {
            "question": request.question,
            "answer": answer,
            "sources": search_results
        }
        
    except Exception as e:
        logger.error(f"Legal consultation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка консультации: {str(e)}",
        )


@router.post(
    "/consult-file",
    summary="Консультация AI по конкретному документу",
)
async def consult_with_file(
    question: str = Form(..., description="Вопрос по документу"),
    file: UploadFile = File(..., description="Документ (PDF, DOCX, TXT)"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Загрузить документ и задать по нему вопрос AI-консультанту.
    
    AI проанализирует содержимое файла и ответит на ваш вопрос с учетом контекста документа.
    """
    # 1. Проверка лимитов (используем тот же лимит, что и для обычной консультации)
    can_use, limit_info = await limit_service.check_ai_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "message": "Лимит AI-консультаций исчерпан. Перейдите на Pro.",
                "limit_info": limit_info
            }
        )

    # 2. Сохранение и парсинг файла
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in file_service.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Неподдерживаемый формат файла: {file_ext}",
        )

    temp_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = CONSULT_UPLOAD_DIR / temp_filename

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Извлечение текста
        document_text = await file_service.extract_text(file_path)
        
        if not document_text or len(document_text.strip()) < 10:
             raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Не удалось извлечь текст из файла или файл слишком короткий",
            )

        # 3. AI Консультация по контексту
        system_prompt = """Ты — СТАРШИЙ ЮРИСТ-АНАЛИТИК. Твоя задача: ответить на вопрос пользователя, основываясь на предоставленном ТЕКСТЕ ДОКУМЕНТА.

ПРАВИЛА:
1. Ищи ответ ПРЕЖДЕ ВСЕГО в тексте документа.
2. Если в документе нет информации, скажи об этом и дай ответ на основе законодательства РФ.
3. Указывай конкретные пункты или разделы документа, если ссылаешься на них.
4. Пиши четко, профессионально и по существу.
5. Если пользователь просит найти риски — подсвети их максимально подробно."""

        user_prompt = f"ТЕКСТ ДОКУМЕНТА:\n---\n{document_text[:8000]}\n---\n\nВОПРОС ПОЛЬЗОВАТЕЛЯ: {question}\n\nПроанализируй документ и дай подробный ответ:"

        answer = await ai_service.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.1,
            max_tokens=4000
        )

        # 4. Учет лимита
        await limit_service.increment_ai_request(current_user.id, db)

        return {
            "question": question,
            "filename": file.filename,
            "answer": answer,
        }

    except Exception as e:
        logger.error(f"Consult with file error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка анализа файла: {str(e)}",
        )
    finally:
        # Удаляем временный файл
        if file_path.exists():
            os.remove(file_path)
