"""Сервис для парсинга изменений законодательства с garant.ru."""
import httpx
import logging
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from datetime import datetime

logger = logging.getLogger(__name__)


class GarantParser:
    """Парсер сайта garant.ru для мониторинга изменений законодательства."""

    BASE_URL = "https://www.garant.ru"
    # URL страницы с обзором изменений
    REVIEW_URL = f"{BASE_URL}/subscribe/fed/"

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        }

    async def get_latest_changes(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Получить последние изменения законодательства.

        Args:
            limit: Количество изменений

        Returns:
            Список изменений
        """
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(
                    self.REVIEW_URL,
                    headers=self.headers,
                )
                response.raise_for_status()
                
                return self._parse_changes(response.text, limit)
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching legislation changes: {str(e)}")
            return []

    def _parse_changes(self, html: str, limit: int) -> List[Dict[str, Any]]:
        """Парсинг страницы с изменениями."""
        try:
            soup = BeautifulSoup(html, "html.parser")
            results = []
            
            # Ищем блоки с новостями/изменениями
            # Garant использует различные классы, пробуем несколько вариантов
            news_items = soup.find_all("div", class_="news-item")
            if not news_items:
                news_items = soup.find_all("li", class_="news")
            if not news_items:
                news_items = soup.find_all("div", class_="item")
            if not news_items:
                # Ищем все ссылки в основном контенте
                content_area = soup.find("div", class_="content") or soup.find("main")
                if content_area:
                    news_items = content_area.find_all("a")
            
            for item in news_items[:limit]:
                change_data = self._extract_change_data(item)
                if change_data:
                    results.append(change_data)
            
            return results
            
        except Exception as e:
            logger.error(f"Error parsing changes: {str(e)}")
            return []

    def _extract_change_data(self, item: BeautifulSoup) -> Optional[Dict[str, Any]]:
        """Извлечение данных об изменении."""
        try:
            # Заголовок
            title_tag = item.find("a") or item.find("h3") or item
            title = title_tag.text.strip() if hasattr(title_tag, 'text') else item.text.strip()
            
            if not title or len(title) < 10:
                return None
            
            # Ссылка
            link_tag = item.find("a")
            url = link_tag.get("href", "") if link_tag else ""
            if url and not url.startswith("http"):
                url = f"{self.BASE_URL}{url}"
            
            # Дата
            date_tag = item.find("span", class_="date") or item.find("time")
            date_str = ""
            if date_tag:
                date_str = date_tag.text.strip()
            else:
                # Пробуем извлечь дату из текста
                import re
                date_match = re.search(r'(\d{2}\.\d{2}\.\d{4})', title)
                if date_match:
                    date_str = date_match.group(1)
            
            # Описание
            desc_tag = item.find("p") or item.find("div", class_="description")
            description = desc_tag.text.strip() if desc_tag else ""
            
            return {
                "title": title,
                "url": url,
                "date": date_str,
                "description": description,
            }
            
        except Exception as e:
            logger.error(f"Error extracting change data: {str(e)}")
            return None

    async def search_law_changes(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Поиск изменений законодательства по конкретному запросу."""
        search_url = f"{self.BASE_URL}/search/"
        params = {"q": query}
        
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(search_url, params=params, headers=self.headers)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                results = []
                
                # Ищем блоки результатов поиска
                items = soup.find_all("div", class_="search-result") or soup.find_all("div", class_="item")
                
                for item in items[:limit]:
                    title_tag = item.find("a")
                    if not title_tag: continue
                    
                    title = title_tag.text.strip()
                    url = title_tag.get("href", "")
                    if url and not url.startswith("http"):
                        url = f"{self.BASE_URL}{url}"
                        
                    date_tag = item.find("span", class_="date")
                    date = date_tag.text.strip() if date_tag else ""
                    
                    desc_tag = item.find("div", class_="snippet") or item.find("p")
                    description = desc_tag.text.strip() if desc_tag else ""
                    
                    results.append({
                        "title": title,
                        "url": url,
                        "date": date,
                        "description": description
                    })
                
                return results
        except Exception as e:
            logger.error(f"Error searching law changes: {str(e)}")
            return []
    async def get_legislation_review(self, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Получить ежедневный обзор изменений.

        Args:
            date: Дата обзора в формате YYYY-MM-DD

        Returns:
            Структурированный обзор
        """
        if not date:
            date = datetime.now().strftime("%Y%m%d")
        else:
            date = date.replace("-", "")
        
        review_url = f"{self.BASE_URL}/subscribe/fed/{date}/"
        
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(
                    review_url,
                    headers=self.headers,
                )
                
                if response.status_code == 404:
                    # Если обзор за эту дату не найден, пробуем главную страницу
                    response = await client.get(self.REVIEW_URL, headers=self.headers)
                
                response.raise_for_status()
                
                changes = self._parse_changes(response.text, limit=50)
                
                return {
                    "date": date,
                    "url": review_url,
                    "changes": changes,
                    "total": len(changes),
                }
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching legislation review: {str(e)}")
            return None


# Singleton instance
garant_parser = GarantParser()
