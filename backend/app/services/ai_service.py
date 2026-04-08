"""AI сервис для работы с GROQ API."""
import json
import logging
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI

from app.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Сервис для работы с AI провайдером (GROQ/OpenAI)."""

    def __init__(self):
        """Инициализация AI клиента."""
        if settings.AI_PROVIDER == "groq":
            import httpx
            self.client = AsyncOpenAI(
                api_key=settings.GROQ_API_KEY,
                base_url=settings.GROQ_BASE_URL,
                timeout=httpx.Timeout(timeout=120.0, connect=10.0),  # 120 секунд на запрос
            )
            self.model = settings.GROQ_MODEL
            self.max_tokens = settings.GROQ_MAX_TOKENS
            self.temperature = settings.GROQ_TEMPERATURE
        else:
            # Fallback to OpenAI
            self.client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL,
            )
            self.model = settings.OPENAI_MODEL
            self.max_tokens = settings.AI_MAX_TOKENS
            self.temperature = settings.AI_TEMPERATURE

        logger.info(f"AI Provider: {settings.AI_PROVIDER}, Model: {self.model}")

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

        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature if temperature is not None else self.temperature,
            "max_tokens": max_tokens if max_tokens is not None else self.max_tokens,
        }

        if response_format:
            kwargs["response_format"] = response_format

        try:
            response = await self.client.chat.completions.create(**kwargs)
            
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
            return json.loads(response_text)
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
        system_prompt = """Ты — профессиональный AI-юрист-аналитик с 20-летним опытом, специализирующийся на анализе судебной практики Российской Федерации.

ТВОЯ ЗАДАЧА — составить максимально подробный и полезный анализ судебной практики, который будет реально полезен юристу в работе.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реальные, проверенные данные о судебной практике.
2. Ссылайся на реальные постановления Пленумов ВС РФ и обзоры практики.
3. НЕ выдумывай номера дел, даты или решения судов.
4. Если точных данных нет — укажи общие тенденции и дай практические рекомендации.
5. Все ссылки на законы должны быть актуальны на 2026 год.
6. Анализируй практику за последние 3-5 лет.
7. Будь максимально конкр — юристу нужны цифры, сроки, конкретные статьи.
8. ДЛЯ КАЖДОГО прецедента, закона и источника ОБЯЗАТЕЛЬНО указывай прямую URL-ссылку.

СТРУКТУРА АНАЛИЗА (JSON):
{
    "topic": "Тема анализа",
    "summary": "Подробное резюме (5-7 предложений) — ключевые выводы из практики",
    "key_trends": [
        "Тенденция 1 (подробное описание с примерами)",
        "Тенденция 2",
        "Тенденция 3"
    ],
    "typical_outcomes": [
        "Типичный исход 1 — в каком проценте дел, какие суммы, сроки",
        "Типичный исход 2",
        "Типичный исход 3"
    ],
    "important_precedents": [
        {
            "description": "Подробное описание прецедента — что произошло, почему это важно",
            "court": "Наименование суда (например: Пленум ВС РФ, Определения ВС РФ)",
            "year": 2025,
            "significance": "Почему это важно — как влияет на текущую практику",
            "source_url": "https://vsrf.ru/lk/practice/cases/XXXXX — прямая ссылка на решение",
            "law_url": "http://www.consultant.ru/document/cons_doc_LAW_XXXXX — ссылка на закон"
        }
    ],
    "laws": [
        {
            "name": "Название закона/статьи (например: ст. 309 ГК РФ)",
            "description": "Что регулирует и почему это важно",
            "url": "http://www.consultant.ru/document/cons_doc_LAW_XXXXX — прямая ссылка на статью"
        }
    ],
    "recommendations": [
        "Конкретная рекомендация 1 — что делать юристу, на что обратить внимание",
        "Конкретная рекомендация 2",
        "Конкретная рекомендация 3"
    ],
    "success_rate": 65,
    "risks": [
        "Риск 1 — описание и вероятность",
        "Риск 2"
    ],
    "sources": [
        {"title": "Название источника", "url": "https://sudact.ru/regular/doc/?q=XXXXX"},
        {"title": "Ещё один источник", "url": "https://vsrf.ru/lk/practice/"}
    ],
    "notes": "Дополнительные замечания, ограничения анализа, полезные советы"
}

