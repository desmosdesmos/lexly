"""Полный тест всех AI функций GigaChat."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.services.ai_service import ai_service

async def test_1_generate_document():
    """Тест генерации документа."""
    print("\n" + "="*60)
    print("Тест 1: Генерация документа (claim)")
    print("="*60)
    try:
        data = {
            "court_name": "Арбитражный суд г. Москвы",
            "plaintiff_name": "ООО Ромашка",
            "plaintiff_inn": "7701234567",
            "plaintiff_address": "г. Москва, ул. Ленина, д. 1",
            "defendant_name": "ООО Василёк",
            "defendant_inn": "7709876543",
            "defendant_address": "г. Москва, ул. Мира, д. 10",
            "circumstances": "Ответчик не оплатил товар по договору",
            "legal_basis": "ст. 309, 310, 486 ГК РФ",
            "claims": ["Взыскать долг 100 000 руб", "Взыскать неустойку 10 000 руб"],
        }
        result = await ai_service.generate_document("claim", data)
        print(f"✅ Успешно! ({len(result)} символов)")
        print(result[:400] + "..." if len(result) > 400 else result)
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_2_review_contract():
    """Тест анализа договора."""
    print("\n" + "="*60)
    print("Тест 2: Анализ договора")
    print("="*60)
    try:
        contract = """
        ДОГОВОР КУПЛИ-ПРОДАЖИ №1
        г. Москва, 01.04.2026
        
        ООО "Ромашка" (Продавец) и ИП Иванов И.И. (Покупатель) заключили договор о следующем:
        1. Продавец передает товар, Покупатель оплачивает
        2. Цена: 500 000 руб.
        3. Срок оплаты: 30 дней
        4. Ответственность сторон не ограничена
        5. Споры рассматриваются по месту нахождения Истца
        """
        result = await ai_service.review_contract(contract)
        print(f"✅ Успешно!")
        print(f"  Summary: {result.get('summary', '')[:200]}")
        print(f"  Risks: {len(result.get('risks', []))}")
        print(f"  Recommendations: {len(result.get('recommendations', []))}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_3_court_practice():
    """Тест анализа судебной практики."""
    print("\n" + "="*60)
    print("Тест 3: Анализ судебной практики")
    print("="*60)
    try:
        result = await ai_service.analyze_court_practice(
            "взыскание неустойки по договору купли-продажи"
        )
        print(f"✅ Успешно!")
        print(f"  Topic: {result.get('topic', '')}")
        print(f"  Summary: {result.get('summary', '')[:200]}")
        print(f"  Trends: {len(result.get('key_trends', []))}")
        print(f"  Success Rate: {result.get('success_rate', 'N/A')}%")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_4_legislation():
    """Тест мониторинга законодательства."""
    print("\n" + "="*60)
    print("Тест 4: Мониторинг законодательства")
    print("="*60)
    try:
        result = await ai_service.monitor_legislation("защита прав потребителей")
        print(f"✅ Успешно!")
        print(f"  Report Date: {result.get('report_date', '')}")
        print(f"  Changes: {len(result.get('changes', []))}")
        print(f"  Upcoming: {len(result.get('upcoming_changes', []))}")
        return True
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("\n" + "="*60)
    print("ТЕСТИРОВАНИЕ ВСЕХ AI ФУНКЦИЙ GIGACHAT")
    print("="*60)
    
    results = [
        await test_1_generate_document(),
        await test_2_review_contract(),
        await test_3_court_practice(),
        await test_4_legislation(),
    ]
    
    print("\n" + "="*60)
    passed = sum(results)
    print(f"РЕЗУЛЬТАТ: {passed}/{len(results)} тестов пройдено")
    if passed == len(results):
        print("✅ ВСЕ ТЕСТЫ УСПЕШНЫ!")
    else:
        print("❌ ЕСТЬ ОШИБКИ")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
