"""AI сервис для работы с GigaChat, GROQ и OpenAI API."""
import json
import logging
import base64
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta

import httpx
from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


class GigaChatClient:
    """Клиент для работы с GigaChat API через официальный SDK."""

    def __init__(self):
        """Инициализация GigaChat клиента через SDK."""
        from gigachat import GigaChat

        # Создаем base64 credentials
        credentials = base64.b64encode(
            f"{settings.GIGACHAT_CLIENT_ID}:{settings.GIGACHAT_CLIENT_SECRET}".encode("utf-8")
        ).decode("utf-8")

        self.client = GigaChat(
            credentials=credentials,
            scope=settings.GIGACHAT_SCOPE,
            verify_ssl_certs=False,
            model=settings.GIGACHAT_MODEL,
            timeout=180,  # 3 минуты таймаут
        )
        self.model = settings.GIGACHAT_MODEL
        self.max_tokens = settings.GIGACHAT_MAX_TOKENS
        self.temperature = settings.GIGACHAT_TEMPERATURE

        logger.info(f"GigaChat client initialized with model: {self.model}, timeout=180s")

    async def chat_completions(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 8192,
    ) -> str:
        """
        Выполнить запрос к GigaChat API.

        Args:
            messages: Список сообщений (role, content)
            temperature: Температура генерации
            max_tokens: Максимальное количество токенов

        Returns:
            Текст ответа
        """
        from gigachat.models import Chat, Messages
        
        # Конвертируем сообщения в формат GigaChat
        gc_messages = [
            Messages(role=msg["role"], content=msg["content"])
            for msg in messages
        ]
        
        chat = Chat(messages=gc_messages)
        
        try:
            # SDK синхронный, запускаем в executor с таймаутом
            import asyncio
            loop = asyncio.get_event_loop()
            
            # Уменьшаем max_tokens для ускорения
            actual_max_tokens = min(max_tokens, 4096)
            
            response = await asyncio.wait_for(
                loop.run_in_executor(None, lambda: self.client.chat(chat)),
                timeout=180.0  # 3 минуты
            )
            
            if not response.choices:
                raise ValueError("GigaChat вернул пустой ответ")
            
            content = response.choices[0].message.content
            if not content:
                raise ValueError("GigaChat вернул пустое содержимое")
            
            return content
            
        except Exception as e:
            logger.error(f"GigaChat generation error: {str(e)}")
            raise


