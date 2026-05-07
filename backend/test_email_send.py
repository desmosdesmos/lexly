"""Тест отправки email."""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.services.email_service import email_service


async def test_email():
    print("📧 ТЕСТ ОТПРАВКИ EMAIL")
    print("=" * 60)
    
    to_email = "yan.pashhenko6486@gmail.com"
    reset_token = "test_token_12345678901234567890"
    reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
    
    print(f"\nОтправка на: {to_email}")
    print(f"Ссылка: {reset_link}")
    
    result = await email_service.send_password_reset(to_email, reset_link)
    
    if result:
        print("\n✅ EMAIL УСПЕШНО ОТПРАВЛЕН!")
        print(f"   Проверьте почту: {to_email}")
        print(f"   (Также проверьте папку Спам)")
    else:
        print("\n❌ EMAIL НЕ ОТПРАВЛЕН")
        print("   Проверьте логи сервера")
    
    return result


if __name__ == "__main__":
    result = asyncio.run(test_email())
    sys.exit(0 if result else 1)
