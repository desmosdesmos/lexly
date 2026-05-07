"""Простой тест AI функций."""
import asyncio
import sys
import os

# Добавляем backend в путь
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.services.ai_service import ai_service
from app.config import settings

async def test_generate():
    """Тест генерации текста."""
    print("\n" + "="*60)
    print("Тест 1: Генерация текста")
    print("="*60)
    try:
        result = await ai_service.generate(
            system_prompt="Ты юрист.",
            user_prompt="Что такое ГК РФ?",
            temperature=0.2,
            max_tokens=200
        )
        print(f"✅ Успешно! Результат ({len(result)} символов):")
        print(result[:300] + "..." if len(result) > 300 else result)
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_json_generate():
    """Тест генерации JSON."""
    print("\n" + "="*60)
    print("Тест 2: Генерация JSON (contract review)")
    print("="*60)
    try:
        result = await ai_service.review_contract(
            "Договор купли-продажи товара между ООО Ромашка и ИП Иванов..."
        )
        print(f"✅ Успешно! Ключи: {list(result.keys())}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("Настройки AI:")
    print(f"  AI_PROVIDER: {settings.AI_PROVIDER}")
    print(f"  GIGACHAT_CLIENT_ID: {'есть' if settings.GIGACHAT_CLIENT_ID else 'нет'}")
    print(f"  GROQ_API_KEY: {'есть' if settings.GROQ_API_KEY else 'нет'}")
    
    test1 = await test_generate()
    test2 = await test_json_generate()
    
    print("\n" + "="*60)
    print(f"Результат: {'✅ Все тесты пройдены' if test1 and test2 else '❌ Есть ошибки'}")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
