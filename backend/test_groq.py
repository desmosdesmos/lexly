"""Тестирование GROQ AI функций."""
import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000"


async def login():
    """Войти и получить токен."""
    async with httpx.AsyncClient() as client:
        # Сначала зарегистрируемся
        await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": "groqtest@example.com",
                "password": "Test123!",
                "full_name": "GROQ Test",
                "user_type": "individual",
            },
        )
        
        # Теперь войдём
        resp = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "groqtest@example.com", "password": "Test123!"},
        )
        
        if resp.status_code == 200:
            return resp.json()["access_token"]
        else:
            print(f"Login failed: {resp.text}")
            return None


async def test_document_generation(token: str):
    """Тест генерации документа через GROQ."""
    print("\n" + "="*60)
    print("📝 Тест генерации искового заявления")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/documents/generate",
            json={
                "document_type": "claim",
                "data": {
                    "court_name": "Арбитражный суд г. Москвы",
                    "plaintiff": {
                        "name": "ООО Ромашка",
                        "inn": "7701234567",
                        "address": "г. Москва, ул. Примерная, д. 1"
                    },
                    "defendant": {
                        "name": "ООО Лютик",
                        "inn": "7709876543",
                        "address": "г. Москва, ул. Другая, д. 2"
                    },
                    "circumstances": "Между сторонами был заключён договор поставки №123 от 01.01.2026. Ответчик нарушил сроки поставки на 30 дней. Товар был поставлен частично, на сумму 500 000 рублей из 1 000 000 рублей.",
                    "legal_basis": "Ст. 309, 310, 395 ГК РФ, Ст. 506 ГК РФ",
                    "claims": [
                        "Взыскать задолженность в размере 500 000 рублей",
                        "Взыскать неустойку в размере 50 000 рублей",
                        "Взыскать судебные расходы"
                    ]
                }
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200 or response.status_code == 201:
            data = response.json()
            print(f"✅ Документ сгенерирован!")
            print(f"ID: {data.get('id')}")
            print(f"Тип: {data.get('document_type')}")
            print(f"Статус: {data.get('status')}")
            content = data.get('generated_content', '')
            print(f"\nСодержимое (первые 500 символов):\n{content[:500]}...")
            return True
        else:
            print(f"❌ Ошибка: {response.text}")
            return False


async def test_contract_review(token: str):
    """Тест проверки договора."""
    print("\n" + "="*60)
    print("📋 Тест проверки договора")
    print("="*60)
    
    # Создаём тестовый договор
    contract_text = """
ДОГОВОР ПОСТАВКИ № 456
г. Москва                                                                                                 15 января 2026 г.

ООО "Поставщик", именуемое в дальнейшем "Поставщик", в лице Генерального директора Иванова И.И., действующего на основании Устава, с одной стороны, и ООО "Покупатель", именуемое в дальнейшем "Покупатель", в лице Генерального директора Петрова П.П., действующего на основании Устава, с другой стороны, заключили настоящий Договор о нижеследующем:

1. ПРЕДМЕТ ДОГОВОРА
1.1. Поставщик обязуется передать в собственность Покупателя товар, а Покупатель обязуется принять и оплатить товар.
1.2. Наименование товара: Строительные материалы.
1.3. Количество и ассортимент определяются в Спецификациях.

2. ЦЕНА И ПОРЯДОК РАСЧЁТОВ
2.1. Цена товара определяется в Спецификациях.
2.2. Оплата производится в течение 30 банковских дней с момента поставки.
2.3. В случае просрочки оплаты Покупатель уплачивает неустойку в размере 50% от суммы задолженности за каждый день просрочки.

3. ОТВЕТСТВЕННОСТЬ СТОРОН
3.1. Поставщик не несёт ответственности за качество товара после приёмки.
3.2. Покупатель не вправе отказаться от товара ненадлежащего качества.
3.3. Все споры подлежат рассмотржению в суде по месту нахождения Поставщика.

4. СРОК ДЕЙСТВИЯ ДОГОВОРА
4.1. Договор вступает в силу с момента подписания и действует до 31.12.2027.
4.2. Договор продлевается автоматически на тех же условиях, если ни одна из сторон не заявит о расторжении.
"""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/contracts/review",
            files={
                "file": ("contract.txt", contract_text.encode("utf-8"), "text/plain"),
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Договор проверен!")
            print(f"ID: {data.get('id')}")
            print(f"Уровень риска: {data.get('risk_level')}")
            analysis = data.get('analysis', {})
            print(f"\nРезюме: {analysis.get('summary', 'N/A')}")
            
            risks = analysis.get('risks', [])
            print(f"\nНайдено рисков: {len(risks)}")
            for i, risk in enumerate(risks[:3], 1):
                print(f"\nРиск #{i}:")
                print(f"  Тип: {risk.get('type')}")
                print(f"  Серьёзность: {risk.get('severity')}")
                print(f"  Пункт: {risk.get('clause')}")
                print(f"  Пояснение: {risk.get('explanation', '')[:150]}...")
            return True
        else:
            print(f"❌ Ошибка: {response.text}")
            return False


async def test_court_practice_analysis(token: str):
    """Тест анализа судебной практики."""
    print("\n" + "="*60)
    print("⚖️ Тест анализа судебной практики")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/court-practice/analyze",
            params={
                "topic": "взыскание неустойки по договору поставки"
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            analysis = data.get('analysis', {})
            print(f"✅ Анализ выполнен!")
            print(f"Тема: {analysis.get('topic', 'N/A')}")
            print(f"Резюме: {analysis.get('summary', 'N/A')}")
            
            trends = analysis.get('key_trends', [])
            print(f"\nКлючевые тенденции ({len(trends)}):")
            for i, trend in enumerate(trends[:3], 1):
                print(f"  {i}. {trend}")
            
            outcomes = analysis.get('typical_outcomes', [])
            print(f"\nТипичные исходы ({len(outcomes)}):")
            for i, outcome in enumerate(outcomes[:3], 1):
                print(f"  {i}. {outcome}")
            
            success_rate = analysis.get('success_rate', 'N/A')
            print(f"\nПроцент успеха: {success_rate}")
            return True
        else:
            print(f"❌ Ошибка: {response.text}")
            return False


async def test_legislation_monitor(token: str):
    """Тест мониторинга законодательства."""
    print("\n" + "="*60)
    print("📊 Тест мониторинга законодательства")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/legislation/monitor",
            params={
                "topic": "гражданское право"
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Мониторинг выполнен!")
            print(f"Дата отчёта: {data.get('report_date', 'N/A')}")
            print(f"Тема: {data.get('topic', 'N/A')}")
            print(f"Резюме: {data.get('summary', 'N/A')[:200]}...")
            
            changes = data.get('changes', [])
            print(f"\nИзменений найдено: {len(changes)}")
            for i, change in enumerate(changes[:3], 1):
                print(f"\nИзменение #{i}:")
                print(f"  Название: {change.get('title', 'N/A')}")
                print(f"  Дата вступления: {change.get('effective_date', 'N/A')}")
                print(f"  Описание: {change.get('description', 'N/A')[:150]}...")
            return True
        else:
            print(f"❌ Ошибка: {response.text}")
            return False


async def run_all_tests():
    """Запуск всех тестов."""
    print("\n" + "="*60)
    print("🧪 Запуск тестов GROQ AI функций")
    print("="*60)
    
    # Логин
    token = await login()
    if not token:
        print("❌ Не удалось войти")
        return
    
    print(f"✅ Авторизация успешна")
    
    results = {}
    
    # Тест 1: Генерация документа
    results['document_generation'] = await test_document_generation(token)
    await asyncio.sleep(2)  # Пауза между тестами
    
    # Тест 2: Проверка договора
    results['contract_review'] = await test_contract_review(token)
    await asyncio.sleep(2)
    
    # Тест 3: Анализ судебной практики
    results['court_practice_analysis'] = await test_court_practice_analysis(token)
    await asyncio.sleep(2)
    
    # Тест 4: Мониторинг законодательства
    results['legislation_monitor'] = await test_legislation_monitor(token)
    
    # Итоги
    print("\n" + "="*60)
    print("📊 ИТОГИ ТЕСТИРОВАНИЯ")
    print("="*60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    print(f"\nВсего пройдено: {passed}/{total}")
    print("="*60 + "\n")


if __name__ == "__main__":
    asyncio.run(run_all_tests())
