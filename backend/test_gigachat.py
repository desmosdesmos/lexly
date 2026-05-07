"""Тестирование GigaChat API интеграции."""
import asyncio
import sys
import os

# Добавляем backend в path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.config import settings
from app.services.ai_service import AIService


async def test_gigachat():
    """Тест базовой работы GigaChat."""
    print("🧪 ТЕСТИРОВАНИЕ GIGACHAT API")
    print("=" * 60)
    
    # Проверяем настройки
    print(f"\n📋 Конфигурация:")
    print(f"   AI Provider: {settings.AI_PROVIDER}")
    print(f"   Client ID: {settings.GIGACHAT_CLIENT_ID[:20]}...")
    print(f"   Client Secret: {settings.GIGACHAT_CLIENT_SECRET[:20]}...")
    print(f"   Scope: {settings.GIGACHAT_SCOPE}")
    print(f"   Model: {settings.GIGACHAT_MODEL}")
    print(f"   API URL: {settings.GIGACHAT_API_URL}")
    
    if not settings.GIGACHAT_CLIENT_ID or not settings.GIGACHAT_CLIENT_SECRET:
        print("\n❌ ОШИБКА: Не указаны GIGACHAT_CLIENT_ID или GIGACHAT_CLIENT_SECRET")
        print("   Создайте файл .env на основе .env.example")
        return False
    
    # Инициализируем сервис
    ai_service = AIService()
    
    # Тест 1: Базовый запрос
    print("\n" + "=" * 60)
    print("📝 ТЕСТ 1: Базовый запрос")
    print("-" * 60)
    
    try:
        response = await ai_service.generate(
            system_prompt="Ты — полезный ассистент. Отвечай кратко и по делу.",
            user_prompt="Что такое искусственный интеллект? Ответь в 2-3 предложениях.",
            temperature=0.3,
            max_tokens=200,
        )
        print(f"✅ Успешно!")
        print(f"Ответ: {response[:300]}...")
    except Exception as e:
        print(f"❌ Ошибка: {str(e)}")
        return False
    
    # Тест 2: JSON ответ
    print("\n" + "=" * 60)
    print("📋 ТЕСТ 2: Генерация JSON")
    print("-" * 60)
    
    try:
        response = await ai_service.generate_json(
            system_prompt="Ты — ассистент, который возвращает только JSON.",
            user_prompt="""Создай структуру данных для юридического дела с полями:
            - case_number (номер дела)
            - plaintiff (истец)
            - defendant (ответчик)
            - description (описание)""",
            temperature=0.3,
            max_tokens=500,
        )
        print(f"✅ Успешно!")
        print(f"JSON: {response}")
    except Exception as e:
        print(f"❌ Ошибка JSON: {str(e)}")
        return False
    
    # Тест 3: Генерация документа
    print("\n" + "=" * 60)
    print("⚖️ ТЕСТ 3: Генерация юридического документа")
    print("-" * 60)
    
    try:
        response = await ai_service.generate_document(
            document_type="claim",
            data={
                "COURT_NAME": "Мировой судья судебного участка №1 г. Москвы",
                "PLAINTIFF_NAME": "Иванов Иван Иванович",
                "DEFENDANT_NAME": "Петров Петр Петрович",
                "CLAIM_AMOUNT": "100000",
                "DESCRIPTION": "Займ денежных средств по расписке от 01.01.2024",
            }
        )
        print(f"✅ Успешно!")
        print(f"Документ (первые 500 символов): {response[:500]}...")
    except Exception as e:
        print(f"❌ Ошибка документа: {str(e)}")
        return False
    
    print("\n" + "=" * 60)
    print("✅ ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
    print("=" * 60)
    return True


if __name__ == "__main__":
    result = asyncio.run(test_gigachat())
    sys.exit(0 if result else 1)
