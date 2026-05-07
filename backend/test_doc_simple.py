"""Тест генерации документа с подробным выводом ошибки."""
import asyncio
import aiohttp
import traceback

BASE_URL = "http://localhost:8000/api/v1"
EMAIL = "groqtest_doc5@example.com"
PASSWORD = "Test123!"

async def test_document_generation():
    """Тест генерации документа с полным стеком ошибки."""
    async with aiohttp.ClientSession() as session:
        # Регистрация
        async with session.post(
            f"{BASE_URL}/auth/register",
            json={
                "email": EMAIL,
                "password": PASSWORD,
                "full_name": "GROQ Test Doc",
                "user_type": "individual",
            },
        ) as resp:
            print(f"Регистрация: {resp.status}")
        
        # Логин
        async with session.post(
            f"{BASE_URL}/auth/login",
            json={"email": EMAIL, "password": PASSWORD},
        ) as resp:
            if resp.status == 200:
                data = await resp.json()
                token = data["access_token"]
                print("✅ Логин успешен")
                
                # Генерация документа
                async with session.post(
                    f"{BASE_URL}/documents/generate",
                    headers={"Authorization": f"Bearer {token}"},
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
                            "claims": ["Взыскать задолженность в размере 150000 руб."],
                        },
                    },
                ) as resp:
                    print(f"\nСтатус ответа: {resp.status}")
                    if resp.status == 201:
                        data = await resp.json()
                        print("✅ Документ успешно сгенерирован!")
                        print(f"\n📝 Первые 300 символов:\n{data['generated_content'][:300]}...")
                    else:
                        error = await resp.json()
                        print(f"❌ Ошибка: {resp.status}")
                        print(f"Detail: {error.get('detail', 'Unknown')}")
                        return False
                    return True
            else:
                print(f"❌ Ошибка логина: {resp.status}")
                return False

if __name__ == "__main__":
    result = asyncio.run(test_document_generation())
