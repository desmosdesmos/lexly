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
        Сгенерировать JSON ответ от AI с автоматическим исправлением ошибок.
        """
        response_text = await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        
        cleaned_text = response_text.strip()
        
        # 1. Базовая очистка от markdown
        if cleaned_text.startswith("```"):
            # Находим начало JSON
            json_start = cleaned_text.find("{")
            json_end = cleaned_text.rfind("}")
            if json_start != -1 and json_end != -1:
                cleaned_text = cleaned_text[json_start:json_end+1]
        
        # 2. Попытка исправить распространенные ошибки AI
        def repair_json_logic(text):
            import re
            # Удаляем лишние запятые перед закрывающими скобками
            text = re.sub(r',\s*([}\]])', r'\1', text)
            # Исправляем неэкранированные кавычки внутри строк (базовая попытка)
            # Это сложно сделать идеально без полноценного парсера, 
            # но мы можем попробовать найти кавычки, которые не являются разделителями
            return text

        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError:
            try:
                # Вторая попытка с исправлением запятых
                repaired = repair_json_logic(cleaned_text)
                return json.loads(repaired)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response. Error: {str(e)}\nRaw: {response_text[:1000]}")
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
        additional_context: Optional[str] = None,
        real_cases: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Профессиональный экспертный анализ судебной практики.
        """
        system_prompt = """Ты — СТАРШИЙ AI-ЮРИСТ-АНАЛИТИК с экспертизой в праве РФ. 
Твоя задача: предоставить МАКСИМАЛЬНО ПОДРОБНЫЙ, ТЕХНИЧЕСКИЙ и АКТУАЛЬНЫЙ анализ судебной практики.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. АКТУАЛЬНОСТЬ 2024-2026: Игнорируй старую практику, если она противоречит новым позициям ВС РФ и изменениям в ГК/ГПК/АПК.
2. ГЛУБОКИЙ АНАЛИЗ ПРЕЦЕДЕНТОВ: Не просто перечисляй дела, а объясняй ПРАВОВУЮ ЛОГИКУ суда (ratio decidendi). Почему суд решил именно так?
3. ТЕХНИЧЕСКИЕ ДЕТАЛИ: Указывай конкретные статьи, пункты Постановлений Пленума ВС РФ, позиции из Обзоров.
4. СТРАТЕГИЯ: Дай рекомендации по доказыванию: какие документы нужны, какие экспертизы назначать.
5. ЗАПРЕТ НА ГАЛЛЮЦИНАЦИИ ССЫЛОК: Используй URL только из предоставленного списка real_cases.

ФОРМАТ JSON:
{
    "topic": "Уточненная тема",
    "summary": "Глубокое резюме ситуации (8-10 предложений). Опиши вектор развития практики.",
    "key_trends": [
        "Тенденция 1: Описание изменения подхода судов за последние 2 года",
        "Тенденция 2: Позиция судов по добросовестности",
        "Тенденция 3", "Тенденция 4", "Тенденция 5"
    ],
    "statute_of_limitations": "Детальный разбор: срок, начало течения, возможности восстановления.",
    "key_arguments": {
        "plaintiff": ["Аргумент 1 (статья + логика)", "Процессуальная тактика", "Доказательства"],
        "defendant": ["Контраргумент 1", "Способ защиты", "Основания отказа"]
    },
    "typical_outcomes": ["Сценарий 1 (частота %, условия)", "Сценарий 2"],
    "important_precedents": [
        {
            "description": "Суть спора и решение",
            "court": "Суд",
            "year": 2025,
            "significance": "Прецедентное значение",
            "source_url": "URL ИЗ СПИСКА real_cases",
            "law_url": ""
        }
    ],
    "laws": [{"name": "Статья и Кодекс", "description": "Толкование судами", "url": ""}],
    "recommendations": ["Тактическая (до суда)", "Доказательная (документы)", "Процессуальная (в суде)"],
    "success_rate": 70,
    "risks": ["Материальный", "Процессуальный", "Расходы"],
    "sources": [{"title": "Источник", "url": "URL"}],
    "notes": "Нюанса: территориальные различия, ожидаемые изменения."
}"""

        user_prompt = f"ПРОВЕДИ ГЛУБОКИЙ ЭКСПЕРТНЫЙ АНАЛИЗ судебной практики по теме: {topic}\n"
        
        if real_cases:
            user_prompt += "\nБАЗА РЕАЛЬНЫХ ДЕЛ (обязательно используй для анализа):\n"
            for i, case in enumerate(real_cases):
                user_prompt += f"КЕЙС {i+1}: {case.get('title')} ({case.get('url')})\nКратко: {case.get('snippet')}\nМета: {case.get('meta')}\n\n"

        if additional_context:
            user_prompt += f"\nКОНТЕКСТ ОТ КЛИЕНТА: {additional_context}"

        user_prompt += "\n\nОтвет должен быть на уровне старшего юриста. СТРОГО JSON."

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=4000,
        )

    async def monitor_legislation(self, topic: Optional[str] = None, real_changes: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Экспертный мониторинг законодательства РФ.
        """
        system_prompt = """Ты — ГЛАВНЫЙ ЭКСПЕРТ по законотворчеству РФ. 
Твоя задача: подготовить МАКСИМАЛЬНО ГЛУБОКИЙ и ПОДРОБНЫЙ обзор правовых изменений за 2025-2026 годы.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
1. АКТУАЛЬНОСТЬ: Игнорируй изменения старше 2024 года, если они не являются базой для текущих реформ.
2. ПРАКТИЧЕСКАЯ ПОЛЬЗА: Не просто цитируй закон, а объясняй, что КОНКРЕТНО изменилось в процессах (налоги, отчетность, сроки, штрафы).
3. ОСНОВА НА ФАКТАХ: Обязательно интегрируй данные из списка real_changes. Это твой фундамент.
4. ЗАПРЕТ НА ГАЛЛЮЦИНАЦИИ ССЫЛОК: Используй URL только из списка real_changes.

ФОРМАТ JSON:
{
    "report_date": "2026-05-08",
    "summary": "Масштабный аналитический обзор (8-10 предложений). Опиши логику реформ, их цели и общее влияние на правовую среду.",
    "changes": [
        {
            "id": 1,
            "title": "Полное название закона/НПА",
            "law_number": "ФЗ-X от DD.MM.YYYY",
            "effective_date": "DD.MM.YYYY",
            "description": "Суть изменения: что было vs что стало. Детальный разбор новых норм.",
            "impact": "Бизнес-эффект: риски, расходы, новые возможности.",
            "impact_level": "high",
            "action_required": true,
            "affected_areas": ["Налоги", "Корпоративное право"],
            "recommendations": "Пошаговый алгоритм действий для юриста/руководителя.",
            "url": "URL ИЗ real_changes"
        }
    ],
    "upcoming_changes": [
        {"title": "Законопроект", "expected_date": "2026 Q3", "description": "Что планируется и на какой стадии", "url": ""}
    ],
    "sources": [{"title": "Источник", "url": "URL"}],
    "total_changes": 5
}"""

        user_prompt = "ПРОВЕДИ ГЛУБОКИЙ МОНИТОРИНГ ЗАКОНОДАТЕЛЬСТВА РФ.\n"
        if topic:
            user_prompt += f"ФОКУС НА ТЕМУ: {topic}\n"
            
        if real_changes:
            user_prompt += "\nРЕАЛЬНЫЕ НОВОСТИ ИЗМЕНЕНИЙ (база для анализа):\n"
            for i, change in enumerate(real_changes):
                user_prompt += f"{i+1}. {change.get('title')} ({change.get('url')})\nОписание: {change.get('description')}\n\n"

        user_prompt += "\n\nВерни СТРОГО JSON. Ответ должен быть максимально подробным и профессиональным."

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=4000,
        )


# Singleton instance
ai_service = AIService()
