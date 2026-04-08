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
    SEARCH_URL = f"{BASE_URL}/regular/doc/"

    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        }

    async def search_cases(
        self,
        query: str,
        court_type: Optional[str] = None,
        case_type: Optional[str] = None,
        limit: int = 10,
    ) -> List[Dict[str, Any]]:
        """
        Поиск судебных дел.

        Args:
            query: Поисковый запрос
            court_type: Тип суда (general, arbitrazh, etc.)
            case_type: Тип дела (civil, criminal, administrative)
            limit: Количество результатов

        Returns:
            Список дел
        """
        params = {
            "q": query,
            "sort": "date:desc",
        }

        if court_type:
            params["court_type"] = court_type
        if case_type:
            params["case_type"] = case_type

        try:
            async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
                response = await client.get(
                    self.SEARCH_URL,
                    params=params,
                    headers=self.headers,
                )
                response.raise_for_status()
                
                return self._parse_search_results(response.text)
                
        except httpx.HTTPError as e:
            logger.error(f"Error searching cases: {str(e)}")
            return []

    def _parse_search_results(self, html: str) -> List[Dict[str, Any]]:
        """Парсинг результатов поиска."""
        try:
            soup = BeautifulSoup(html, "html.parser")
            results = []

            # Try multiple selectors
            selectors = [
                ("div", {"class": "doc-block"}),
                ("div", {"class": "doc"}),
                ("div", {"class": "search-result"}),
                ("li", {"class": "search-result"}),
                ("div", {"class": "item"}),
            ]

            doc_blocks = []
            for tag, attrs in selectors:
                doc_blocks = soup.find_all(tag, attrs)
                if doc_blocks:
                    break

            # Fallback: find all links that look like document links
            if not doc_blocks:
                links = soup.find_all("a", href=True)
                for link in links:
                    href = link.get("href", "")
                    text = link.text.strip()
                    if ("/regular/doc/" in href or "/arbitr/doc/" in href) and len(text) > 10:
                        results.append({
                            "title": text,
                            "url": href if href.startswith("http") else urljoin(self.BASE_URL, href),
                            "meta": "",
                            "snippet": "",
                        })
                        if len(results) >= 10:
                            break
                return results

            for block in doc_blocks[:10]:
                case_data = self._extract_case_data(block)
                if case_data and case_data.get('title'):
                    results.append(case_data)

            return results

        except Exception as e:
            logger.error(f"Error parsing search results: {str(e)}")
            return []

    def _extract_case_data(self, block: BeautifulSoup) -> Optional[Dict[str, Any]]:
        """Извлечение данных дела из блока."""
        try:
            # Заголовок
            title_tag = block.find("a", class_="doc-title")
            if not title_tag:
                title_tag = block.find("h3")
            
            title = title_tag.text.strip() if title_tag else "Без названия"
            url = title_tag.get("href", "") if title_tag else ""
            if url and not url.startswith("http"):
                url = urljoin(self.BASE_URL, url)
            
            # Мета данные
            meta_tag = block.find("div", class_="doc-meta")
            meta_text = meta_tag.text.strip() if meta_tag else ""
            
            # Краткое содержание
            snippet_tag = block.find("div", class_="doc-snippet")
            snippet = snippet_tag.text.strip() if snippet_tag else ""
            
            return {
                "title": title,
                "url": url,
                "meta": meta_text,
                "snippet": snippet,
            }
            
        except Exception as e:
            logger.error(f"Error extracting case data: {str(e)}")
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
