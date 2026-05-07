"""Тест GigaChat через официальный SDK."""
import asyncio
from gigachat import GigaChat


async def test_sdk():
    """Тест через официальный SDK."""
    print("🧪 ТЕСТ GIGACHAT ЧЕРЕЗ ОФИЦИАЛЬНЫЙ SDK")
    print("=" * 60)
    
    client_id = "019d790e-8da9-72a6-ad4a-d8c5ae5b7263"
    client_secret = "116eb66c-fd06-44ec-b3ab-c6b9e860804d"
    
    print(f"\n📋 Подключение:")
    print(f"   Client ID: {client_id[:20]}...")
    print(f"   Client Secret: {client_secret[:20]}...")
    print(f"   Scope: GIGACHAT_API_PERS")
    print(f"   Model: GigaChat-Pro")
    
    try:
        # Инициализация клиента с правильными credentials
        # Для PERS используем client_id:client_secret в credentials
        import base64
        credentials = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
        
        print(f"\n🔑 Credentials (base64): {credentials[:40]}...")
        
        client = GigaChat(
            credentials=credentials,
            scope="GIGACHAT_API_PERS",
            verify_ssl_certs=False,
            model="GigaChat",  # Пробуем базовую модель
        )
        
        print("\n💬 Отправка запроса...")
        
        # Правильный вызов через объект Chat
        from gigachat.models import Chat, Messages
        chat = Chat(
            messages=[Messages(role="user", content="Привет! Как дела? Ответь кратко.")],
        )
        response = client.chat(chat)
        
        print(f"\n✅ УСПЕХ!")
        print(f"Ответ: {response.choices[0].message.content}")
        print(f"Токенов использовано: {response.usage.total_tokens}")
        return True
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    result = asyncio.run(test_sdk())
    import sys
    sys.exit(0 if result else 1)
