"""
Сервис для получения актуальных данных о законодательстве РФ
через официальные открытые источники:
  1. publication.pravo.gov.ru — официальный портал правовой информации (основной)
  2. kremlin.ru RSS — указы президента и федеральные законы
  3. duma.gov.ru RSS — законопроекты Государственной Думы
  4. government.ru RSS — постановления Правительства РФ
  5. cbr.ru RSS — нормативы ЦБ (опционально)
"""
import httpx
import logging
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from urllib.parse import urlencode, urljoin
import re

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Константы
# ─────────────────────────────────────────────────────────────────────────────

PRAVO_API_BASE = "http://publication.pravo.gov.ru/api"
PRAVO_DOC_VIEW = "http://publication.pravo.gov.ru/Document/View"

# RSS-ленты официальных органов (без авторизации)
RSS_FEEDS = {
    "kremlin": "http://kremlin.ru/events/president/news/feed",
    "government": "http://government.ru/news/rss/",
    "duma": "http://duma.gov.ru/news/rss/",
    "pravo_news": "http://publication.pravo.gov.ru/rss/",
    "cbr": "https://cbr.ru/rss/press/",
    "fns": "https://www.nalog.gov.ru/rss/",
    "mintrud": "http://mintrud.gov.ru/events/rss",
    "mineconom": "http://economy.gov.ru/news/rss",
}

# Категории документов для pravo.gov.ru API
DOC_TYPES = {
    "Все": None,
    "Федеральный конституционный закон": "0001",
    "Федеральный закон": "0002",
    "Указ Президента": "0003",
    "Постановление Правительства": "0004",
    "Распоряжение Правительства": "0005",
    "Приказ Министерства": "0006",
}

HTTP_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9",
}


# ─────────────────────────────────────────────────────────────────────────────
# Основной сервис
# ─────────────────────────────────────────────────────────────────────────────

