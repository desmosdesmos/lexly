import httpx
import json

BASE = 'http://127.0.0.1:8000'

async def test():
    async with httpx.AsyncClient(timeout=120) as client:
        print('='*60)
        print('ТЕСТИРОВАНИЕ ВСЕХ AI ФУНКЦИЙ НА СЕРВЕРЕ')
        print('='*60)
        print()
        
        # Login
        print('1. LOGIN...')
        r = await client.post(f'{BASE}/api/v1/auth/login', json={
            'email': 'test@test.ru',
            'password': 'Test123456'
        })
        token = r.json().get('access_token')
        headers = {'Authorization': f'Bearer {token}'}
        print('   OK')
        print()
        
        # Test 1: Document Generation
        print('2. GENERATE DOCUMENT (GigaChat)...')
        r = await client.post(f'{BASE}/api/v1/documents/generate', headers=headers, json={
            'document_type': 'claim',
            'data': {
                'court_name': 'Арбитражный суд г. Москвы',
                'plaintiff': {'name': 'ООО Тест', 'inn': '7701111111', 'address': 'Москва'},
                'defendant': {'name': 'ООО Должник', 'inn': '7702222222', 'address': 'Москва'},
                'circumstances': 'Не оплачен товар',
                'legal_basis': 'ст. 309, 310 ГК РФ',
                'claims': ['Взыскать 50 000 руб']
            }
        })
        if r.status_code == 201:
            data = r.json()
            print(f'   SUCCESS - {len(data.get("generated_content", ""))} chars')
        else:
            print(f'   FAILED: {r.status_code}')
        print()
        
        # Test 2: Court Practice
        print('3. COURT PRACTICE ANALYSIS (GigaChat)...')
        r = await client.post(f'{BASE}/api/v1/court-practice/analyze', headers=headers, json={
            'topic': 'взыскание долга по договору'
        })
        if r.status_code == 200:
            data = r.json()
            analysis = data.get('analysis', {})
            print(f'   SUCCESS - Topic: {analysis.get("topic", "")}')
            print(f'   Trends: {len(analysis.get("key_trends", []))}')
        else:
            print(f'   FAILED: {r.status_code} - {r.json().get("detail", "")[:100]}')
        print()
        
        # Test 3: Legislation Monitor
        print('4. LEGISLATION MONITOR (GigaChat)...')
        r = await client.post(f'{BASE}/api/v1/legislation/monitor', headers=headers, json={
            'topic': 'защита прав потребителей'
        })
        if r.status_code == 200:
            data = r.json()
            print(f'   SUCCESS - Date: {data.get("report_date", "")}')
            print(f'   Changes: {len(data.get("changes", []))}')
        else:
            print(f'   FAILED: {r.status_code} - {r.json().get("detail", "")[:100]}')
        print()
        
        print('='*60)
        print('ТЕСТ ЗАВЕРШЁН!')
        print('='*60)

import asyncio
asyncio.run(test())
