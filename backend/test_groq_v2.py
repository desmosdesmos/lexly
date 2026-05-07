"""Тестирование GROQ AI функций - v2."""
import httpx
import asyncio
import json

BASE_URL = "http://localhost:8000"


async def register_and_login():
    """Зарегистрироваться и войти."""
    async with httpx.AsyncClient() as client:
        # Регистрация
        reg_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": "groqtest2@example.com",
                "password": "Test123!",
                "full_name": "GROQ Test User",
                "user_type": "individual",
            },
        )
        print(f"Registration: {reg_resp.status_code} - {reg_resp.text[:200]}")
        
        # Логин
        login_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "groqtest2@example.com", "password": "Test123!"},
        )
        print(f"Login: {login_resp.status_code} - {login_resp.text[:200]}")
        
        if login_resp.status_code == 200:
            return login_resp.json()["access_token"]
        return None


async def test_document_generation(token: str):
    """Тест генерации документа."""
    print("\n" + "="*60)
    print("📝 Генерация искового заявления через GROQ")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/documents/generate",
            json={
                "document_type": "claim",
                "data": {
                    "court_name": "Арбитражный суд г. Москвы",
                    "plaintiff": {"name": "ООО Ромашка", "inn": "7701234567", "address": "г. Москва, ул. Примерная, д. 1"},
                    "defendant": {"name": "ООО Лютик", "inn": "7709876543", "address": "г. Москва, ул. Другая, д. 2"},
                    "circumstances": "Между сторонами заключён договор поставки №123 от 01.01.2026. Ответчик нарушил сроки поставки на 30 дней.",
                    "legal_basis": "Ст. 309, 310, 395 ГК РФ",
                    "claims": ["Взыскать 500 000 руб", "Взыскать неустойку 50 000 руб"]
                }
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code in [200, 201]:
            data = response.json()
            content = data.get('generated_content', '')
            print(f"✅ Документ сгенерирован!")
            print(f"Содержимое:\n{content[:800]}...")
            return True
        else:
            print(f"❌ Ошибка: {response.text[:500]}")
            return False


async def test_contract_review(token: str):
    """Тест проверки договора."""
    print("\n" + "="*60)
    print("📋 Проверка договора через GROQ")
    print("="*60)
    
    contract_text = """
ДОГОВОР ПОСТАВКИ № 456
г. Москва, 15 января 2026 г.
ООО "Поставщик" и ООО "Покупатель" заключили:
1. Поставщик передаёт товар, Покупатель принимает и оплачивает.
2. Оплата в течение 30 банковских дней.
3. Неустойка 50% от суммы за каждый день просрочки.
4. Поставщик не несёт ответственности за качество после приёмки.
5. Все споры в суде по месту нахождения Поставщика.
6. Автоматическое продление договора.
"""
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/contracts/review",
            files={"file": ("contract.txt", contract_text.encode("utf-8"), "text/plain")},
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Договор проверен!")
            print(f"Уровень риска: {data.get('risk_level')}")
            analysis = data.get('analysis', {})
            print(f"Резюме: {analysis.get('summary', 'N/A')}")
            risks = analysis.get('risks', [])
            print(f"Найдено рисков: {len(risks)}")
            for i, risk in enumerate(risks[:3], 1):
                print(f"  #{i} [{risk.get('severity')}] {risk.get('clause')}: {risk.get('explanation', '')[:150]}")
            return True
        else:
            print(f"❌ Ошибка: {response.text[:500]}")
            return False


async def test_court_practice(token: str):
    """Тест анализа судебной практики."""
    print("\n" + "="*60)
    print("⚖️ Анализ судебной практики через GROQ")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/court-practice/analyze",
            params={"topic": "взыскание неустойки по договору поставки"},
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            analysis = data.get('analysis', {})
            print(f"✅ Анализ выполнен!")
            print(f"Резюме: {analysis.get('summary', 'N/A')}")
            trends = analysis.get('key_trends', [])
            print(f"Тенденции: {len(trends)}")
            for i, t in enumerate(trends[:3], 1):
                print(f"  {i}. {t}")
            return True
        else:
            print(f"❌ Ошибка: {response.text[:500]}")
            return False


async def test_legislation_monitor(token: str):
    """Тест мониторинга законодательства."""
    print("\n" + "="*60)
    print("📊 Мониторинг законодательства через GROQ")
    print("="*60)
    
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(
            f"{BASE_URL}/api/v1/legislation/monitor",
            params={"topic": "гражданское право и договорные обязательства"},
            headers={"Authorization": f"Bearer {token}"},
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Мониторинг выполнен!")
            print(f"Дата: {data.get('report_date')}")
            print(f"Резюме: {data.get('summary', 'N/A')[:300]}")
            changes = data.get('changes', [])
            print(f"Изменений: {len(changes)}")
            for i, ch in enumerate(changes[:3], 1):
                print(f"  {i}. {ch.get('title', 'N/A')[:100]}")
            return True
        else:
            print(f"❌ Ошибка: {response.text[:500]}")
            return False


async def run_all():
    print("\n" + "="*60)
    print("🧪 FULL GROQ AI TESTS")
    print("="*60 + "\n")
    
    token = await register_and_login()
    if not token:
        print("❌ Auth faileded")
        return
    print(f"\n✅ Auth OK\n")
    
    results = {}
    
    results['document_generation'] = await test_document_generation(token)
    await asyncio.sleep(2)
    
    results['contract_review'] = await test_contract_review(token)
    await asyncio.sleep(2)
    
    results['court_practice'] = await test_court_practice(token)
    await asyncio.sleep(2)
    
    results['legislation_monitor'] = await test_legislation_monitor(token)
    
    # Итоги
    print("\n" + "="*60)
    print("📊 RESULTS")
    print("="*60)
    passed = sum(1 for v in results.values() if v)
    for name, ok in results.items():
        print(f"{'✅' if ok else '❌'} {name}")
    print(f"\nPassed: {passed}/{len(results)}")


if __name__ == "__main__":
    asyncio.run(run_all())
