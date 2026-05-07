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
        Проанализировать судебную практику по теме.
        """
        system_prompt = """Ты — ведущий AI-аналитик судебной практики РФ. Твоя задача — подготовить глубокий аналитический обзор.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. ОСНОВЫВАЙСЯ НА РЕАЛЬНОСТИ. Обязательно используй предоставленные реальные дела (real_cases). Если они предоставлены, цитируй их и используй их URL.
2. ССЫЛКИ. Используй ТОЛЬКО проверенные ссылки. Если у тебя нет прямой ссылки на закон, НЕ ВЫДУМЫВАЙ ее. Ссылки на Consultant.ru вида /cons_doc_LAW_X/ ЗАПРЕЩЕНЫ, если ты не знаешь точный X. Вместо этого давай текстовое название статьи.
3. ПРЕЦЕДЕНТЫ. Используй только РЕАЛЬНЫЕ решения. Если в real_cases есть подходящие дела — приоритет им.
4. ПРОВЕРКА URL. В поле source_url и law_url вставляй ТОЛЬКО те ссылки, которые были даны в real_cases или официальные ссылки на vsrf.ru. НИКАКИХ вымышленных путей.
5. JSON ФОРМАТ. НИКОГДА не используй двойные кавычки внутри строк без экранирования (\\"). Никаких лишних запятых.

ФОРМАТ JSON:
{
    "topic": "Тема анализа",
    "summary": "Резюме текущей ситуации (4-6 предложений). Ссылайся на реальные дела из списка.",
    "key_trends": ["Тенденция 1 с описанием", "Тенденция 2", "Тенденция 3"],
    "statute_of_limitations": "Какой срок исковой давности применяется и с какого момента он начинает течь по данной категории дел",
    "key_arguments": {
        "plaintiff": ["Сильный довод истца 1", "Довод истца 2"],
        "defendant": ["Сильный довод ответчика 1", "Довод ответчика 2"]
    },
    "typical_outcomes": ["Сценарий 1: % успеха, условия", "Сценарий 2"],
    "important_precedents": [
        {"description": "Суть спора", "court": "Суд", "year": 2024, "significance": "Важность", "source_url": "URL ИЗ СПИСКА real_cases", "law_url": "URL закона или оставить пустым"}
    ],
    "laws": [{"name": "Название статьи", "description": "Применение", "url": "URL на consultant.ru (только если уверен) или оставить пустым"}],
    "recommendations": ["Совет 1", "Совет 2"],
    "success_rate": 65,
    "risks": ["Риск 1", "Риск 2"],
    "sources": [{"title": "Название", "url": "URL"}],
    "notes": "Особые указания"
}"""

        user_prompt = f"Проанализируй судебную практику РФ по теме: {topic}\n"
        
        if real_cases:
            user_prompt += "\nИспользуй следующие реальные дела как базу для анализа:\n"
            for i, case in enumerate(real_cases):
                user_prompt += f"{i+1}. {case.get('title')} ({case.get('url')})\nSnippet: {case.get('snippet')}\n"

        if additional_context:
            user_prompt += f"\nДополнительный контекст от пользователя: {additional_context}"

        user_prompt += "\n\nВерни СТРОГО JSON. Сделай ответ максимально профессиональным и полезным."

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=3500,
        )

    async def monitor_legislation(self, topic: Optional[str] = None, real_changes: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """
        Проанализировать изменения в законодательстве.
        """
        system_prompt = """Ты — ведущий эксперт по мониторингу законодательства РФ. Твоя задача — подготовить обзор последних правовых изменений.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. ОСНОВЫВАЙСЯ НА ФАКТАХ. Обязательно используй предоставленные реальные данные (real_changes). Это твоя база.
2. ССЫЛКИ. Используй ТОЛЬКО проверенные ссылки из real_changes. Если у тебя нет прямой ссылки на закон, НЕ ВЫДУМЫВАЙ ее. Ссылки на Consultant.ru вида /cons_doc_LAW_X/ ЗАПРЕЩЕНЫ, если ты не знаешь точный X.
3. ТОЛЬКО РЕАЛЬНЫЕ ЗАКОНЫ. Не выдумывай номера и даты. Если информации мало, лучше напиши меньше, но точно.
4. ПРАКТИЧЕСКАЯ ПОЛЬЗА. Объясняй каждое изменение через призму последствий.
5. JSON ФОРМАТ. НИКОГДА не используй двойные кавычки внутри строк без экранирования (\\"). Никаких лишних запятых.

ФОРМАТ JSON:
{
    "report_date": "YYYY-MM-DD",
    "summary": "Аналитический обзор на основе реальных данных из real_changes.",
    "changes": [
        {
            "id": 1,
            "title": "Название из real_changes",
            "law_number": "Номер (если есть)",
            "effective_date": "Дата",
            "description": "Суть изменения",
            "impact": "Последствия",
            "impact_level": "high или medium или low",
            "action_required": true,
            "affected_areas": ["Область"],
            "recommendations": "Что делать",
            "url": "URL ИЗ real_changes"
        }
    ],
    "upcoming_changes": [
        {"title": "Проект", "expected_date": "Дата", "description": "Описание", "url": "URL (только реальный)"}
    ],
    "sources": [{"title": "Источник", "url": "URL из списка"}],
    "total_changes": 5
}"""

        user_prompt = "Проведи мониторинг законодательства РФ."
        if topic:
            user_prompt = f"Проведи мониторинг законодательства РФ по теме: {topic}"
            
        if real_changes:
            user_prompt += "\nИспользуй следующие реальные новости законодательства как базу:\n"
            for i, change in enumerate(real_changes):
                user_prompt += f"{i+1}. {change.get('title')} ({change.get('url')})\n"

        user_prompt += "\n\nВерни СТРОГО JSON. Сделай ответ максимально точным и экспертным."

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=3500,
        )


# Singleton instance
ai_service = AIService()
