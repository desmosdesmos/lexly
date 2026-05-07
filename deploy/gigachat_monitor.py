"""Мониторинг токенов GigaChat с уведомлениями в Telegram."""
import httpx
import base64
import asyncio
import os
from datetime import datetime

GIGACHAT_CLIENT_ID = os.getenv('GIGACHAT_CLIENT_ID', '019d790e-8da9-72a6-ad4a-d8c5ae5b7263')
GIGACHAT_CLIENT_SECRET = os.getenv('GIGACHAT_CLIENT_SECRET', '116eb66c-fd06-44ec-b3ab-c6b9e860804d')
GIGACHAT_SCOPE = os.getenv('GIGACHAT_SCOPE', 'GIGACHAT_API_PERS')
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '8470156263:AAGM25GR-y9gUxREqxEvEMdo5mCmG16_tME')
TELEGRAM_ADMIN_CHAT_ID = os.getenv('TELEGRAM_ADMIN_CHAT_ID', '478799066')

async def get_gigachat_token():
    """Получить токен GigaChat API."""
    credentials = base64.b64encode(
        f"{GIGACHAT_CLIENT_ID}:{GIGACHAT_CLIENT_SECRET}".encode("utf-8")
    ).decode("utf-8")
    
    import ssl
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    
    async with httpx.AsyncClient(timeout=30, verify=False) as client:
        r = await client.post(
            'https://ngw.devices.sberbank.ru:9443/api/v2/oauth',
            headers={
                'Authorization': f'Bearer {credentials}',
                'RqUID': 'monitoring-script',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data={'scope': GIGACHAT_SCOPE}
        )
        if r.status_code == 200:
            return r.json().get('access_token')
        return None

async def send_telegram(message):
    """Отправить сообщение в Telegram."""
    url = f'https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage'
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(url, json={
            'chat_id': TELEGRAM_ADMIN_CHAT_ID,
            'text': message,
            'parse_mode': 'HTML',
        })
        return r.status_code == 200

async def check_balance():
    """Проверить баланс токенов через тестовый запрос."""
    print(f"[{datetime.now()}] Проверка GigaChat...")
    
    token = await get_gigachat_token()
    if not token:
        await send_telegram('❌ <b>GigaChat Error</b>\nНе удалось получить токен. Проверьте Client ID/Secret.')
        return
    
    # Тестовый запрос для проверки статуса
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(
            'https://api.giga.chat/v1/chat/completions',
            headers={'Authorization': f'Bearer {token}'},
            json={
                'model': 'GigaChat-Max',
                'messages': [{'role': 'user', 'content': 'тест'}],
                'max_tokens': 5,
            }
        )
        
        if r.status_code == 402:
            msg = f'''🚨 <b>GigaChat: Токены закончились!</b>

⏰ {datetime.now().strftime('%d.%m.%Y %H:%M')}

Модель GigaChat-Max: ❌ Payment Required

Что делать:
1. https://developers.sber.ru/studio/gigachat
2. Пополните баланс
3. Или переключитесь на GigaChat-Lite

Сервер: SSH root@195.58.34.47
Команда: sed -i 's/GIGACHAT_MODEL=GigaChat-Max/GIGACHAT_MODEL=GigaChat-Lite/' /opt/law-ai-agent/backend/.env && supervisorctl restart lawai-backend'''
            await send_telegram(msg)
            print("❌ Токены закончились!")
            
        elif r.status_code in [200, 400]:
            used = r.json().get('usage', {})
            total = used.get('total_tokens', 0)
            print(f"✅ GigaChat работает. Использовано токенов: {total}")
        else:
            await send_telegram(f'⚠️ GigaChat статус: {r.status_code}\n{r.text[:300]}')

if __name__ == '__main__':
    asyncio.run(check_balance())
