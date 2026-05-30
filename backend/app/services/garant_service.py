"""
Устаревший garant_service — теперь является тонким фасадом над pravo_service.
Оставлен для обратной совместимости. Реальная логика в pravo_service.py.
"""
from app.services.pravo_service import pravo_service
from typing import Dict, Any, List, Optional


class GarantParser:
    """Фасад для обратной совместимости. Делегирует вызовы в PravoService."""

    async def get_latest_changes(self, limit: int = 50) -> List[Dict[str, Any]]:
        return await pravo_service.get_latest_laws(limit=limit)

    async def search_law_changes(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        return await pravo_service.search_laws(query=query, limit=limit)

    async def get_legislation_review(self, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        changes = await pravo_service.get_latest_laws(limit=20)
        return {
            "date": date or "latest",
            "changes": changes,
            "total": len(changes),
            "url": "http://publication.pravo.gov.ru",
        }


garant_parser = GarantParser()
