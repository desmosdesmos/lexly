"""Быстрый тест всех auth endpoints."""
import asyncio
import httpx
import secrets

async def test_auth():
    print("🧪 ТЕСТИРОВАНИЕ GOOGLE OAUTH И ВОССТАНОВЛЕНИЯ ПАРОЛЯ")
    print("=" * 70)
    
    base = "http://localhost:8000/api/v1"
    
    async with httpx.AsyncClient() as client:
        # 1. Регистрация
        print("\n1️⃣ РЕГИСТРАЦИЯ")
        email = f"test-restore-{secrets.token_hex(4)}@example.com"
        password = "TestPassword123!"
        
        r = await client.post(f"{base}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": "Test User",
            "user_type": "individual"
        })
        print(f"   Статус: {r.status_code}")
        if r.status_code == 201:
            print(f"   ✅ Пользователь создан: {email}")
        elif r.status_code == 400:
            email = "test-restore@example.com"
            print(f"   ℹ️ Использую существующего: {email}")
        else:
            print(f"   ❌ Ошибка: {r.text}")
            return False
        
        # 2. Login
        print("\n2️⃣ ВХОД")
        r = await client.post(f"{base}/auth/login", json={
            "email": email,
            "password": password
        })
        if r.status_code == 200:
            token = r.json()["access_token"]
            print(f"   ✅ Токен получен: {token[:30]}...")
        else:
            print(f"   ❌ Ошибка входа: {r.text}")
            return False
        
        # 3. Forgot password
        print("\n3️⃣ ЗАПРОС ВОССТАНОВЛЕНИЯ ПАРОЛЯ")
        r = await client.post(f"{base}/auth/forgot-password", json={"email": email})
        if r.status_code == 200:
            print(f"   ✅ Ответ: {r.json()['message'][:60]}...")
        else:
            print(f"   ❌ Ошибка: {r.text}")
            return False
        
        # 4. Профиль (проверка токена)
        print("\n4️⃣ ПОЛУЧЕНИЕ ПРОФИЛЯ")
        r = await client.get(f"{base}/user/profile", headers={
            "Authorization": f"Bearer {token}"
        })
        if r.status_code == 200:
            profile = r.json()
            print(f"   ✅ Профиль: {profile.get('email')} | {profile.get('full_name')}")
        else:
            print(f"   ❌ Ошибка: {r.text}")
        
        # 5. Проверка Google OAuth конфигурации
        print("\n5️⃣ GOOGLE OAUTH СТАТУС")
        from app.config import settings
        if settings.GOOGLE_CLIENT_ID:
            print(f"   ✅ GOOGLE_CLIENT_ID настроен: {settings.GOOGLE_CLIENT_ID[:30]}...")
        else:
            print(f"   ⚠️ GOOGLE_CLIENT_ID не настроен")
            print(f"   📖 Инструкция: docs/GOOGLE_OAUTH_SETUP.md")
        
        # 6. Проверка Email
        print("\n6️⃣ EMAIL СТАТУС")
        if settings.SMTP_USER:
            print(f"   ✅ SMTP настроен: {settings.SMTP_HOST}:{settings.SMTP_PORT}")
            print(f"   ✅ Email: {settings.SMTP_USER}")
        else:
            print(f"   ⚠️ SMTP не настроен")
            print(f"   📖 Добавьте SMTP credentials в backend/.env")
        
        print("\n" + "=" * 70)
        print("✅ ТЕСТИРОВАНИЕ ЗАВЕРШЕНО!")
        print("=" * 70)
        print("\n🌐 Откройте в браузере:")
        print(f"   Frontend: http://localhost:5173")
        print(f"   Login:    http://localhost:5173/login")
        print(f"   Forgot:   http://localhost:5173/forgot-password")
        print(f"   Swagger:  http://localhost:8000/docs")
        
        return True

if __name__ == "__main__":
    result = asyncio.run(test_auth())
    import sys
    sys.exit(0 if result else 1)
