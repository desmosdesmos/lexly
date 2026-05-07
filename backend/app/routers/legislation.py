from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging
from datetime import datetime
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.user import User
from app.middleware.auth import get_current_user
from app.services.ai_service import ai_service
from app.services.limit_service import limit_service
from app.services.garant_service import garant_parser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/legislation", tags=["Мониторинг законодательства"])


class LegislationMonitorRequest(BaseModel):
    topic: Optional[str] = Field(None, description="Тема мониторинга (опционально)")


@router.post(
    "/monitor",
    summary="Мониторинг изменений законодательства",
)
async def monitor_legislation(
    request: LegislationMonitorRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить анализ последних изменений в законодательстве РФ.
    
    AI предоставит:
    - Список последних изменений
    - Даты вступления в силу
    - Влияние на граждан/бизнес
    - Рекомендации
    - Предстоящие изменения
    
    Можно указать тему для фокусировки (например: "трудовое право", "налогообложение").
    
    Требует авторизации.
    """
    # Проверка лимитов
    can_use, limit_info = await limit_service.check_law_monitoring_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "type": "limit_exceeded",
                "resource": "law_monitoring",
                "message": f"Вы достигли дневного лимита мониторинга ({limit_info['used']}/{limit_info['max']}). Перейдите на Pro.",
                "limit_info": limit_info,
            },
        )

    try:
        # Сначала получаем реальные изменения для базы (grounding)
        real_changes = await garant_parser.get_latest_changes(limit=10)
        
        # Если есть тема, фильтруем или ищем специфичные
        if request.topic:
            topic_lower = request.topic.lower()
            filtered = [
                c for c in real_changes 
                if topic_lower in c.get('title', '').lower() or topic_lower in c.get('description', '').lower()
            ]
            if filtered:
                real_changes = filtered

        analysis = await ai_service.monitor_legislation(
            topic=request.topic,
            real_changes=real_changes[:5] # Передаем топ-5 для контекста
        )

        # Инкремент
        await limit_service.increment_law_monitoring(current_user.id, db)

        return {
            "report_date": analysis.get("report_date", datetime.now().strftime("%Y-%m-%d")),
            "topic": request.topic or "Общий мониторинг",
            "summary": analysis.get("summary", ""),
            "changes": analysis.get("changes", []),
            "upcoming_changes": analysis.get("upcoming_changes", []),
            "total_changes": analysis.get("total_changes", 0),
            "grounding_sources": real_changes[:5]
        }
        
    except Exception as e:
        logger.error(f"Error monitoring legislation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка мониторинга законодательства: {str(e)}",
        )


@router.get(
    "/garant-review",
    summary="Ежедневный обзор изменений с Garant.ru",
)
async def get_garant_review(
    date: Optional[str] = Query(None, description="Дата обзора в формате YYYY-MM-DD"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить ежедневный обзор изменений законодательства с garant.ru.
    
    Если дата не указана, возвращается обзор за сегодня.
    Данные берутся напрямую с garant.ru/subscribe/fed/
    
    Требует авторизации.
    """
    try:
        review = await garant_parser.get_legislation_review(date)
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Обзор не найден. Попробуйте другую дату.",
            )
        
        return {
            "date": review.get("date", ""),
            "url": review.get("url", ""),
            "total": review.get("total", 0),
            "changes": review.get("changes", []),
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting Garant review: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения обзора: {str(e)}",
        )


@router.get(
    "/search",
    summary="Поиск изменений по ключевому слову",
)
async def search_legislation(
    query: str = Query(..., description="Поисковый запрос", min_length=1),
    limit: int = Query(20, ge=1, le=50, description="Количество результатов"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Поиск изменений законодательства по ключевому слову.

    Данные берутся с garant.ru

    Требует авторизации.
    """
    # Проверка лимитов
    can_use, _ = await limit_service.check_law_monitoring_limit(
        user_id=current_user.id,
        db=db,
    )
    if not can_use:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Вы достигли дневного лимита мониторинга законов. Перейдите на Pro.",
        )

    try:
        changes = await garant_parser.get_latest_changes(limit=50)

        # Фильтрация по ключевому слову (мягкая - ищем частичное совпадение)
        query_lower = query.lower()
        filtered = [
            change for change in changes
            if query_lower in change.get("title", "").lower()
            or query_lower in change.get("description", "").lower()
            or query_lower in change.get("number", "").lower()
        ]

        # Если ничего не найдено прямой фильтрацией - используем AI для анализа
        if not filtered and changes:
            # Вернём первые результаты с пометкой
            filtered = changes[:limit]

        return {
            "query": query,
            "total": len(filtered),
            "changes": filtered[:limit],
        }

    except Exception as e:
        logger.error(f"Error searching legislation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка поиска: {str(e)}",
        )
