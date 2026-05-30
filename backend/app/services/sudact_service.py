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

# Mappings of court endpoints and parameter prefixes on sudact.ru
COURT_MAPPINGS = {
    "arbitral": {
        "name": "Арбитражные суды",
        "path": "arbitral",
        "param": "arbitral-txt"
    },
    "regular": {
        "name": "Суды общей юрисдикции",
        "path": "regular",
        "param": "regular-txt"
    },
    "magistrate": {
        "name": "Мировые судьи",
        "path": "magistrate",
        "param": "magistrate-txt"
    },
    "vsrf": {
        "name": "Верховный Суд РФ",
        "path": "vsrf",
        "param": "vsrf-txt"
    }
}

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
            targets = ["arbitral"]
        elif court_type == "general":
            targets = ["regular"]
        elif court_type == "vsrf":
            targets = ["vsrf"]
        else:
            targets = list(COURT_MAPPINGS.keys())

        async with httpx.AsyncClient(
            timeout=20.0,
            follow_redirects=True,
            headers=HTTP_HEADERS,
        ) as client:
            for target in targets:
                if len(cases) >= limit:
                    break
                try:
                    mapping = COURT_MAPPINGS[target]
                    results = await self._search_endpoint(client, mapping, query)
                    for r in results:
                        if r["url"] not in seen_urls:
                            cases.append(r)
                            seen_urls.add(r["url"])
                except Exception as e:
                    logger.warning(f"sudact endpoint {target} error: {e}")

        return {
            "cases": cases[:limit],
            "no_results": len(cases) == 0,
            "search_url": search_url,
            "total_found": len(cases),
        }

    async def _search_endpoint(
        self,
        client: httpx.AsyncClient,
        mapping: Dict[str, str],
        query: str,
    ) -> List[Dict[str, Any]]:
        """Поиск на конкретном эндпоинте sudact.ru."""
        path = mapping["path"]
        param_name = mapping["param"]
        
        main_url = f"{SUDACT_BASE}/{path}/doc/"
        ajax_url = f"{SUDACT_BASE}/{path}/doc_ajax/"
        
        params = {
            param_name: query,
            f"{path}-date_from": "",
            f"{path}-date_to": "",
            "sort": "date:desc",
        }
        
        try:
            # 1. Загружаем основную страницу для инициализации сессии/кук
            await client.get(main_url, params=params)
            
            # 2. Выполняем AJAX запрос
            response = await client.get(ajax_url, params=params)
            if response.status_code != 200:
                return []
                
            data = response.json()
            content = data.get("content", "")
            if not content:
                return []
                
            return self._parse_html(content, main_url)
        except httpx.TimeoutException:
            logger.warning(f"Timeout on {path}")
            return []
        except Exception as e:
            logger.warning(f"Error requesting {path}: {e}")
            return []

    def _parse_html(self, html: str, base_url: str) -> List[Dict[str, Any]]:
        """
        Парсит HTML-сниппет результатов из AJAX-ответа sudact.ru.
        """
        results = []
        try:
            soup = BeautifulSoup(html, "html.parser")
            
            # В AJAX-ответе SudAct результаты обернуты в <ul class="results"> и каждый элемент в <li>
            ul = soup.find("ul", class_="results")
            items = ul.find_all("li") if ul else soup.find_all("li")
            
            for item in items:
                # 1. Поиск ссылки на документ
                link = item.find("a", href=re.compile(r"/doc/|/document/"))
                if not link:
                    continue
                    
                href = link.get("href", "")
                url = href if href.startswith("http") else urljoin(SUDACT_BASE, href)
                
                title = link.get_text(separator=" ", strip=True)
                title = re.sub(r'^\d+\.\s*', '', title)  # Убираем порядковый номер в начале
                
                # 2. Орган/мета-информация из <div class="b-justice">
                justice_div = item.find("div", class_="b-justice")
                meta = justice_div.get_text(separator=" ", strip=True) if justice_div else ""
                
                # 3. Извлечение сниппета (оставшийся текст в li)
                full_text = item.get_text(separator=" ", strip=True)
                snippet = full_text
                if title in snippet:
                    snippet = snippet.replace(title, "")
                if meta in snippet:
                    snippet = snippet.replace(meta, "")
                    
                # Очищаем сниппет от лишних символов
                snippet = re.sub(r'^\d+\.\s*', '', snippet)
                snippet = re.sub(r'\s+', ' ', snippet).strip()
                snippet = snippet[:400]
                
                # 4. Извлекаем дату (формат ДД.ММ.ГГГГ или словами "от 27 ноября 2025 г.")
                date_str = ""
                # Пробуем ДД.ММ.ГГГГ
                date_match = re.search(r"(\d{2}\.\d{2}\.\d{4})", meta + title + snippet)
                if date_match:
                    date_str = date_match.group(1)
                else:
                    # Пробуем словами: "от 27 ноября 2025 г."
                    months = {
                        "января": "01", "февраля": "02", "марта": "03", "апреля": "04",
                        "мая": "05", "июня": "06", "июля": "07", "августа": "08",
                        "сентября": "09", "октября": "10", "ноября": "11", "декабря": "12"
                    }
                    text_for_date = meta + " " + title + " " + snippet
                    word_date_match = re.search(
                        r"(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{4})",
                        text_for_date,
                        re.IGNORECASE
                    )
                    if word_date_match:
                        day = word_date_match.group(1).zfill(2)
                        mon = months.get(word_date_match.group(2).lower(), "01")
                        year = word_date_match.group(3)
                        date_str = f"{day}.{mon}.{year}"
                
                # Извлекаем название суда
                court = ""
                if meta:
                    if " - " in meta:
                        court = meta.split(" - ")[0].strip()
                    else:
                        court = meta.strip()
                if not court:
                    court = self._court_from_url(url)
                    
                results.append({
                    "title": title,
                    "url": url,
                    "meta": meta,
                    "snippet": snippet,
                    "date": date_str,
                    "court": court,
                })
        except Exception as e:
            logger.error(f"sudact parse error: {e}")
            
        return results

    def _court_from_url(self, url: str) -> str:
        """Определить тип суда по URL."""
        if "/arbitr" in url:
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
            mapping = COURT_MAPPINGS["arbitral"]
        elif court_type == "vsrf":
            mapping = COURT_MAPPINGS["vsrf"]
        elif court_type == "general":
            mapping = COURT_MAPPINGS["regular"]
        else:
            mapping = COURT_MAPPINGS["regular"]
        return f"{SUDACT_BASE}/{mapping['path']}/doc/?{mapping['param']}={quote_plus(query)}&sort=date:desc"

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
