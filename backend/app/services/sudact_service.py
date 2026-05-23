"""Сервис для парсинга судебной практики с sudact.ru."""
import httpx
import logging
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote

logger = logging.getLogger(__name__)


class SudactParser:
    """Парсер сайта sudact.ru для получения судебной практики."""

    BASE_URL = "https://sudact.ru"
    # Поиск по всем судам (универсальный вход)
    SEARCH_URL = f"{BASE_URL}/regular/doc/"
    ARBITR_URL = f"{BASE_URL}/arbitr/doc/"

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9",
            "Referer": "https://sudact.ru/",
        }

    async def search_cases(
        self,
        query: str,
        court_type: Optional[str] = None,
        case_type: Optional[str] = None,
        limit: int = 15,
    ) -> List[Dict[str, Any]]:
        """
        Глубокий поиск судебных дел с расширенными параметрами и валидацией.
        """
        params = {
            "q": query,
            "sort": "date:desc", # Всегда свежие наверх
        }

        if case_type:
            params["case_type"] = case_type

        all_results = []
        
        # Определяем по каким разделам искать
        targets = []
        if court_type == "arbitrazh":
            targets = [self.ARBITR_URL]
        elif court_type == "general":
            targets = [self.SEARCH_URL]
        else:
            # Если тип не указан, ищем и там и там
            targets = [self.ARBITR_URL, self.SEARCH_URL]

        async with httpx.AsyncClient(timeout=45.0, follow_redirects=True) as client:
            for url in targets:
                try:
                    response = await client.get(url, params=params, headers=self.headers)
                    if response.status_code == 200:
                        results = self._parse_search_results(response.text)
                        all_results.extend(results)
                    
                    if len(all_results) >= limit:
                        break
                except Exception as e:
                    logger.error(f"Error searching {url}: {e}")

        # Финальная очистка и лимит
        seen_urls = set()
        unique_results = []
        for r in all_results:
            if r['url'] not in seen_urls:
                unique_results.append(r)
                seen_urls.add(r['url'])
        
        return unique_results[:limit]

    def _parse_search_results(self, html: str) -> List[Dict[str, Any]]:
        """Улучшенный парсинг результатов поиска."""
        try:
            soup = BeautifulSoup(html, "html.parser")
            results = []

            # Точные селекторы для актуальной верстки
            items = soup.select(".doc-block, .search-result, .item, .doc")
            
            if not items:
                # Если блоки не найдены, ищем через заголовки
                items = soup.select("h4, h3")

            for item in items:
                case_data = self._extract_case_data(item)
                if case_data and case_data.get('url'):
                    results.append(case_data)
            
            return results

        except Exception as e:
            logger.error(f"Error parsing search results: {str(e)}")
            return []

    def _extract_case_data(self, block: BeautifulSoup) -> Optional[Dict[str, Any]]:
        """Глубокое извлечение данных дела."""
        try:
            # 1. Заголовок и URL
            title_tag = block.select_one(".doc-title, h4 a, h3 a, a[href*='/doc/']")
            if not title_tag and block.name == "a":
                title_tag = block
            
            if not title_tag:
                return None
                
            title = title_tag.get_text().strip()
            url = title_tag.get("href", "")
            
            if not url or len(title) < 10:
                return None

            if url and not url.startswith("http"):
                url = urljoin(self.BASE_URL, url)
            
            # 2. Мета-информация (Суд, Дата, Судья)
            meta_text = ""
            meta_tag = block.select_one(".doc-meta, .meta, .info")
            if meta_tag:
                meta_text = meta_tag.get_text().strip()
            
            # 3. Сниппет (кусок текста)
            snippet = ""
            snippet_tag = block.select_one(".doc-snippet, .snippet, .text-preview")
            if snippet_tag:
                snippet = snippet_tag.get_text().strip()
            
            # 4. Поиск даты в мета-информации для сортировки/валидации
            import re
            date_match = re.search(r'(\d{2}\.\d{2}\.\d{4})', meta_text + title + snippet)
            date_str = date_match.group(1) if date_match else ""

            return {
                "title": title,
                "url": url,
                "meta": meta_text,
                "snippet": snippet[:400] + "..." if len(snippet) > 400 else snippet,
                "date": date_str
            }
            
        except Exception as e:
            return None

    async def get_case_full(self, url: str) -> Optional[Dict[str, Any]]:
        """
        Получить полное дело по URL.

        Args:
            url: URL дела

        Returns:
            Полные данные дела
        """
        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(url, headers=self.headers)
                response.raise_for_status()
                
                return self._parse_case_full(response.text, url)
                
        except httpx.HTTPError as e:
            logger.error(f"Error fetching case: {str(e)}")
            return None

    def _parse_case_full(self, html: str, url: str) -> Optional[Dict[str, Any]]:
        """Парсинг полного текста дела."""
        try:
            soup = BeautifulSoup(html, "html.parser")
            
            # Заголовок
            title_tag = soup.find("h1")
            title = title_tag.text.strip() if title_tag else ""
            
            # Дата
            date_tag = soup.find("span", class_="doc-date")
            date = date_tag.text.strip() if date_tag else ""
            
            # Суд
            court_tag = soup.find("div", class_="doc-court")
            court = court_tag.text.strip() if court_tag else ""
            
            # Текст решения
            text_tag = soup.find("div", class_="doc-text")
            text = text_tag.text.strip() if text_tag else ""
            
            # Решение
            decision_tag = soup.find("div", class_="doc-decision")
            decision = decision_tag.text.strip() if decision_tag else ""
            
            return {
                "title": title,
                "url": url,
                "date": date,
                "court": court,
                "text": text,
                "decision": decision,
            }
            
        except Exception as e:
            logger.error(f"Error parsing full case: {str(e)}")
            return None


# Singleton instance
sudact_parser = SudactParser()
