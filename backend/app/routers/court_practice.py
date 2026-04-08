from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.sudact_service import sudact_parser
from app.services.limit_service import limit_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/court-practice", tags=["Судебная практика"])


@router.get(
    "/analyze",
    summary="Анализ судебной практики по теме",
)
async def analyze_court_practice(
    topic: str = Query(..., description="Тема анализа", min_length=2),
    additional_context: Optional[str] = Query(None, description="Дополнительный контекст"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Проанализировать судебную практику по указанной теме.
    
    AI предоставит:
    - Ключевые тенденции
    - Типичные исходы дел
    - Важные прецеденты
    - Рекомендации
    - Примерный процент успешных дел
    
    Требует авторизации.
    """
    # Проверка лимитов
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
        analysis = await ai_service.analyze_court_practice(
            topic=topic,
            additional_context=additional_context,
        )

        # Инкремент
        await limit_service.increment_court_practice(current_user.id, db)

        return {
            "topic": topic,
            "analysis": analysis,
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
    court_type: Optional[str] = Query(None, description="Тип суда (general, arbitrazh)"),
    limit: int = Query(10, ge=1, le=50, description="Количество результатов"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Поиск реальных судебных дел на sudact.ru.
    
    Возвращает список дел с заголовками, URL и кратким описанием.

    Требует авторизации.
    """
    # Проверка лимитов
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
        cases = await sudact_parser.search_cases(
            query=query,
            court_type=court_type,
            limit=limit,
        )
        
        return {
            "query": query,
            "court_type": court_type,
            "total": len(cases),
            "cases": cases,
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
    """
    Получить полное тексты судебного дела.
    
    case_url - полный URL дела на sudact.ru (URL-encoded)
    
    Требует авторизации.
    """
    try:
        case_data = await sudact_parser.get_case_full(case_url)
        
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
