"""Тест активации промокода."""
import asyncio
import httpx

BASE = 'http://127.0.0.1:8000'

async def test():
    async with httpx.AsyncClient() as client:
        # 1. Регистрируем пользователя
        print('1. Регистрация...')
        r = await client.post(f'{BASE}/api/v1/auth/register', json={
            'email': 'promo@test.ru',
            'password': 'Test123456',
            'full_name': 'Promo Test'
        })
        print(f'   Status: {r.status_code}')
        
        # 2. Логин
        print('\n2. Логин...')
        r = await client.post(f'{BASE}/api/v1/auth/login', json={
            'email': 'promo@test.ru',
            'password': 'Test123456'
        })
        token = r.json().get('access_token')
        headers = {'Authorization': f'Bearer {token}'}
        print(f'   Token: {token[:30]}...')
        
        # 3. Пробуем активировать промокод
        print('\n3. Активация промокода 79CNZCEE...')
        r = await client.post(f'{BASE}/api/v1/payments/activate-code', 
                              headers=headers, 
                              json={'code': '79CNZCEE'})
        print(f'   Status: {r.status_code}')
        if r.status_code == 200:
            print(f'   ✅ УСПЕХ! {r.json()}')
        else:
            print(f'   ❌ ОШИБКА: {r.json()}')

asyncio.run(test())
