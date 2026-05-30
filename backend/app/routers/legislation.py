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
from app.services.pravo_service import pravo_service

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

    Данные берутся из официальных источников:
    - publication.pravo.gov.ru (федеральный портал правовой информации)
    - kremlin.ru (указы, федеральные законы)
    - government.ru (постановления правительства)
    - duma.gov.ru (законопроекты)
    - cbr.ru, nalog.gov.ru, mintrud.gov.ru и др.

    Требует авторизации.
    """
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
        # Получаем реальные данные из официальных источников
        if request.topic:
            real_changes = await pravo_service.search_laws(query=request.topic, limit=25)
            if len(real_changes) < 3:
                # Если по теме мало — добавляем последние НПА
                latest = await pravo_service.get_latest_laws(limit=15)
                real_changes = real_changes + latest
        else:
            real_changes = await pravo_service.get_latest_laws(limit=30, days_back=60)

        logger.info(f"Fetched {len(real_changes)} law documents from official sources")

        # AI анализирует реальные данные
        analysis = await ai_service.monitor_legislation(
            topic=request.topic,
            real_changes=real_changes[:20],
        )

        await limit_service.increment_law_monitoring(current_user.id, db)

        return {
            "report_date": analysis.get("report_date", datetime.now().strftime("%Y-%m-%d")),
            "topic": request.topic or "Общий мониторинг",
            "summary": analysis.get("summary", ""),
            "changes": analysis.get("changes", []),
            "upcoming_changes": analysis.get("upcoming_changes", []),
            "total_changes": analysis.get("total_changes", len(analysis.get("changes", []))),
            "grounding_sources": [
                {
                    "title": ch.get("title", "")[:80],
                    "url": ch.get("url", ""),
                    "date": ch.get("date", ""),
                    "source": ch.get("source", ""),
                }
                for ch in real_changes[:8]
                if ch.get("url")
            ],
            "sources_count": len(real_changes),
        }

    except Exception as e:
        logger.error(f"Error monitoring legislation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка мониторинга законодательства: {str(e)}",
        )


@router.get(
    "/search",
    summary="Поиск НПА по ключевому слову",
)
async def search_legislation(
    query: str = Query(..., description="Поисковый запрос", min_length=1),
    limit: int = Query(20, ge=1, le=50, description="Количество результатов"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Поиск НПА по ключевому слову.

    Данные из официального портала pravo.gov.ru и RSS официальных органов.
    Возвращает реальные документы с реальными URL.

    Требует авторизации.
    """
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
        results = await pravo_service.search_laws(query=query, limit=limit)

        return {
            "query": query,
            "total": len(results),
            "changes": results,
        }

    except Exception as e:
        logger.error(f"Error searching legislation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка поиска: {str(e)}",
        )


@router.get(
    "/latest",
    summary="Последние НПА из официальных источников",
)
async def get_latest_laws(
    days: int = Query(30, ge=1, le=365, description="За сколько дней"),
    limit: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Получить последние НПА без AI-анализа — чистые данные из официальных источников.
    """
    try:
        results = await pravo_service.get_latest_laws(limit=limit, days_back=days)
        return {
            "total": len(results),
            "days_back": days,
            "items": results,
        }
    except Exception as e:
        logger.error(f"Error fetching latest laws: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/garant-review",
    summary="Обзор (совместимость)",
    deprecated=True,
)
async def get_garant_review(
    date: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Устаревший endpoint — теперь использует pravo.gov.ru."""
    try:
        changes = await pravo_service.get_latest_laws(limit=20)
        return {
            "date": date or datetime.now().strftime("%Y-%m-%d"),
            "url": "http://publication.pravo.gov.ru",
            "total": len(changes),
            "changes": changes,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
