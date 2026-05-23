"""AI сервис для работы с GigaChat, GROQ и OpenAI API."""
import json
import logging
import base64
import os
import hashlib
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
        """Сгенерировать ответ от AI."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        temp = temperature if temperature is not None else self.temperature
        tokens = max_tokens if max_tokens is not None else self.max_tokens

        try:
            if self.gigachat_client:
                if response_format and response_format.get("type") == "json_object":
                    messages[-1]["content"] += "\n\nВАЖНО: Верни ответ СТРОГО в формате JSON."
                
                content = await self.gigachat_client.chat_completions(
                    messages=messages,
                    temperature=temp,
                    max_tokens=tokens,
                )
                return content
            else:
                kwargs = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temp,
                    "max_tokens": tokens,
                }

                if response_format:
                    kwargs["response_format"] = response_format

                response = await self.openai_client.chat.completions.create(**kwargs)
                content = response.choices[0].message.content
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
        """Сгенерировать JSON ответ от AI с автоматическим исправлением ошибок."""
        response_text = await self.generate(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        
        def clean_json_text(text: str) -> str:
            text = text.strip()
            import re
            if "```" in text:
                blocks = re.findall(r'```(?:json)?\s*({.*})\s*```', text, re.DOTALL)
                if blocks:
                    text = blocks[0].strip()
                else:
                    start = text.find("{")
                    end = text.rfind("}")
                    if start != -1 and end != -1:
                        text = text[start:end+1]
            return text

        def repair_json_logic(text: str) -> str:
            import re
            text = re.sub(r',\s*([}\]])', r'\1', text)
            text = re.sub(r'\[\s*\{\s*\{', '[ {', text)
            text = re.sub(r'\}\s*\}\s*\]', '} ]', text)
            text = re.sub(r'\}\s*,\s*\{\s*\{', '}, {', text)
            text = re.sub(r'([{,]\s*)(\w+)(\s*:)', r'\1"\2"\3', text)
            
            try:
                json.loads(text)
                return text
            except json.JSONDecodeError:
                text = re.sub(r"\'(\w+)\'\s*:", r'"\1":', text)
                text = re.sub(r":\s*\'(.*?)\'", r': "\1"', text)
                return text

        cleaned_text = clean_json_text(response_text)

        try:
            return json.loads(cleaned_text)
        except json.JSONDecodeError as e:
            try:
                repaired = repair_json_logic(cleaned_text)
                return json.loads(repaired)
            except json.JSONDecodeError:
                try:
                    import re
                    match = re.search(r'\{.*\}', cleaned_text, re.DOTALL)
                    if match:
                        return json.loads(repair_json_logic(match.group()))
                except: pass
                raise ValueError(f"AI вернул невалидный JSON: {str(e)}")

    async def generate_document(self, document_type: str, data: Dict[str, Any]) -> str:
        """Сгенерировать юридический документ."""
        dt = document_type.lower()
        mapping = {
            "claim": "claim", "complaint": "complaint", "demand": "demand",
            "contract_sale": "contract_sale", "contract_employment": "contract_employment",
            "power_of_attorney": "power_of_attorney"
        }
        doc_type = "claim"
        for k, v in mapping.items():
            if k in dt: doc_type = v; break
        
        base_dir = os.getcwd()
        prompt_file = os.path.join(base_dir, "..", "prompts", "document-generator", f"{doc_type}.txt")
        
        with open(prompt_file, "r", encoding="utf-8") as f:
            template = f.read()

        user_prompt = template
        for key, value in data.items():
            placeholder = f"{{{{{key.upper()}}}}}"
            if isinstance(value, list):
                value = "\n".join(f"- {item}" for item in value)
            user_prompt = user_prompt.replace(placeholder, str(value))

        if "claim" in dt:
            role = "Специалист по судебным искам"
            goal = "составить исковое заявление"
        elif "complaint" in dt:
            role = "Эксперт по жалобам и апелляциям"
            goal = "составить официальную жалобу"
        elif "demand" in dt:
            role = "Юрист по досудебному урегулированию"
            goal = "составить досудебную претензию"
        elif "contract" in dt:
            role = "Эксперт по договорному праву"
            goal = "составить гражданско-правовой договор (НЕ ИСК)"
        elif "attorney" in dt:
            role = "Нотариальный юрист"
            goal = "составить доверенность"
        else:
            role = "Старший юрист"
            goal = "составить юридический документ"

        system_prompt = f"""Ты — {role} РФ. Твоя задача — {goal}.
