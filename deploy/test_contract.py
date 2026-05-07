import asyncio, httpx

async def test():
    async with httpx.AsyncClient(timeout=120) as client:
        # Login
        r = await client.post('http://127.0.0.1:8000/api/v1/auth/login', json={'email':'test@test.ru','password':'Test123456'})
        token = r.json().get('access_token')
        headers = {'Authorization': f'Bearer {token}'}
        
        # Test contract review
        with open('/tmp/test_contract.txt', 'w', encoding='utf-8') as f:
            f.write('ДОГОВОР КУПЛИ-ПРОДАЖИ\nг. Москва, 2026\nООО Ромашка (Продавец) и ИП Иванов (Покупатель)\n1. Продавец обязуется передать товар\n2. Покупатель обязуется оплатить товар в течение 30 дней\n3. Цена товара: 100 000 рублей\n4. В случае неоплаты - штраф 0.1% за каждый день просрочки\n5. Ответственность сторон не ограничена\n6. Споры в арбитражном суде')
        
        with open('/tmp/test_contract.txt', 'rb') as f:
            files = {'file': ('contract.txt', f, 'text/plain')}
            r = await client.post('http://127.0.0.1:8000/api/v1/contracts/review', headers=headers, files=files)
        
        if r.status_code == 200:
            data = r.json()
            print(f'✅ SUCCESS! Risk: {data.get("risk_level","?")}')
        else:
            print(f'❌ FAILED: {r.status_code} - {r.text[:200]}')

asyncio.run(test())