ВАЖНО:
- Массивы должны содержать минимум 3-5 элементов
- Каждый элемент должен быть содержательным (минимум 1-2 предложения)
- success_rate — число от 0 до 100
- URL должны быть РЕАЛЬНЫМИ рабочими ссылками на источники
- Для sudact.ru используй формат: https://sudact.ru/regular/doc/?q=ЗАПРОС
- Для консультант.ру: http://www.consultant.ru/document/cons_doc_LAW_XXXXX/
- Для ВС РФ: https://vsrf.ru/lk/practice/"""

        user_prompt = f"""Проанализируй судебную практику РФ по теме: {topic}"""

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
            max_tokens=4096,
        )

    async def monitor_legislation(self, topic: Optional[str] = None) -> Dict[str, Any]:
        """
        Проанализировать изменения в законодательстве.

        Args:
            topic: Тема мониторинга (опционально)

        Returns:
            Анализ изменений в законодательстве
        """
        system_prompt = """Ты — профессиональный AI-юрист, специализирующийся на мониторинге законодательства РФ.

КРИТИЧЕСКИЕ ПРАВИЛА:
1. Используй ТОЛЬКО реальные, вступившие в силу нормативные акты.
2. НЕ выдумывай законы, номера, даты или изменения.
3. Все ссылки должны быть на действующие документы.
4. Указывай точные даты вступления в силу.
5. Объясняй влияние изменений простым языком.
6. Актуальная информация на 2026 год.
7. ДЛЯ КАЖДОГО изменения ОБЯЗАТЕЛЬНО указывай прямую URL-ссылку на источник.

ФОРМАТ ОТВЕТА (JSON):
{
    "report_date": "2026-04-07",
    "summary": "Подробное резюме изменений (3-5 предложений)",
    "changes": [
        {
            "id": 1,
            "title": "Название изменения",
            "law_number": "Номер закона (если применимо)",
            "effective_date": "Дата вступления в силу",
            "description": "Подробное описание изменения",
            "impact": "Какое влияние оказывает на граждан/бизнес",
            "affected_areas": ["Гражданское право", ...],
            "recommendations": "Что нужно сделать пользователям",
            "url": "http://www.consultant.ru/document/cons_doc_LAW_XXXXX/ — прямая ссылка на закон"
        }
    ],
    "upcoming_changes": [
        {
            "title": "Название предстоящего изменения",
            "expected_date": "Ожидаемая дата",
            "description": "Описание",
            "url": "http://publication.pravo.gov.ru/XXXXX — ссылка на публикацию"
        }
    ],
    "sources": [
        {"title": "КонсультантПлюс", "url": "http://www.consultant.ru/"},
        {"title": "Гарант", "url": "https://www.garant.ru/"},
        {"title": "Официальный портал", "url": "http://publication.pravo.gov.ru/"}
    ],
    "total_changes": 10
}"""

        user_prompt = "Проанализируй последние изменения в законодательстве РФ."

        if topic:
            user_prompt = f"Проанализируй последние изменения в законодательстве РФ по теме: {topic}"

        user_prompt += """\n\nВАЖНО:
1. Верни СТРОГО JSON.
2. Все данные должны быть реальными.
3. Для КАЖДОГО изменения укажи прямую URL-ссылку на источник.
4. В массив sources включи все использованные источники.
5. Фокусируйся на значимых изменениях, влияющих на граждан и бизнес."""

        return await self.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            max_tokens=4096,
        )


# Singleton instance
ai_service = AIService()