class PravoService:
    """
    Агрегатор нормативно-правовых актов РФ из официальных источников.
    Использует только публичные API и RSS без авторизации.
    """

    async def get_latest_laws(self, limit: int = 30, days_back: int = 90) -> List[Dict[str, Any]]:
        """
        Получить список последних НПА из нескольких источников.
        Объединяет данные pravo.gov.ru + RSS официальных органов.
        """
        all_docs: List[Dict[str, Any]] = []
        seen_titles: set = set()

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=HTTP_HEADERS) as client:
            # 1. Официальный портал pravo.gov.ru — самый надёжный источник
            pravo_docs = await self._fetch_pravo_api(client, limit=min(limit, 30), days_back=days_back)
            for doc in pravo_docs:
                key = doc.get("title", "")[:60]
                if key not in seen_titles:
                    all_docs.append(doc)
                    seen_titles.add(key)

            # 2. Дополняем из RSS официальных органов
            rss_items = await self._fetch_all_rss(client, limit=limit)
            for item in rss_items:
                key = item.get("title", "")[:60]
                if key not in seen_titles:
                    all_docs.append(item)
                    seen_titles.add(key)

        # Сортируем по дате (новые первые)
        all_docs.sort(key=lambda x: x.get("date_sort", ""), reverse=True)
        return all_docs[:limit]

    async def search_laws(self, query: str, limit: int = 30) -> List[Dict[str, Any]]:
        """
        Поиск НПА по ключевым словам через pravo.gov.ru API.
        """
        all_docs: List[Dict[str, Any]] = []
        seen_titles: set = set()

        async with httpx.AsyncClient(timeout=20.0, follow_redirects=True, headers=HTTP_HEADERS) as client:
            # 1. Поиск через pravo.gov.ru
            pravo_results = await self._search_pravo_api(client, query=query, limit=min(limit, 30))
            for doc in pravo_results:
                key = doc.get("title", "")[:60]
                if key not in seen_titles:
                    all_docs.append(doc)
                    seen_titles.add(key)

            # 2. Если pravo дал мало результатов — добавляем из RSS с фильтрацией
            if len(all_docs) < 5:
                rss_items = await self._fetch_all_rss(client, limit=200)
                query_words = [w.lower() for w in query.split() if len(w) > 2]
                for item in rss_items:
                    title_low = item.get("title", "").lower()
                    desc_low = item.get("description", "").lower()
                    if any(w in title_low or w in desc_low for w in query_words):
                        key = item.get("title", "")[:60]
                        if key not in seen_titles:
                            all_docs.append(item)
                            seen_titles.add(key)

        all_docs.sort(key=lambda x: x.get("date_sort", ""), reverse=True)
        return all_docs[:limit]

    # ─── PRAVO.GOV.RU API ────────────────────────────────────────────────────

    async def _fetch_pravo_api(
        self,
        client: httpx.AsyncClient,
        limit: int = 30,
        days_back: int = 90,
    ) -> List[Dict[str, Any]]:
        """Получить документы через JSON API publication.pravo.gov.ru."""
        results = []
        date_from = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%d")
        date_to = datetime.now().strftime("%Y-%m-%d")

        params = {
            "pageSize": min(limit, 20),
            "pageNumber": 1,
            "DateFrom": date_from,
            "DateTo": date_to,
            "SignatoryAuthorityId": "",  # все органы
            "DocumentKindId": "",        # все типы
        }

        try:
            url = f"{PRAVO_API_BASE}/Documents"
            response = await client.get(url, params=params)
            if response.status_code != 200:
                logger.warning(f"pravo.gov.ru API returned {response.status_code}")
                return results

            data = response.json()
            items = data if isinstance(data, list) else data.get("items", data.get("Documents", []))

            for item in items:
                doc = self._normalize_pravo_doc(item)
                if doc:
                    results.append(doc)

        except Exception as e:
            logger.error(f"pravo.gov.ru API error: {e}")

        return results

    async def _search_pravo_api(
        self,
        client: httpx.AsyncClient,
        query: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        """Поиск через API pravo.gov.ru."""
        results = []
        try:
            params = {
                "pageSize": limit,
                "pageNumber": 1,
                "Text": query,
            }
            url = f"{PRAVO_API_BASE}/Documents"
            response = await client.get(url, params=params)
            if response.status_code == 200:
                data = response.json()
                items = data if isinstance(data, list) else data.get("items", data.get("Documents", []))
                for item in items:
                    doc = self._normalize_pravo_doc(item)
                    if doc:
                        results.append(doc)
        except Exception as e:
            logger.error(f"pravo.gov.ru search error: {e}")

        return results

    def _normalize_pravo_doc(self, item: dict) -> Optional[Dict[str, Any]]:
        """
        Нормализовать документ из pravo.gov.ru API.
        Реальные поля API (проверено 30.05.2026):
          eoNumber, name, complexName, number, documentDate,
          viewDate, publishDateShort, id, signatoryAuthorityId, documentTypeId
        """
        try:
            import re as _re

            # ── ID для построения URL (eoNumber вида 0001202605300029) ──
            eo_number = item.get("eoNumber") or item.get("EoNumber") or ""
            doc_uuid  = item.get("id") or item.get("Id") or ""

            # ── Название ──
            # complexName содержит "Указ Президента РФ от 30.05.2026 № 362\n \"О внесении...\""
            # name — короткое ("О внесении изменения...")
            complex_name = item.get("complexName") or item.get("ComplexName") or ""
            short_name   = item.get("name") or item.get("Name") or ""
            title_raw    = item.get("title") or item.get("Title") or ""

            # Удаляем HTML-теги из title
            clean_title = _re.sub(r'<[^>]+>', ' ', title_raw or complex_name or short_name).strip()
            # Убираем лишние пробелы/переносы
            clean_title = _re.sub(r'\s+', ' ', clean_title).strip()

            if not clean_title or len(clean_title) < 5:
                return None

            # ── Дата ──
            # viewDate = "30.05.2026" (уже форматирован), documentDate = ISO
            view_date    = item.get("viewDate") or ""
            doc_date_iso = item.get("documentDate") or item.get("publishDateShort") or ""

            if view_date:                           # "30.05.2026"
                date_str  = view_date
                date_sort = self._parse_date_to_sort(view_date)
            elif doc_date_iso:                      # "2026-05-30T00:00:00"
                date_str  = self._parse_date_to_str(doc_date_iso)
                date_sort = self._parse_date_to_sort(doc_date_iso)
            else:
                date_str  = ""
                date_sort = ""

            # ── Номер документа ──
            number = item.get("number") or item.get("Number") or ""

            # ── Тип документа — извлекаем из complexName ──
            doc_type = self._guess_doc_type(clean_title, "pravo_news")
            if complex_name:
                for kw in ("Федеральный конституционный закон", "Федеральный закон",
                           "Указ Президента", "Постановление Правительства",
                           "Распоряжение Правительства", "Приказ"):
                    if kw.lower() in complex_name.lower():
                        doc_type = kw
                        break

            # ── URL — приоритет eoNumber, затем UUID ──
            if eo_number:
                url = f"{PRAVO_DOC_VIEW}/{eo_number}"
            elif doc_uuid:
                url = f"{PRAVO_DOC_VIEW}/{doc_uuid}"
            else:
                url = ""

            # ── Описание (аннотация если есть, иначе короткое имя) ──
            description = (
                item.get("Annotation") or item.get("annotation") or
                item.get("Description") or item.get("description") or
                short_name or ""
            ).strip()
            description = _re.sub(r'<[^>]+>', ' ', description)
            description = _re.sub(r'\s+', ' ', description).strip()

            return {
                "title":     clean_title,
                "url":       url,
                "date":      date_str,
                "date_sort": date_sort,
                "number":    number,
                "doc_type":  doc_type,
                "authority": "",          # нет в базовом ответе API
                "description": description[:500],
                "source":    "pravo.gov.ru",
            }
        except Exception as e:
            logger.debug(f"Error normalizing pravo doc: {e}")
            return None

    # ─── RSS-АГРЕГАЦИЯ ────────────────────────────────────────────────────────

    async def _fetch_all_rss(
        self,
        client: httpx.AsyncClient,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """Получить и объединить данные из всех RSS-источников."""
        all_items: List[Dict[str, Any]] = []
        per_feed = max(10, limit // len(RSS_FEEDS))

        for source_name, rss_url in RSS_FEEDS.items():
            try:
                response = await client.get(rss_url, timeout=8.0)
                if response.status_code == 200:
                    items = self._parse_rss(response.text, source_name)
                    all_items.extend(items[:per_feed])
            except Exception as e:
                logger.debug(f"RSS {source_name} error: {e}")

        return all_items

    def _parse_rss(self, xml_text: str, source: str) -> List[Dict[str, Any]]:
        """Распарсить RSS-ленту в унифицированный формат."""
        items = []
        try:
            # Убираем namespace-проблемы
            xml_text = re.sub(r' xmlns[^"]*"[^"]*"', '', xml_text)
            root = ET.fromstring(xml_text)

            channel = root.find("channel") or root
            for item_el in channel.findall("item"):
                title = self._xml_text(item_el, "title")
                link = self._xml_text(item_el, "link")
                description = self._xml_text(item_el, "description")
                pub_date = self._xml_text(item_el, "pubDate")

                if not title or len(title) < 10:
                    continue

                # Очищаем HTML из описания
                description = re.sub(r'<[^>]+>', ' ', description).strip()
                description = re.sub(r'\s+', ' ', description)[:500]

                date_str = self._parse_rfc2822_date(pub_date)
                date_sort = self._parse_rfc2822_to_sort(pub_date)

                items.append({
                    "title": title.strip(),
                    "url": link.strip() if link else "",
                    "date": date_str,
                    "date_sort": date_sort,
                    "number": "",
                    "doc_type": self._guess_doc_type(title, source),
                    "authority": self._source_to_authority(source),
                    "description": description,
                    "source": self._source_to_label(source),
                })
        except Exception as e:
            logger.debug(f"RSS parse error ({source}): {e}")

        return items

    # ─── ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ───────────────────────────────────────────────

    def _xml_text(self, el: ET.Element, tag: str) -> str:
        """Безопасно получить текст дочернего элемента."""
        child = el.find(tag)
        return (child.text or "").strip() if child is not None else ""

    def _parse_date_to_str(self, raw: str) -> str:
        """Форматировать дату из ISO / различных форматов."""
        if not raw:
            return datetime.now().strftime("%d.%m.%Y")
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(raw[:19], fmt).strftime("%d.%m.%Y")
            except:
                continue
        return raw[:10]

    def _parse_date_to_sort(self, raw: str) -> str:
        """Форматировать дату для сортировки (ISO)."""
        if not raw:
            return datetime.now().strftime("%Y-%m-%d")
        for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d"):
            try:
                return datetime.strptime(raw[:10], fmt).strftime("%Y-%m-%d")
            except:
                continue
        return raw[:10]

    def _parse_rfc2822_date(self, raw: str) -> str:
        """Распарсить дату из RFC 2822 (формат RSS)."""
        if not raw:
            return datetime.now().strftime("%d.%m.%Y")
        # Пробуем несколько форматов RSS
        for fmt in (
            "%a, %d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S %Z",
            "%d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S",
        ):
            try:
                dt = datetime.strptime(raw.strip(), fmt)
                return dt.strftime("%d.%m.%Y")
            except:
                continue
        # Ищем дату регуляркой
        m = re.search(r'(\d{1,2})\s+(\w+)\s+(\d{4})', raw)
        if m:
            month_map = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
                'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
                'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
                'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
            }
            mon = month_map.get(m.group(2), '01')
            return f"{m.group(1).zfill(2)}.{mon}.{m.group(3)}"
        return datetime.now().strftime("%d.%m.%Y")

    def _parse_rfc2822_to_sort(self, raw: str) -> str:
        """Получить дату RFC 2822 в формате YYYY-MM-DD для сортировки."""
        if not raw:
            return datetime.now().strftime("%Y-%m-%d")
        for fmt in (
            "%a, %d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S %Z",
            "%d %b %Y %H:%M:%S %z",
            "%a, %d %b %Y %H:%M:%S",
        ):
            try:
                dt = datetime.strptime(raw.strip(), fmt)
                return dt.strftime("%Y-%m-%d")
            except:
                continue
        m = re.search(r'(\d{1,2})\s+(\w+)\s+(\d{4})', raw)
        if m:
            month_map = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
                'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
                'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
                'января': '01', 'февраля': '02', 'марта': '03', 'апреля': '04',
                'мая': '05', 'июня': '06', 'июля': '07', 'августа': '08',
                'сентября': '09', 'октября': '10', 'ноября': '11', 'декабря': '12',
            }
            mon = month_map.get(m.group(2), '01')
            return f"{m.group(3)}-{mon}-{m.group(1).zfill(2)}"
        return datetime.now().strftime("%Y-%m-%d")

    def _guess_doc_type(self, title: str, source: str) -> str:
        """Определить тип документа по заголовку и источнику."""
        t = title.lower()
        if "федеральный закон" in t or "фз" in t:
            return "Федеральный закон"
        if "указ" in t:
            return "Указ Президента"
        if "постановление правительства" in t:
            return "Постановление Правительства"
        if "приказ" in t:
            return "Приказ"
        if "распоряжение" in t:
            return "Распоряжение"
        if "законопроект" in t or "проект" in t:
            return "Законопроект"
        if "кодекс" in t:
            return "Кодекс"
        source_map = {
            "kremlin": "Акт Президента",
            "government": "Акт Правительства",
            "duma": "Законопроект",
            "cbr": "Акт ЦБ РФ",
            "fns": "Акт ФНС",
            "mintrud": "Акт Минтруда",
            "mineconom": "Акт Минэкономразвития",
            "pravo_news": "НПА",
        }
        return source_map.get(source, "НПА")

    def _source_to_authority(self, source: str) -> str:
        authority_map = {
            "kremlin": "Президент РФ",
            "government": "Правительство РФ",
            "duma": "Государственная Дума",
            "cbr": "Банк России",
            "fns": "ФНС России",
            "mintrud": "Минтруд России",
            "mineconom": "Минэкономразвития России",
            "pravo_news": "Официальный портал правовой информации",
        }
        return authority_map.get(source, "")

    def _source_to_label(self, source: str) -> str:
        label_map = {
            "kremlin": "kremlin.ru",
            "government": "government.ru",
            "duma": "duma.gov.ru",
            "cbr": "cbr.ru",
            "fns": "nalog.gov.ru",
            "mintrud": "mintrud.gov.ru",
            "mineconom": "economy.gov.ru",
            "pravo_news": "pravo.gov.ru",
        }
        return label_map.get(source, source)


# Singleton instance
pravo_service = PravoService()
