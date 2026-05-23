import httpx
import logging
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urljoin

logger = logging.getLogger(__name__)


class GarantParser:
    """Глубокий парсер законодательства РФ."""

    BASE_URL = "https://www.garant.ru"
    # Набор самых надежных источников новостей законодательства
    SOURCES = [
        "/news/changes/",      # Основной обзор
        "/news/actual/",       # Актуальное
        "/news/",              # Все новости
        "/calendar/federal/",  # Календарь изменений
    ]

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9",
        }

    async def get_latest_changes(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Собирает изменения из нескольких разделов для максимальной полноты.
        """
        all_changes = []
        seen_urls = set()

        async with httpx.AsyncClient(timeout=40.0, follow_redirects=True) as client:
            for path in self.SOURCES:
                url = urljoin(self.BASE_URL, path)
                try:
                    response = await client.get(url, headers=self.headers)
                    if response.status_code == 200:
                        changes = self._parse_changes(response.text)
                        for ch in changes:
                            if ch['url'] not in seen_urls:
                                all_changes.append(ch)
                                seen_urls.add(ch['url'])
                except Exception as e:
                    logger.error(f"Error scraping {url}: {e}")
                
                if len(all_changes) >= limit + 20:
                    break

        return all_changes[:limit]

    def _parse_changes(self, html: str) -> List[Dict[str, Any]]:
        soup = BeautifulSoup(html, "html.parser")
        results = []
        
        # Контейнеры новостей
        items = soup.select(".news-item, .list-news__item, .js-news-item, .b-news-item, div.item, article")
        
        if not items:
            content = soup.find("div", class_="content") or soup.find("main")
            if content:
                items = content.find_all("a", href=True)

        for item in items:
            data = self._extract_change_data(item)
            if data and data.get('title') and len(data['title']) > 20:
                results.append(data)
        
        return results

    def _extract_change_data(self, item: BeautifulSoup) -> Optional[Dict[str, Any]]:
        try:
            link_tag = item if (item.name == "a" and item.get("href")) else item.find("a", href=True)
            if not link_tag:
                return None
                
            href = link_tag.get("href", "")
            if not href or "javascript:" in href or "#" in href:
                return None
                
            url = urljoin(self.BASE_URL, href)
            
            title_tag = item.find(["h2", "h3", "h4", "span"]) or link_tag
            title = title_tag.get_text().strip()
            
            if not title or len(title) < 15 or "http" in title[:20]:
                return None

            import re
            date_str = ""
            date_tag = item.select_one(".date, time, .news-date, .list-news__date")
            if date_tag:
                date_str = date_tag.get_text().strip()
            
            full_text = item.get_text()
            if not date_str:
                date_match = re.search(r'(\d{2}\.\d{2}\.\d{4})', full_text)
                if date_match:
                    date_str = date_match.group(1)

            description = ""
            desc_tag = item.select_one(".description, .text, .news-text, p")
            if desc_tag:
                description = desc_tag.get_text().strip()
            
            if not description and len(full_text) > len(title):
                description = full_text.replace(title, "").replace(date_str, "").strip()

            return {
                "title": title,
                "url": url,
                "date": date_str or datetime.now().strftime("%d.%m.%Y"),
                "description": description[:400].strip() + "..." if len(description) > 400 else description
            }
        except Exception:
            return None

    async def search_law_changes(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Поиск через прямой запрос к разделу новостей."""
        # Гарант часто блокирует прямой /search/, поэтому ищем в новостях расширенно
        all_news = await self.get_latest_changes(limit=150)
        query_words = query.lower().split()
        
        filtered = []
        for news in all_news:
            matches = 0
            for word in query_words:
                if word in news['title'].lower() or word in news['description'].lower():
                    matches += 1
            if matches > 0:
                filtered.append((matches, news))
        
        # Сортируем по количеству совпадений
        filtered.sort(key=lambda x: x[0], reverse=True)
        return [x[1] for x in filtered[:limit]]

    async def get_legislation_review(self, date: Optional[str] = None) -> Optional[Dict[str, Any]]:
        changes = await self.get_latest_changes(limit=20)
        return {"date": date or "latest", "changes": changes, "total": len(changes), "url": self.BASE_URL}

garant_parser = GarantParser()
