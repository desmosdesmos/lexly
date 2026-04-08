from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.limit_service import limit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/legal", tags=["AI-консультант"])


@router.post(
    "/consult",
    summary="Юридическая консультация через AI",
)
async def legal_consult(
    request: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить юридическую консультацию на основе действующего законодательства РФ.

    - **question**: Ваш вопрос

    AI предоставит подробный ответ со ссылками на действующие нормы права.
    """
    question = request.get("question", "").strip()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Введите вопрос",
        )

    if len(question) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Вопрос слишком короткий",
        )

    # Проверка лимитов AI
    can_use, limit_info = await limit_service.check_ai_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "ai_consultant",
                "message": f"Вы исчерпали дневной лимит AI-консультанта ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro для безлимита.",
                "limit_info": limit_info,
            },
        )

    try:
        system_prompt = """Ты — профессиональный AI-юрист с 20-летним опытом работы в российской правовой системе.

ТВОЯ ЗАДАЧА — дать максимально подробный, точный и полезный ответ на юридический вопрос, основанный на ДЕЙСТВУЮЩЕМ законодательстве РФ.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реально существующие и действующие нормы права РФ на 2026 год.
2. НЕ выдумывай статьи, законы, номера постановлений или судебные решения.
3. Если не уверен в конкретной статье — используй общие формулировки без указания номеров статей.
4. Всегда указывай, какой федеральный закон или кодекс регулирует вопрос.
5. Давай развёрнутый, подробный ответ с пояснениями.
6. В конце ответа всегда указывай: "Данный ответ носит информационный характер и не заменяет консультацию юриста."
7. Структурируй ответ: используй нумерованные списки, подзаголовки, пояснения.
8. Если вопрос требует procedural информации (куда обращаться, какие документы подавать) — опиши пошаговый алгоритм.

ФОРМАТ ОТВЕТА:
1. Краткий ответ на вопрос (1-2 предложения)
2. Нормативная база (какие законы регулируют вопрос)
3. Подробное разъяснение
4. Практические рекомендации (что делать, куда обращаться)
5. Важные нюансы и риски
6. Дисклеймер"""

        answer = await ai_service.generate(
            system_prompt=system_prompt,
            user_prompt=f"Юридический вопрос: {question}\n\nДай максимально подробный ответ на основе действующего законодательства РФ.",
            temperature=0.2,
            max_tokens=4096,
        )

        # Инкремент
        await limit_service.increment_ai_request(current_user.id, db)

        return {
            "question": question,
            "answer": answer,
        }

    except Exception as e:
        logger.error(f"Legal consultation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка консультации: {str(e)}",
        )
