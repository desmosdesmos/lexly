from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.sudact_service import sudact_service
from app.services.limit_service import limit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/court-practice", tags=["Судебная практика"])


class CourtPracticeRequest(BaseModel):
    topic: str = Field(..., description="Тема анализа", min_length=2)
    additional_context: Optional[str] = Field(None, description="Дополнительный контекст")


@router.post(
    "/analyze",
    summary="Анализ судебной практики по теме",
)
async def analyze_court_practice(
    request: CourtPracticeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Проанализировать судебную практику по указанной теме.

    AI предоставит:
    - Ключевые тенденции с реальными ссылками на НПА
    - Типичные исходы дел с % вероятности
    - Важные прецеденты (только если найдены реальные дела)
    - Практические шаги для клиента
    - Примерный процент успешных дел

    Если реальные дела не найдены в базе — AI честно сообщает об этом
    и даёт анализ на основе законодательства РФ без выдуманных ссылок.

    Требует авторизации.
    """
    can_use, limit_info = await limit_service.check_court_practice_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "court_practice",
                "message": f"Вы достигли дневного лимита судебной практики ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro.",
                "limit_info": limit_info,
            },
        )

    try:
        # Ищем реальные дела на sudact.ru
        search_result = await sudact_service.search_cases(
            query=request.topic,
            limit=10,
        )
        real_cases = search_result.get("cases", [])
        no_real_cases = search_result.get("no_results", True)
        search_url = search_result.get("search_url", "")

        logger.info(
            f"Found {len(real_cases)} real cases for topic '{request.topic}', "
            f"no_results={no_real_cases}"
        )

        # AI анализирует — передаём честный флаг
        analysis = await ai_service.analyze_court_practice(
            topic=request.topic,
            additional_context=request.additional_context,
            real_cases=real_cases if real_cases else None,
            no_real_cases=no_real_cases,
            search_url=search_url,
        )

        await limit_service.increment_court_practice(current_user.id, db)

        return {
            "topic": request.topic,
            "analysis": analysis,
            "grounding_cases": real_cases,
            "has_real_cases": not no_real_cases,
            "search_url": search_url,  # Ссылка для самостоятельного поиска
        }

    except Exception as e:
        logger.error(f"Error analyzing court practice: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка анализа судебной практики: {str(e)}",
        )


@router.get(
    "/search",
    summary="Поиск реальных дел на sudact.ru",
)
async def search_court_cases(
    query: str = Query(..., description="Поисковый запрос", min_length=1),
    court_type: Optional[str] = Query(None, description="Тип суда (general, arbitrazh, vsrf)"),
    limit: int = Query(10, ge=1, le=50, description="Количество результатов"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Поиск реальных судебных дел на sudact.ru.

    Возвращает:
    - cases: список найденных дел с URL
    - no_results: true если реальных дел не найдено
    - search_url: прямая ссылка для самостоятельного поиска на sudact.ru

    Требует авторизации.
    """
    can_use, limit_info = await limit_service.check_court_practice_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "court_practice",
                "message": f"Вы достигли дневного лимита поиска дел ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro.",
                "limit_info": limit_info,
            },
        )

    try:
        result = await sudact_service.search_cases(
            query=query,
            court_type=court_type,
            limit=limit,
        )

        return {
            "query": query,
            "court_type": court_type,
            "total": result.get("total_found", 0),
            "cases": result.get("cases", []),
            "no_results": result.get("no_results", True),
            "search_url": result.get("search_url", ""),
        }

    except Exception as e:
        logger.error(f"Error searching court cases: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка поиска дел: {str(e)}",
        )


@router.get(
    "/case/{case_url:path}",
    summary="Получить полное дело по URL",
)
async def get_case_full(
    case_url: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Получить полный текст судебного дела по URL."""
    try:
        case_data = await sudact_service.get_case_full(case_url)

        if not case_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Дело не найдено или не удалось загрузить",
            )

        return case_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching case: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка загрузки дела: {str(e)}",
        )
