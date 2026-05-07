"""Полный тест всех GROQ AI функций с новым ключом."""
import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "groqfinal@example.com"
PASSWORD = "Test123!"
USER_TOKEN = None


async def register_and_login():
    """Регистрация и логин пользователя."""
    async with aiohttp.ClientSession() as session:
        # Регистрация
        async with session.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": EMAIL,
                "password": PASSWORD,
                "full_name": "GROQ Test User 3",
                "user_type": "individual",
            },
        ) as resp:
            if resp.status == 201:
                print("✅ Регистрация успешна")
            elif resp.status == 409:
                print("ℹ️ Пользователь уже существует")
            else:
                print(f"❌ Ошибка регистрации: {resp.status}")
                return False

        # Логин
        async with session.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD},
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                global USER_TOKEN
                USER_TOKEN = data["access_token"]
                print("✅ Логин успешен, токен получен")
                return True
            else:
                print(f"❌ Ошибка логина: {resp.status}")
                return False


async def test_document_generation():
    """Тест генерации искового заявления через GROQ."""
    print("\n📝 ТЕСТ: Генерация искового заявления")
    print("=" * 60)

    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BASE_URL}/documents/generate",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            json={
                "document_type": "claim",
                "data": {
                    "court_name": "Арбитражный суд города Москвы",
                    "plaintiff": {
                        "name": "Иванов Иван Иванович",
                        "inn": "7701234567",
                        "address": "г. Москва, ул. Примерная, д. 1",
                    },
                    "defendant": {
                        "name": "ООО 'Ромашка'",
                        "inn": "7798765432",
                        "address": "г. Москва, ул. Торговая, д. 10",
                    },
                    "circumstances": "Ответчик не оплатил поставленный товар по договору №123 от 01.03.2026",
                    "legal_basis": "Статьи 309, 310, 486 ГК РФ",
                    "claims": ["Взыскать задолженность в размере 150000 руб.", "Взыскать неустойку 15000 руб."],
                },
            },
        ) as resp:
            if resp.status == 201:
                data = await resp.json()
                print("✅ Документ успешно сгенерирован!")
                print(f"📄 Тип: {data['document_type']}")
                print(f"📊 Статус: {data['status']}")
                print(f"\n📝 Первые 500 символов:\n{data['generated_content'][:500]}...")
                return True
            else:
                error = await resp.json()
                print(f"❌ Ошибка: {resp.status} - {error.get('detail', 'Unknown')}")
                return False


async def test_contract_review():
    """Тест проверки договора через GROQ."""
    print("\n📋 ТЕСТ: Проверка договора")
    print("=" * 60)

    # Создаем тестовый договор
    contract_text = """
    ДОГОВОР ПОСТАВКИ № 456
    г. Москва                                                                 07 апреля 2026 г.

    ООО "Поставщик", именуемое в дальнейшем "Поставщик", в лице генерального директора 
    Петрова Петра Петровича, действующего на основании Устава, с одной стороны, и 
    ООО "Покупатель", именуемое в дальнейшем "Покупатель", в лице генерального директора 
    Сидорова Сидора Сидоровича, действующего на основании Устава, с другой стороны, 
    заключили настоящий договор о нижеследующем:

    1. ПРЕДМЕТ ДОГОВОРА
    1.1. Поставщик обязуется передать в собственность Покупателя товар, 
    а Покупатель обязуется принять и оплатить этот товар.
    1.2. Наименование товара: Строительные материалы.
    1.3. Количество товара определяется спецификацией.

    2. ЦЕНА И ПОРЯДОК РАСЧЕТОВ
    2.1. Цена товара составляет 500 000 (пятьсот тысяч) рублей.
    2.2. Оплата производится в течение 30 банковских дней с момента поставки.
    2.3. Поставщик вправе в одностороннем порядке изменить цену товара без согласования с Покупателем.

    3. ОТВЕТСТВЕННОСТЬ СТОРОН
    3.1. За нарушение сроков поставки Поставщик уплачивает неустойку в размере 0.01% от стоимости товара.
    3.2. За нарушение сроков оплаты Покупатель уплачивает неустойку в размере 1% за каждый день просрочки.
    3.3. Поставщик не несет ответственности за качество товара.

    4. ФОРС-МАЖОР
    4.1. Стороны освобождаются от ответственности за неисполнение обязательств при наступлении форс-мажорных обстоятельств.

    5. СРОК ДЕЙСТВИЯ ДОГОВОРА
    5.1. Договор вступает в силу с момента подписания и действует до 31 декабря 2027 года.
    5.2. Поставщик вправе расторгнуть договор в одностороннем порядке без объяснения причин.
    """

    async with aiohttp.ClientSession() as session:
        # Создаем временный файл
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write(contract_text)
            temp_file = f.name

        # Отправляем на проверку
        with open(temp_file, 'rb') as f:
            form_data = aiohttp.FormData()
            form_data.add_field('file', f, filename='test_contract.txt', content_type='text/plain')

            async with session.post(
                f"{BASE_URL}/contracts/review",
                headers={"Authorization": f"Bearer {USER_TOKEN}"},
                data=form_data,
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    print("✅ Договор успешно проверен!")
                    print(f"📊 Уровень риска: {data.get('risk_level', 'unknown')}")
                    print(f"📝 Статус: {data.get('status', 'unknown')}")
                    
                    analysis = data.get('analysis', {})
                    risks = analysis.get('risks', [])
                    print(f"\n⚠️ Найдено рисков: {len(risks)}")
                    
                    if risks:
                        print("\nТоп-3 риска:")
                        for i, risk in enumerate(risks[:3], 1):
                            print(f"  {i}. [{risk.get('severity', 'N/A')}] {risk.get('title', 'N/A')}")
                    
                    return True
                else:
                    try:
                        error = await resp.json()
                        print(f"❌ Ошибка: {resp.status} - {error.get('detail', 'Unknown')}")
                    except:
                        print(f"❌ Ошибка: {resp.status}")
                    return False

        import os
        os.unlink(temp_file)


async def test_court_practice_analysis():
    """Тест анализа судебной практики через GROQ."""
    print("\n⚖️ ТЕСТ: Анализ судебной практики")
    print("=" * 60)

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{BASE_URL}/court-practice/analyze",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            params={
                "topic": "взыскание задолженности по договору поставки",
                "additional_context": "сумма долга 500000 рублей, просрочка 3 месяца",
            },
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                analysis = data.get('analysis', {})
                print("✅ Анализ судебной практики выполнен!")
                print(f"📊 Тема: {analysis.get('topic', 'N/A')}")
                print(f"📝 Краткое резюме: {analysis.get('summary', 'N/A')[:200]}...")
                
                success_rate = analysis.get('success_rate', 'N/A')
                print(f"📈 Процент успеха: {success_rate}%")
                
                key_trends = analysis.get('key_trends', [])
                print(f"\n🔑 Ключевые тенденции ({len(key_trends)}):")
                for i, trend in enumerate(key_trends[:3], 1):
                    print(f"  {i}. {trend[:100]}...")
                
                return True
            else:
                try:
                    error = await resp.json()
                    print(f"❌ Ошибка: {resp.status} - {error.get('detail', 'Unknown')}")
                except:
                    print(f"❌ Ошибка: {resp.status}")
                return False


