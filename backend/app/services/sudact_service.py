"""
Сервис для поиска судебной практики.
Источники:
  1. sudact.ru — крупнейшая открытая база судебных решений РФ
  2. Если sudact недоступен — возвращаем честный флаг no_results=True
     и НЕ выдумываем ссылки.
"""
import httpx
import logging
import re
from typing import Dict, Any, List, Optional
from bs4 import BeautifulSoup
from urllib.parse import urljoin, quote_plus

logger = logging.getLogger(__name__)

SUDACT_BASE = "https://sudact.ru"

# Все эндпоинты поиска на sudact.ru
SUDACT_ENDPOINTS = [
    f"{SUDACT_BASE}/arbitr/doc/",    # Арбитражные суды
    f"{SUDACT_BASE}/regular/doc/",   # Суды общей юрисдикции
    f"{SUDACT_BASE}/magistrate/doc/", # Мировые судьи
    f"{SUDACT_BASE}/vsrf/doc/",      # Верховный Суд РФ
]

HTTP_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.5",
    "Referer": "https://sudact.ru/",
    "DNT": "1",
}


class SudactService:
    """
    Парсер судебной практики с sudact.ru.
    При неудаче возвращает no_results=True вместо выдуманных данных.
    """

    async def search_cases(
        self,
        query: str,
        court_type: Optional[str] = None,
        limit: int = 15,
    ) -> Dict[str, Any]:
        """
        Поиск судебных дел.

        Returns:
            {
                "cases": [...],
                "no_results": bool,    # True если реальных дел не найдено
                "search_url": str,     # Прямая ссылка на поиск для пользователя
                "total_found": int,
            }
        """
        # Строим URL для поиска (пользователь может кликнуть)
        search_url = self._build_search_url(query, court_type)

        cases: List[Dict[str, Any]] = []
        seen_urls: set = set()

        # Определяем какие эндпоинты обходить
        if court_type == "arbitrazh":
            endpoints = [f"{SUDACT_BASE}/arbitr/doc/"]
        elif court_type == "general":
            endpoints = [f"{SUDACT_BASE}/regular/doc/"]
        elif court_type == "vsrf":
            endpoints = [f"{SUDACT_BASE}/vsrf/doc/"]
        else:
            endpoints = SUDACT_ENDPOINTS  # Ищем везде

        async with httpx.AsyncClient(
            timeout=20.0,
            follow_redirects=True,
            headers=HTTP_HEADERS,
        ) as client:
            for endpoint in endpoints:
                if len(cases) >= limit:
                    break
                try:
                    results = await self._search_endpoint(client, endpoint, query, limit)
                    for r in results:
                        if r["url"] not in seen_urls:
                            cases.append(r)
                            seen_urls.add(r["url"])
                except Exception as e:
                    logger.warning(f"sudact endpoint {endpoint} error: {e}")

        return {
            "cases": cases[:limit],
            "no_results": len(cases) == 0,
            "search_url": search_url,
            "total_found": len(cases),
        }

    async def _search_endpoint(
        self,
        client: httpx.AsyncClient,
        endpoint: str,
        query: str,
        limit: int,
    ) -> List[Dict[str, Any]]:
        """Поиск на конкретном эндпоинте sudact.ru."""
        params = {
            "q": query,
            "sort": "date:desc",
        }
        try:
            response = await client.get(endpoint, params=params)
            if response.status_code != 200:
                return []
            return self._parse_html(response.text, endpoint)
        except httpx.TimeoutException:
            logger.warning(f"Timeout on {endpoint}")
            return []

    def _parse_html(self, html: str, base_url: str) -> List[Dict[str, Any]]:
        """
        Парсит страницу результатов sudact.ru.
        Работает с реальной структурой сайта по состоянию на 2025-2026.
        """
        results = []
        try:
            soup = BeautifulSoup(html, "html.parser")

            # === Стратегия 1: блоки результатов (основная вёрстка sudact) ===
            # sudact.ru использует div с классами, включающими "doc" или "result"
            blocks = soup.find_all("div", attrs={"data-id": True})
            if not blocks:
                # Стратегия 2: ищем по тегу article
                blocks = soup.find_all("article")
            if not blocks:
                # Стратегия 3: ищем секции с заголовком-ссылкой
                blocks = soup.find_all("li", class_=lambda c: c and "result" in c.lower())
            if not blocks:
                # Стратегия 4: ищем через контейнер поиска
                container = (
                    soup.find("div", class_="search-result") or
                    soup.find("div", id="search-results") or
                    soup.find("ul", class_="documents") or
                    soup.find("div", class_="documents")
                )
                if container:
                    blocks = container.find_all(["li", "div", "article"])

            # === Стратегия 5 (fallback): все ссылки на /doc/ страницы ===
            if not blocks:
                links = soup.find_all("a", href=re.compile(r"/doc/|/document/"))
                for link in links:
                    href = link.get("href", "")
                    title = link.get_text(strip=True)
                    if len(title) < 15:
                        continue
                    url = href if href.startswith("http") else urljoin(SUDACT_BASE, href)
                    results.append({
                        "title": title,
                        "url": url,
                        "meta": "",
                        "snippet": "",
                        "date": "",
                        "court": self._court_from_url(url),
                    })
                    if len(results) >= 20:
                        break
                return results

            for block in blocks:
                doc = self._extract_case_from_block(block, base_url)
                if doc:
                    results.append(doc)

        except Exception as e:
            logger.error(f"sudact parse error: {e}")

        return results

    def _extract_case_from_block(
        self, block: BeautifulSoup, base_url: str
    ) -> Optional[Dict[str, Any]]:
        """Извлечь данные одного дела из блока."""
        try:
            # Заголовок и URL
            link = (
                block.find("a", href=re.compile(r"/doc/|/document/")) or
                block.find("a", class_=re.compile(r"title|heading|name", re.I)) or
                block.find("h1 a") or block.find("h2 a") or block.find("h3 a") or
                block.find("h4 a") or block.find("a", href=True)
            )
            if not link:
                return None

            title = link.get_text(strip=True)
            if len(title) < 10:
                return None

            href = link.get("href", "")
            if not href:
                return None

            url = href if href.startswith("http") else urljoin(SUDACT_BASE, href)

            # Метаданные (суд, дата, судья)
            meta_el = block.find(class_=re.compile(r"meta|info|detail|date", re.I))
            meta_text = meta_el.get_text(separator=" ", strip=True) if meta_el else ""

            # Сниппет текста
            snippet_el = block.find(class_=re.compile(r"snippet|preview|text|summary", re.I))
            if not snippet_el:
                # Берём весь текст блока минус заголовок
                full_text = block.get_text(separator=" ", strip=True)
                snippet = full_text.replace(title, "").replace(meta_text, "").strip()
            else:
                snippet = snippet_el.get_text(separator=" ", strip=True)

            snippet = re.sub(r"\s+", " ", snippet)[:400]

            # Дата из метаданных
            date_match = re.search(r"(\d{2}\.\d{2}\.\d{4})", meta_text + title + snippet)
            date_str = date_match.group(1) if date_match else ""

            return {
                "title": title,
                "url": url,
                "meta": meta_text[:200],
                "snippet": snippet,
                "date": date_str,
                "court": self._court_from_url(url),
            }
        except Exception:
            return None

    def _court_from_url(self, url: str) -> str:
        """Определить тип суда по URL."""
        if "/arbitr/" in url:
            return "Арбитражный суд"
        if "/vsrf/" in url:
            return "Верховный Суд РФ"
        if "/magistrate/" in url:
            return "Мировой судья"
        if "/regular/" in url:
            return "Суд общей юрисдикции"
        return ""

    def _build_search_url(self, query: str, court_type: Optional[str]) -> str:
        """Строим прямую ссылку для поиска на sudact.ru."""
        if court_type == "arbitrazh":
            base = f"{SUDACT_BASE}/arbitr/doc/"
        elif court_type == "vsrf":
            base = f"{SUDACT_BASE}/vsrf/doc/"
        else:
            base = f"{SUDACT_BASE}/regular/doc/"
        return f"{base}?q={quote_plus(query)}&sort=date:desc"

    async def get_case_full(self, url: str) -> Optional[Dict[str, Any]]:
        """Получить полный текст дела по URL."""
        try:
            async with httpx.AsyncClient(
                timeout=20.0, follow_redirects=True, headers=HTTP_HEADERS
            ) as client:
                response = await client.get(url)
                if response.status_code != 200:
                    return None
                return self._parse_full_case(response.text, url)
        except Exception as e:
            logger.error(f"Error fetching case full: {e}")
            return None

    def _parse_full_case(self, html: str, url: str) -> Optional[Dict[str, Any]]:
        """Парсинг полного текста дела."""
        try:
            soup = BeautifulSoup(html, "html.parser")

            h1 = soup.find("h1")
            title = h1.get_text(strip=True) if h1 else ""

            # Попытки найти основной текст
            text_el = (
                soup.find("div", class_=re.compile(r"doc.text|document.text|content", re.I)) or
                soup.find("div", id=re.compile(r"doc.content|document", re.I)) or
                soup.find("article")
            )
            text = text_el.get_text(separator="\n", strip=True)[:5000] if text_el else ""

            # Суд
            court_el = soup.find(string=re.compile(r"Суд|Court", re.I))
            court = court_el.strip() if court_el else self._court_from_url(url)

            return {
                "title": title,
                "url": url,
                "text": text,
                "court": court,
            }
        except Exception:
            return None


# Singleton
sudact_service = SudactService()
# Обратная совместимость
sudact_parser = sudact_service
