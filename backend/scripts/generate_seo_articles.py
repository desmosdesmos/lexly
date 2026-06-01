import asyncio
import aiosqlite
import json
import logging
import os
import sys
import uuid
from datetime import datetime

# Добавляем путь к приложению, чтобы импортировать ai_service
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.ai_service import ai_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Список ключевых слов для генерации статей
KEYWORDS = [
    "Как вернуть деньги за онлайн-курс 2026",
    "Претензия к Wildberries за утерю товара образец",
    "Как обжаловать штраф МАДИ за парковку на газоне",
    "Возврат бракованного смартфона в магазин советы юриста",
    "Штрафы Ozon для селлеров как оспорить",
    "Досудебная претензия по защите прав потребителей 2026",
    "Как написать жалобу в ГИБДД онлайн",
    "Взыскание ущерба с маркетплейса через суд",
    "Права потребителя при возврате товара в интернет-магазин",
    "Образец претензии застройщику за задержку сдачи дома"
]

def slugify(text):
    """Простая функция для создания slug из кириллицы."""
    symbols = (u"абвгдеёжзийклмнопрстуфхцчшщъыьэюя ",
               u"abvgdeezzijklmnoprstufhzcss_y_eua-")
    tr = {ord(a): ord(b) for a, b in zip(*symbols)}
    text = text.lower().translate(tr)
    import re
    return re.sub(r'[^a-z0-9-]', '', text).strip('-')

async def generate_article(keyword):
    """Генерация SEO-статьи через ИИ."""
    logger.info(f"Generating article for keyword: {keyword}")
    
    system_prompt = """Ты — эксперт по юридическому контент-маркетингу и SEO. 
Твоя задача — написать полезную, экспертную статью на заданную тему.
Статья должна быть написана простым языком для людей, но содержать точные ссылки на законы РФ (2026 год).

ФОРМАТ СТАТЬИ (Markdown):
1. Заголовок H1 (включает ключевое слово).
2. Мета-описание (1-2 предложения для Google/Yandex).
3. Введение (почему это важно).
4. Основная часть с подзаголовками H2.
5. Конкретный алгоритм действий (Step-by-step).
6. Заключение с призывом воспользоваться ИИ-юристом LAXLY для генерации нужного документа.

ПРАВИЛА:
- Никакой воды.
- Больше списков и структуры.
- Использовать статьи ГК РФ и ЗОПП.
"""
    
    user_prompt = f"Напиши SEO-статью на тему: '{keyword}'. Верни ответ СТРОГО в формате JSON: {{'title': '...', 'meta_description': '...', 'content': '...'}}"
    
    try:
        result = await ai_service.generate_json(system_prompt, user_prompt)
        return result
    except Exception as e:
        logger.error(f"Error generating article for {keyword}: {str(e)}")
        return None

async def main():
    db_path = os.path.join(os.path.dirname(__file__), "..", "law_ai_agent.db")
    
    async with aiosqlite.connect(db_path) as db:
        # Создаем таблицу, если ее нет (на случай если миграция не прошла)
        await db.execute('''
            CREATE TABLE IF NOT EXISTS seo_articles (
                id TEXT PRIMARY KEY,
                slug TEXT UNIQUE NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                meta_description TEXT,
                views_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        await db.commit()

        for kw in KEYWORDS:
            article_data = await generate_article(kw)
            if not article_data:
                continue
                
            article_id = str(uuid.uuid4())
            slug = slugify(kw)
            
            try:
                await db.execute(
                    "INSERT INTO seo_articles (id, slug, title, content, meta_description) VALUES (?, ?, ?, ?, ?)",
                    (article_id, slug, article_data['title'], article_data['content'], article_data['meta_description'])
                )
                await db.commit()
                logger.info(f"✅ Article saved: {slug}")
            except Exception as e:
                logger.error(f"Failed to save article {slug}: {str(e)}")

if __name__ == "__main__":
    asyncio.run(main())