ПРАВИЛА: 
1. Только реальные нормы права. 
2. Актуальность 2026 год. 
3. Официальный стиль.
4. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать суды и иски, если ты составляешь ДОГОВОР или ДОВЕРЕННОСТЬ."""

        return await self.generate(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.1, max_tokens=8192)

    async def review_contract(self, contract_text: str) -> Dict[str, Any]:
        """
        Проанализировать договор на риски с выставлением Risk Score.
        """
        system_prompt = """Ты — СТАРШИЙ AI-ЮРИСТ-АУДИТОР. Твоя задача: провести глубокий аудит договора и выставить Risk Score.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. RISK SCORE: Число от 0 до 100, где 100 — идеально безопасный договор, 0 — катастрофический риск.
2. RISK LEVEL: 'low' (80-100), 'medium' (50-79), 'high' (0-49).
3. RISKS: Массив объектов. Каждый риск ОБЯЗАТЕЛЬНО содержит:
   - severity: 'critical' (красный), 'medium' (желтый), 'low' (синий/зеленый).
   - title: Краткое название риска.
   - description: Суть проблемы.
   - recommendation: Как исправить (конкретно).
4. Оценка по законодательству РФ 2026.
5. Возвращай СТРОГО JSON.

ФОРМАТ JSON:
{
    "score": 75,
    "risk_level": "medium",
    "summary": "Краткое резюме аудита (3-4 предложения).",
    "risks": [
        {
            "severity": "critical",
            "title": "Отсутствие штрафных санкций",
            "description": "В договоре не указана неустойка за просрочку платежа.",
            "recommendation": "Добавить пункт о пени в размере 0.1% за каждый день просрочки."
        }
    ],
    "recommendations": ["Общая рекомендация 1", "Общая рекомендация 2"],
    "is_valid": true
}"""

        user_prompt = f"ПРОВЕДИ ПОЛНЫЙ АУДИТ РИСКОВ ЭТОГО ДОГОВОРА:\n\n{contract_text}\n\nВерни СТРОГО JSON."

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.1,
            max_tokens=8192,
        )

    async def analyze_court_practice(self, topic: str, additional_context: Optional[str] = None, real_cases: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Профессиональный экспертный анализ судебной практики с опорой на факты."""
        system_prompt = """Ты — ГЛАВНЫЙ АНАЛИТИК ПРАКТИКИ ВС РФ. 
Твоя задача: предоставить БЕЗУПРЕЧНЫЙ по точности анализ судебной практики.

КРИТИЧЕСКИЕ ТРЕБОВАНИЯ К ИСТОЧНИКАМ (GROUNDING):
1. ПРИОРИТЕТ ДАТ: Используй только самые свежие дела (2024-2026). Если в списке есть старые дела, помечай это.
2. ВЕРИФИКАЦИЯ ССЫЛОК: Используй ТОЛЬКО предоставленные URL. Запрещено выдумывать ссылки.
3. ПРАВОВАЯ ЛОГИКА: Объясняй, почему суды принимают те или иные решения.
4. ОТСЕИВАНИЕ МУСОРА: Если источник не содержит конкретики по теме, игнорируй его.

ФОРМАТ JSON:
{
    "topic": "Тема",
    "summary": "Аналитический разбор ситуации на 2026 год (8-10 предложений).",
    "key_trends": ["Тренд 1 с указанием на актуальную практику", "Тренд 2"],
    "statute_of_limitations": "Срок и нюансы его исчисления.",
    "key_arguments": {
        "plaintiff": ["Аргумент Истца + ссылка на НПА"],
        "defendant": ["Аргумент Ответчика"]
    },
    "typical_outcomes": ["Сценарий с вероятностью %"],
    "important_precedents": [
        {
            "description": "Суть дела",
            "court": "Суд",
            "year": "ГГГГ (строго из данных)",
            "significance": "Почему это важно",
            "source_url": "URL ИЗ СПИСКА"
        }
    ],
    "success_rate": 70,
    "risks": ["Материальный риск", "Процессуальный риск"],
    "sources": [{"title": "Название", "url": "URL", "date": "Дата"}]
}"""

        user_prompt = f"ПРОВЕДИ ГЛУБОКИЙ ЭКСПЕРТНЫЙ АНАЛИЗ судебной практики по теме: {topic}\n"
        if real_cases:
            user_prompt += "\nБАЗА РЕАЛЬНЫХ ДЕЛ (ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЙ ИМЕННО ЭТИ ДАННЫЕ):\n"
            for i, case in enumerate(real_cases):
                user_prompt += f"ДЕЛO {i+1}: {case.get('title')} | ДАТА: {case.get('date')} | ССЫЛКА: {case.get('url')}\nКОНТЕКСТ: {case.get('snippet')}\nМЕТА: {case.get('meta')}\n\n"
        if additional_context: user_prompt += f"\nКОНТЕКСТ: {additional_context}"
        
        return await self.generate_json(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.1, max_tokens=4000)

    async def monitor_legislation(self, topic: Optional[str] = None, real_changes: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Экспертный мониторинг законодательства РФ на базе реальных новостей."""
        system_prompt = """Ты — ВЕДУЩИЙ ЭКСПЕРТ КОНСУЛЬТАНТ+. Твоя задача: подготовить МАКСИМАЛЬНО АКТУАЛЬНЫЙ обзор изменений.
КРИТИЧЕСКИЕ ПРАВИЛА:
1. АКТУАЛЬНОСТЬ: Акцент на 2025-2026 годах. 
2. СТРОГАЯ ПРИВЯЗКА К ФАКТАМ: Используй названия, номера и даты ТОЛЬКО из списка real_changes.
3. ПРАКТИЧЕСКИЕ ШАГИ: Что делать юристу завтра?

ФОРМАТ JSON:
{
    "report_date": "2026-05-22",
    "summary": "Анализ вектора изменений (8-10 предложений).",
    "changes": [
        {
            "title": "Название НПА",
            "law_number": "Номер и дата",
            "effective_date": "Дата вступления (из источника!)",
            "description": "Суть: было / стало.",
            "impact": "Бизнес-эффект.",
            "impact_level": "high/medium/low",
            "recommendations": "Конкретный совет.",
            "url": "URL ИЗ real_changes"
        }
    ],
    "upcoming_changes": [{"title": "Что на подходе", "expected_date": "Срок", "description": "Суть"}],
    "sources": [{"title": "Источник", "url": "URL", "date": "Дата"}],
    "total_changes": 0
}"""

        user_prompt = "ПРОВЕДИ МОНИТОРИНГ ЗАКОНОДАТЕЛЬСТВА РФ.\n"
        if topic: user_prompt += f"ФОКУС: {topic}\n"
        if real_changes:
            user_prompt += "\nСПИСОК РЕАЛЬНЫХ ИЗМЕНЕНИЙ:\n"
            for i, change in enumerate(real_changes):
                user_prompt += f"НОВОСТЬ {i+1}: {change.get('title')} ({change.get('url')}) | ДАТА: {change.get('date')}\nОПИСАНИЕ: {change.get('description')}\n\n"

        return await self.generate_json(system_prompt=system_prompt, user_prompt=user_prompt, temperature=0.1, max_tokens=4000)

ai_service = AIService()