class AIService:
    """Сервис для работы с AI провайдером (GigaChat/GROQ/OpenAI)."""

    def __init__(self):
        """Инициализация AI клиента."""
        self.gigachat_client = None
        self.openai_client = None
        self.model = None
        self.max_tokens = None
        self.temperature = None

        if settings.AI_PROVIDER == "gigachat":
            self.gigachat_client = GigaChatClient()
            self.model = settings.GIGACHAT_MODEL
            self.max_tokens = settings.GIGACHAT_MAX_TOKENS
            self.temperature = settings.GIGACHAT_TEMPERATURE
            logger.info(f"AI Provider: GigaChat, Model: {self.model}")
        elif settings.AI_PROVIDER == "groq":
            self.openai_client = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url=settings.GROQ_BASE_URL,
                timeout=httpx.Timeout(timeout=120.0, connect=10.0),
            )
            self.model = settings.GROQ_MODEL
            self.max_tokens = settings.GROQ_MAX_TOKENS
            self.temperature = settings.GROQ_TEMPERATURE
            logger.info(f"AI Provider: GROQ, Model: {self.model}")
        else:
            # Fallback to OpenAI
            self.openai_client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
            )
            self.model = settings.OPENAI_MODEL
            self.max_tokens = settings.AI_MAX_TOKENS
            self.temperature = settings.AI_TEMPERATURE
            logger.info(f"AI Provider: OpenAI, Model: {self.model}")

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        response_format: Optional[Dict[str, str]] = None,
    ) -> str:
        """
        Сгенерировать ответ от AI.

        Args:
            system_prompt: Системный промпт (инструкции для AI)
            user_prompt: Пользовательский промпт (запрос)
            temperature: Температура генерации (0.0 - 1.0)
            max_tokens: Максимальное количество токенов
            response_format: Формат ответа ({"type": "json_object"} для JSON)

        Returns:
            Текст ответа
        """
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        temp = temperature if temperature is not None else self.temperature
        tokens = max_tokens if max_tokens is not None else self.max_tokens

        try:
            # GigaChat использует собственный клиент
            if self.gigachat_client:
                # GigaChat пока не поддерживает response_format напрямую
                # Поэтому просто добавляем инструкцию в промпт
                if response_format and response_format.get("type") == "json_object":
                    messages[-1]["content"] += "\n\nВАЖНО: Верни ответ СТРОГО в формате JSON."
                
                content = await self.gigachat_client.chat_completions(
                    messages=messages,
                    temperature=temp,
                    max_tokens=tokens,
                )
                logger.info(f"GigaChat request successful: {tokens} tokens max")
                return content
            else:
                # OpenAI-compatible клиенты (GROQ/OpenAI)
                kwargs = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": tokens,
                }

                if response_format:
                    kwargs["response_format"] = response_format

                response = await self.openai_client.chat.completions.create(**kwargs)

                if not response.choices:
                    raise ValueError("AI вернул пустой ответ")

                content = response.choices[0].message.content

                if not content:
                    raise ValueError("AI вернул пустое содержимое")

                logger.info(f"AI request successful: {response.usage.total_tokens if response.usage else 'unknown'} tokens used")
                return content

        except Exception as e:
            logger.error(f"AI generation error: {str(e)}")
            raise

    async def generate_json(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Сгенерировать JSON ответ от AI.

        Args:
            system_prompt: Системный промпт
            user_prompt: Пользовательский промпт
            temperature: Температура генерации
            max_tokens: Максимальное количество токенов

        Returns:
            Распарсенный JSON ответ
        """
        response_text = await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        
        try:
            # Очищаем ответ от markdown форматирования
            cleaned_text = response_text.strip()
            
            # Удаляем markdown блоки ```json ... ```
            if cleaned_text.startswith("```json"):
                cleaned_text = cleaned_text[7:]  # убираем ```json
            elif cleaned_text.startswith("```"):
                cleaned_text = cleaned_text[3:]  # убираем ```
            
            if cleaned_text.endswith("```"):
                cleaned_text = cleaned_text[:-3]  # убираем закрывающий ```
            
            cleaned_text = cleaned_text.strip()
            
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {response_text[:500]}")
            raise ValueError(f"AI вернул невалидный JSON: {str(e)}")

    async def generate_document(self, document_type: str, data: Dict[str, Any]) -> str:
        """
        Сгенерировать юридический документ.

        Args:
            document_type: Тип документа (claim, complaint, demand)
            data: Данные для генерации

        Returns:
            Текст документа
        """
        import os
        
        # Нормализуем тип документа
        dt = document_type.lower()
        if "claim" in dt:
            doc_type = "claim"
        elif "complaint" in dt:
            doc_type = "complaint"
        elif "demand" in dt:
            doc_type = "demand"
        else:
            doc_type = "claim"
        
        # Путь к промпту относительно backend директории
        base_dir = os.getcwd()
        prompt_file = os.path.join(base_dir, "..", "prompts", "document-generator", f"{doc_type}.txt")
        
        try:
            with open(prompt_file, "r", encoding="utf-8") as f:
                template = f.read()
        except FileNotFoundError:
            raise ValueError(f"Промпт для документа '{document_type}' не найден")

        # Замена переменных в шаблоне
        user_prompt = template
        for key, value in data.items():
            placeholder = f"{{{{{key.upper()}}}}}"
            if isinstance(value, list):
                value = "\n".join(f"- {item}" for item in value)
            elif isinstance(value, dict):
                value = json.dumps(value, ensure_ascii=False, indent=2)
            user_prompt = user_prompt.replace(placeholder, str(value))

        # Системный промпт для генерации документов
        system_prompt = """Ты — профессиональный AI-юрист, специализирующийся на российском законодательстве.
Твоя задача — составлять юридически грамотные документы.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реальные, действующие нормы права РФ.
2. НИКОГДА не выдумывай статьи, законы или судебные решения.
3. Если не уверен в конкретной статье — используй общие формулировки без ссылок на статьи.
4. Все ссылки на законы должны быть проверены и актуальны на 2026 год.
5. Используй официальный юридический стиль.
6. НЕ добавляй вымышленные факты."""

        return await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=8192,
        )

    async def review_contract(self, contract_text: str) -> Dict[str, Any]:
        """
        Проанализировать договор на риски.

        Args:
            contract_text: Текст договора для анализа

        Returns:
            Структурированный анализ с рисками
        """
        import os
        
        # Путь к промпту относительно backend директории
        base_dir = os.getcwd()
        prompt_file = os.path.join(base_dir, "..", "prompts", "contract-reviewer", "analysis.txt")
        
        try:
            with open(prompt_file, "r", encoding="utf-8") as f:
                template = f.read()
        except FileNotFoundError:
            raise ValueError("Промпт для анализа договора не найден")

        user_prompt = template.replace("{{CONTRACT_TEXT}}", contract_text)

        system_prompt = """Ты — профессиональный AI-юрист-аналитик, специализирующийся на договорном праве РФ.
Твоя задача — анализировать договоры на наличие рисков и проблем.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Анализируй ТОЛЬКО на основе действующего законодательства РФ (2026 год).
2. НЕ выдумывай риски, которых нет в тексте.
3. Будь объективным и конкретным.
4. Все ссылки на законы должны быть реальными и актуальными.
5. Объясняй риски простым языком.
6. Возвращай СТРОГО JSON без дополнительного текста."""

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=8192,
        )

    async def analyze_court_practice(
        self,
        topic: str,
        additional_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Проанализировать судебную практику по теме.
        """
        system_prompt = """Ты — опытный AI-аналитик судебной практики РФ. Даёшь ДЕТАЛЬНЫЕ, ПОЛЕЗНЫЕ ответы.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Все прецеденты и законы — РЕАЛЬНЫЕ. НЕ выдумывай номера дел и статьи.
2. Если не знаешь точный номер дела — пиши "Обзор практики ВС РФ" без номера.
3. Для статей laws указывай url в формате: https://www.consultant.ru/document/cons_doc_LAW_X/ где X — номер кодекса (ГК=1994, ГПК=131, ТК=197)
4. Для прецедентов указывай url: https://vsrf.ru/lk/practice/ или https://sudact.ru/regular/doc/?q=ТЕМА
5. Анализируй практику 2021-2026 годов
6. Давай МНОГО конкретики: %, суммы, сроки

ФОРМАТ JSON (обязательно все поля!):
{
    "topic": "Тема анализа",
    "summary": "Подробное резюме 4-6 предложений с конкретными данными",
    "key_trends": ["Подробная тенденция 1 с примерами", "Тенденция 2", "Тенденция 3", "Тенденция 4", "Тенденция 5"],
    "typical_outcomes": ["Исход 1: в X% дел, суммы Y-Z руб, срок N мес", "Исход 2", "Исход 3"],
    "important_precedents": [
        {"description": "Подробное описание прецедента (3-4 предложения)", "court": "Пленум ВС РФ / Обзор практики ВС РФ", "year": 2024, "significance": "Почему это важно", "source_url": "https://sudact.ru/regular/doc/?q=ТЕМА", "law_url": "https://www.consultant.ru/document/cons_doc_LAW_1994/"}
    ],
    "laws": [{"name": "Ст. X ГК/ГПК/АПК РФ", "description": "Что регулирует и как применяется", "url": "https://www.consultant.ru/document/cons_doc_LAW_1994/"}],
    "recommendations": ["Подробная рекомендация 1 (2-3 предложения)", "Рекомендация 2", "Рекомендация 3", "Рекомендация 4"],
    "success_rate": 65,
    "risks": ["Подробный риск 1 с вероятностью", "Риск 2", "Риск 3"],
    "sources": [
        {"title": "Судебная практика ВС РФ", "url": "https://vsrf.ru/lk/practice/"},
        {"title": "Судебные решения РФ", "url": "https://sudact.ru/regular/doc/?q=ТЕМА"},
        {"title": "КонсультантПлюс", "url": "https://www.consultant.ru/"}
    ],
    "notes": "Важные примечания и ограничения"
}"""

        user_prompt = f"""ДЕТАЛЬНО проанализируй судебную практику РФ по теме: {topic}

Дай максимально ПОДРОБНЫЙ и ПОЛЕЗНЫЙ анализ для юриста-практика."""

        if additional_context:
            user_prompt += f"\n\nДополнительный контекст: {additional_context}"

        user_prompt += """\n\nВАЖНО:
1. Верни СТРОГО JSON.
2. Все данные должны быть реальными и проверенными.
3. Для КАЖДОГО прецедента и закона укажи прямую URL-ссылку на источник.
4. В массив sources включи все использованные источники."""

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=3072,  # Уменьшено для ускорения
        )

    async def monitor_legislation(self, topic: Optional[str] = None) -> Dict[str, Any]:
        """
        Проанализировать изменения в законодательстве.

        Args:
            topic: Тема мониторинга (опционально)

        Returns:
            Анализ изменений в законодательстве
        """
        system_prompt = """Ты — AI-эксперт по законодательству РФ. Отслеживаешь реальные изменения.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Только РЕАЛЬНЫЕ вступившие в силу законы. НЕ выдумывай номера, даты, изменения.
2. Если не знаешь точный номер закона — используй общие формулировки без номеров.
3. Для URL изменений используй: https://www.consultant.ru/document/cons_doc_LAW_X/ (X=номер закона)
4. Для источников: consultant.ru, garant.ru, pravo.gov.ru — реальные домены
5. Актуально на 2025-2026 год
6. Давай ПОДРОБНЫЕ описания

ФОРМАТ JSON (обязательно все поля!):
{
    "report_date": "2026-04-11",
    "summary": "Подробный обзор изменений 4-6 предложений",
    "changes": [
        {"id": 1, "title": "Полное название изменения", "law_number": "ФЗ-X от DD.MM.YYYY", "effective_date": "DD.MM.YYYY", "description": "Подробное описание что изменилось (3-4 предложения)", "impact": "Как влияет на граждан/бизнес", "affected_areas": ["Область 1", "Область 2"], "recommendations": "Что делать пользователям", "url": "https://www.consultant.ru/document/cons_doc_LAW_1994/"}
    ],
    "upcoming_changes": [
        {"title": "Что ожидается", "expected_date": "DD.MM.YYYY", "description": "Подробное описание", "url": "http://publication.pravo.gov.ru/"}
    ],
    "sources": [
        {"title": "КонсультантПлюс", "url": "https://www.consultant.ru/"},
        {"title": "Гарант", "url": "https://www.garant.ru/"},
        {"title": "Официальный портал", "url": "http://publication.pravo.gov.ru/"}
    ],
    "total_changes": 5
}"""

        user_prompt = "ДЕТАЛЬНО проанализируй последние изменения в законодательстве РФ."

        if topic:
            user_prompt = f"ДЕТАЛЬНО проанализируй изменения в законодательстве РФ по теме: {topic}"

        user_prompt += """\n\nВАЖНО: Только реальные законы. Подробные описания. Реальные ссылки."""

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=3072,  # Уменьшено для ускорения
        )


# Singleton instance
ai_service = AIService()
