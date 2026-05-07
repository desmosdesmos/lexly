"""Полный автотест всех функций сайта Law AI Agent."""
import asyncio
import httpx
import sys
import secrets

BASE = "http://localhost:8000/api/v1"

async def test_all():
    async with httpx.AsyncClient() as c:
        print("🧪 АВТОТЕСТ ВСЕХ ФУНКЦИЙ LAW AI AGENT")
        print("=" * 60)

        # 1. Регистрация
        print("\n1️⃣ РЕГИСТРАЦИЯ")
        email = f"autotest-{secrets.token_hex(3)}@test.ru"
        r = await c.post(f"{BASE}/auth/register", json={
            "email": email, "password": "AutoTest123!",
            "full_name": "Авто Тестеров", "user_type": "individual"
        })
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 201 else '❌'}")
        if r.status_code != 201:
            print(f"   Ответ: {r.text[:200]}")

        # 2. Вход
        print("\n2️⃣ ВХОД")
        r = await c.post(f"{BASE}/auth/login", json={"email": email, "password": "AutoTest123!"})
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        token = r.json().get("access_token", "") if r.status_code == 200 else ""
        hdr = {"Authorization": f"Bearer {token}"}

        # 3. Профиль
        print("\n3️⃣ ПРОФИЛЬ")
        r = await c.get(f"{BASE}/user/profile", headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        if r.status_code == 200:
            d = r.json()
            print(f"   👤 {d.get('full_name')} | {d.get('email')}")

        # 4. Обновление профиля
        print("\n4️⃣ ОБНОВЛЕНИЕ ПРОФИЛЯ")
        r = await c.put(f"{BASE}/user/profile", json={"full_name": "Авто Тестеров Обновлённый", "phone": "+79991234567"}, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")

        # 5. Смена пароля
        print("\n5️⃣ СМЕНА ПАРОЛЯ")
        r = await c.post(f"{BASE}/user/change-password", json={"current_password": "AutoTest123!", "new_password": "NewAutoTest456!"}, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        # Вернём старый пароль
        await c.post(f"{BASE}/user/change-password", json={"current_password": "NewAutoTest456!", "new_password": "AutoTest123!"}, headers=hdr)

        # 6. Forgot Password
        print("\n6️⃣ ВОССТАНОВЛЕНИЕ ПАРОЛЯ")
        r = await c.post(f"{BASE}/auth/forgot-password", json={"email": email})
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")

        # 7. Генерация документа (Исковое)
        print("\n7️⃣ ГЕНЕРАЦИЯ ДОКУМЕНТА (Исковое заявление)")
        r = await c.post(f"{BASE}/documents/generate", json={
            "document_type": "claim",
            "data": {
                "COURT_NAME": "Мировой судья участка №1 г. Москвы",
                "PLAINTIFF_NAME": "Иванов Иван Иванович",
                "DEFENDANT_NAME": "Петров Петр Петрович",
                "CLAIM_AMOUNT": "50000",
                "DESCRIPTION": "Невозврат долга по расписке",
                "CIRCUMSTANCES": "01.01.2024 ответчик взял в долг 50000 руб. и не вернул.",
            }
        }, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code in [200, 201] else '❌'}")
        if r.status_code in [200, 201]:
            d = r.json()
            print(f"   📄 Документ создан: {d.get('id', 'N/A')[:36]}")

        # 8. Анализ судебной практики
        print("\n8️⃣ АНАЛИЗ СУДЕБНОЙ ПРАКТИКИ")
        r = await c.post(f"{BASE}/court-practice/analyze", json={"topic": "взыскание долга по расписке"}, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code in [200, 201] else '❌'}")

        # 9. Мониторинг законодательства
        print("\n9️⃣ МОНИТОРИНГ ЗАКОНОДАТЕЛЬСТВА")
        r = await c.post(f"{BASE}/legislation/monitor", json={}, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code in [200, 201] else '❌'}")

        # 10. Лимиты
        print("\n🔟 ЛИМИТЫ")
        r = await c.get(f"{BASE}/user/usage", headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        if r.status_code == 200:
            d = r.json()
            plan = d.get('plan', 'unknown')
            print(f"   💼 Тариф: {plan}")

        # 11. История запросов
        print("\n1️⃣1️⃣ ИСТОРИЯ ЗАПРОСОВ")
        r = await c.get(f"{BASE}/user/history", headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        if r.status_code == 200:
            d = r.json()
            print(f"   📊 Всего запросов: {d.get('total', 0)}")

        # 12. Тарифные планы
        print("\n1️⃣2️⃣ ТАРИФНЫЕ ПЛАНЫ")
        r = await c.get(f"{BASE}/payments/plans")
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 200 else '❌'}")
        if r.status_code == 200:
            plans = r.json().get('plans', [])
            print(f"   💰 Планов доступно: {len(plans)}")

        # 13. Активация кода (тест)
        print("\n1️⃣3️⃣ АКТИВАЦИЯ КОДА (тест неверного)")
        r = await c.post(f"{BASE}/payments/activate-code", json={"code": "INVALID1"}, headers=hdr)
        print(f"   Статус: {r.status_code} {'✅' if r.status_code == 400 else '❌'} (ожидаемо 400)")

        # ИТОГ
        print("\n" + "=" * 60)
        print("✅ АВТОТЕСТ ЗАВЕРШЁН!")
        print("=" * 60)
        print(f"\n🌐 Сайт: http://localhost:5173")
        print(f"📖 API Docs: http://localhost:8000/docs")
        print(f"👤 Тестовый пользователь: {email}")
        print(f"🔑 Пароль: AutoTest123!")

if __name__ == "__main__":
    asyncio.run(test_all())
