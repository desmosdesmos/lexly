"""
Быстрая диагностика Google OAuth и Email
"""
import asyncio
import smtplib
import sys
from pathlib import Path

# Добавляем backend в path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings

def check_google_oauth():
    print("\n" + "="*60)
    print("🔍 GOOGLE OAUTH ДИАГНОСТИКА")
    print("="*60)
    
    client_id = settings.GOOGLE_CLIENT_ID
    
    if not client_id:
        print("❌ GOOGLE_CLIENT_ID не установлен в .env")
        return False
    
    print(f"✅ GOOGLE_CLIENT_ID: {client_id}")
    
    # Проверяем формат
    if not client_id.endswith('.apps.googleusercontent.com'):
        print("❌ Неверный формат! Должен заканчиваться на .apps.googleusercontent.com")
        return False
    
    print("✅ Формат Client ID верный")
    
    # Проверяем google-auth пакет
    try:
        from google.oauth2 import id_token
        print("✅ Пакет google-auth установлен")
    except ImportError:
        print("❌ Пакет google-auth не установлен!")
        print("   Решение: pip install google-auth")
        return False
    
    print("\n📋 ЧЕКЛИСТ GOOGLE CLOUD CONSOLE:")
    print("   1. Откройте: https://console.cloud.google.com/apis/credentials")
    print("   2. Проверьте что создан 'OAuth 2.0 Client ID' типа 'Web application'")
    print("   3. Authorized JavaScript origins:")
    print("      - http://localhost:5173")
    print("      - https://laxlylaw.ru")
    print("   4. OAuth consent screen → Publishing status: 'In production'")
    print("      (если 'Testing', то работают только test users)")
    
    return True


async def check_email():
    print("\n" + "="*60)
    print("📧 EMAIL SMTP ДИАГНОСТИКА")
    print("="*60)
    
    if not settings.SMTP_USER:
        print("❌ SMTP_USER не установлен в .env")
        return False
    
    print(f"✅ SMTP_HOST: {settings.SMTP_HOST}")
    print(f"✅ SMTP_PORT: {settings.SMTP_PORT}")
    print(f"✅ SMTP_USER: {settings.SMTP_USER}")
    print(f"✅ SMTP_PASSWORD: {'*' * len(settings.SMTP_PASSWORD)} ({len(settings.SMTP_PASSWORD)} символов)")
    print(f"✅ FROM_EMAIL: {settings.SMTP_FROM_EMAIL}")
    
    # Проверяем длину пароля (App Password = 16 символов)
    if len(settings.SMTP_PASSWORD) != 16:
        print(f"\n⚠️  Пароль = {len(settings.SMTP_PASSWORD)} символов (должно быть 16)")
        print("   Возможно пароль устарел или неверный!")
    
    # Тест подключения к SMTP
    print("\n🔄 Тест подключения к SMTP...")
    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            print("✅ Подключение к SMTP успешно!")
            print("✅ Авторизация прошла успешно!")
            return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Ошибка авторизации: {e}")
        print("\n🔧 РЕШЕНИЕ:")
        print("   1. Откройте: https://myaccount.google.com/apppasswords")
        print("   2. Удалите старый пароль для Law AI Agent")
        print("   3. Создайте новый: Select app → Other → 'Law AI Agent'")
        print("   4. Скопируйте 16-символьный пароль в .env")
        print("   5. Перезапустите backend")
        return False
    except smtplib.SMTPException as e:
        print(f"❌ Ошибка SMTP: {e}")
        return False
    except Exception as e:
        print(f"❌ Ошибка подключения: {e}")
        return False


async def test_send_email():
    print("\n" + "="*60)
    print("📨 ТЕСТ ОТПРАВКИ EMAIL")
    print("="*60)
    
    from app.services.email_service import email_service
    
    test_email = input("\nВведите email для теста (или Enter для пропуска): ").strip()
    
    if not test_email:
        print("⏭️  Пропускаю тест отправки")
        return
    
    print(f"\n🔄 Отправка тестового письма на {test_email}...")
    
    success = await email_service.send_password_reset(test_email, "http://localhost:5173/reset-password?token=test123")
    
    if success:
        print("✅ Письмо отправлено! Проверьте почту (включая папку Спам)")
    else:
        print("❌ Не удалось отправить письмо")


async def main():
    print("\n" + "="*60)
    print("🚀 DIAGNOSTIC TOOL — GOOGLE OAUTH + EMAIL")
    print("="*60)
    
    # Проверка Google OAuth
    google_ok = check_google_oauth()
    
    # Проверка Email
    email_ok = await check_email()
    
    # Итог
    print("\n" + "="*60)
    print("📊 ИТОГ ДИАГНОСТИКИ")
    print("="*60)
    
    if google_ok:
        print("✅ Google OAuth: НАСТРОЕН (проверьте Google Cloud Console)")
    else:
        print("❌ Google OAuth: НЕ НАСТРОЕН")
    
    if email_ok:
        print("✅ Email SMTP: РАБОТАЕТ")
    else:
        print("❌ Email SMTP: НЕ РАБОТАЕТ")
    
    # Тест отправки
    if email_ok:
        await test_send_email()
    
    print("\n" + "="*60)


if __name__ == "__main__":
    asyncio.run(main())
