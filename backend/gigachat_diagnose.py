"""Диагностика подключения к GigaChat API."""
import asyncio
import httpx


async def diagnose():
    """Полная диагностика подключения."""
    print("🔍 ДИАГНОСТИКА GIGACHAT API")
    print("=" * 60)
    
    # Тест 1: Проверка доступности endpoint
    print("\n📡 Тест 1: Проверка доступности API endpoint")
    try:
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            response = await client.get("https://gigachat.devices.sberbank.ru/api/v1")
            print(f"   Статус: {response.status_code}")
            print(f"   Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
    
    # Тест 2: Проверка OAuth endpoint
    print("\n🔑 Тест 2: Проверка OAuth endpoint")
    try:
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            response = await client.post(
                "https://gigachat.devices.sberbank.ru/api/v1/oauth",
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"scope": "GIGACHAT_API_PERS"}
            )
            print(f"   Статус: {response.status_code}")
            print(f"   Ответ: {response.text[:300]}")
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
    
    # Тест 3: Проверка с авторизацией
    print("\n🔐 Тест 3: Проверка с правильной Basic авторизацией")
    client_id = "019d790e-8da9-72a6-ad4a-d8c5ae5b7263"
    client_secret = "116eb66c-fd06-44ec-b3ab-c6b9e860804d"
    
    # Создаем правильную Basic Auth строку
    import base64
    credentials = f"{client_id}:{client_secret}"
    auth_header = base64.b64encode(credentials.encode("utf-8")).decode("utf-8")
    print(f"   Client ID: {client_id}")
    print(f"   Client Secret: {client_secret}")
    print(f"   Auth Header: Basic {auth_header[:30]}...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
            response = await client.post(
                "https://gigachat.devices.sberbank.ru/api/v1/oauth",
                headers={
                    "Authorization": f"Basic {auth_header}",
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "RqUID": client_id,
                },
                data={"scope": "GIGACHAT_API_PERS"}
            )
            print(f"   Статус: {response.status_code}")
            print(f"   Ответ: {response.text[:500]}")
            
            if response.status_code == 200:
                token_data = response.json()
                print(f"   ✅ Токен получен!")
                print(f"   Expires at: {token_data.get('expires_at')}")
    except Exception as e:
        print(f"   ❌ Ошибка: {e}")
    
    print("\n" + "=" * 60)
    print("💡 ВОЗМОЖНЫЕ ПРИЧИНЫ ОШИБОК:")
    print("   1. Ключ GigaChat не активирован для IP адреса")
    print("   2. Требуется регистрация IP в личном кабинете GigaChat")
    print("   3. Корпоративный файрвол блокирует доступ")
    print("   4. Неверный scope (попробуйте GIGACHAT_API_CORP или B2B)")
    print("\n📝 РЕКОМЕНДАЦИИ:")
    print("   1. Зайдите в личный кабинет GigaChat: https://developers.sber.ru/gigachat")
    print("   2. Проверьте статус приложения")
    print("   3. Добавьте ваш IP в разрешенные (если есть такая опция)")
    print("   4. Попробуйте с другого internet подключения (мобильный hotspot)")


if __name__ == "__main__":
    asyncio.run(diagnose())