async def test_legislation_monitor():
    """Тест мониторинга законодательства через GROQ."""
    print("\n📊 ТЕСТ: Мониторинг законодательства")
    print("=" * 60)

    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"{BASE_URL}/legislation/monitor",
            headers={"Authorization": f"Bearer {USER_TOKEN}"},
            params={"topic": "трудовое право"},
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                print("✅ Мониторинг законодательства выполнен!")
                print(f"📅 Дата отчета: {data.get('report_date', 'N/A')}")
                print(f"📝 Резюме: {data.get('summary', 'N/A')[:200]}...")
                print(f"📊 Всего изменений: {data.get('total_changes', 0)}")
                
                changes = data.get('changes', [])
                if changes:
                    print(f"\n📋 Последние изменения:")
                    for i, change in enumerate(changes[:3], 1):
                        print(f"  {i}. {change.get('title', 'N/A')[:80]}")
                        print(f"     📅 Вступает в силу: {change.get('effective_date', 'N/A')}")
                
                return True
            else:
                try:
                    error = await resp.json()
                    print(f"❌ Ошибка: {resp.status} - {error.get('detail', 'Unknown')}")
                except:
                    print(f"❌ Ошибка: {resp.status}")
                return False


async def main():
    """Запуск всех тестов."""
    print("=" * 60)
    print("🧪 ПОЛНЫЙ ТЕСТ GROQ AI ФУНКЦИЙ")
    print("🔑 Используется GROQ_API_KEY из окружения")
    print("=" * 60)

    # Шаг 1: Регистрация и логин
    print("\n🔐 Шаг 1: Авторизация")
    if not await register_and_login():
        print("❌ Не удалось авторизоваться, тесты прерваны")
        return

    # Шаг 2-5: Тесты AI функций
    tests = [
        ("📝 Генерация документов", test_document_generation),
        ("📋 Проверка договора", test_contract_review),
        ("⚖️ Анализ судебной практики", test_court_practice_analysis),
        ("📊 Мониторинг законодательства", test_legislation_monitor),
    ]

    results = []
    for test_name, test_func in tests:
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Критическая ошибка в тесте {test_name}: {e}")
            results.append((test_name, False))

    # Итоги
    print("\n" + "=" * 60)
    print("📊 ИТОГИ ТЕСТИРОВАНИЯ")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\n📈 Пройдено: {passed}/{total} тестов")
    
    if passed == total:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!")
        print("🚀 GROQ AI полностью работает!")
    else:
        print(f"\n⚠️ {total - passed} тест(ов) не прошли")


if __name__ == "__main__":
    asyncio.run(main())
