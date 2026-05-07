import httpx
import json

BASE = 'http://127.0.0.1:8000'

async def test():
    async with httpx.AsyncClient(timeout=120) as client:
        print('=== 1. REGISTER ===')
        r = await client.post(f'{BASE}/api/v1/auth/register', json={
            'email': 'test2@test.ru',
            'password': 'Test123456',
            'full_name': 'Test User 2'
        })
        print(f'Status: {r.status_code}')
        if r.status_code == 200:
            print('OK - User created')
        elif r.status_code == 400:
            print('User already exists')
        print()
        
        print('=== 2. LOGIN ===')
        r = await client.post(f'{BASE}/api/v1/auth/login', json={
            'email': 'test@test.ru',
            'password': 'Test123456'
        })
        data = r.json()
        token = data.get('access_token')
        print(f'Token: {token[:50]}...')
        print()
        
        headers = {'Authorization': f'Bearer {token}'}
        
        print('=== 3. GENERATE DOCUMENT (GigaChat AI) ===')
        r = await client.post(f'{BASE}/api/v1/documents/generate', headers=headers, json={
            'document_type': 'claim',
            'data': {
                'court_name': 'Арбитражный суд г. Москвы',
                'plaintiff': {'name': 'ООО Ромашка', 'inn': '7701234567', 'address': 'г. Москва'},
                'defendant': {'name': 'ООО Василёк', 'inn': '7709876543', 'address': 'г. Москва'},
                'circumstances': 'Не оплачен товар по договору',
                'legal_basis': 'ст. 309, 310, 486 ГК РФ',
                'claims': ['Взыскать 100 000 руб']
            }
        })
        data = r.json()
        if r.status_code == 200:
            print('SUCCESS!')
            print(f'Status: {data.get("status")}')
            content = data.get('generated_content', '')
            print(f'Length: {len(content)} chars')
            print(f'First 400 chars:')
            print(content[:400])
        else:
            print(f'FAILED: {r.status_code}')
            print(json.dumps(data, indent=2, ensure_ascii=False))
        print()
        
        print('=== 4. CONTRACT REVIEW (GigaChat AI) ===')
        print('Testing...')
        with open('/tmp/test_contract.txt', 'w', encoding='utf-8') as f:
            f.write('ДОГОВОР КУПЛИ-ПРОДАЖИ\nМосква, 2026\nООО Ромашка и ИП Иванов заключили договор')
        
        with open('/tmp/test_contract.txt', 'rb') as f:
            files = {'file': ('contract.txt', f, 'text/plain')}
            r = await client.post(f'{BASE}/api/v1/contracts/review', headers=headers, files=files)
        
        if r.status_code == 200:
            data = r.json()
            print('SUCCESS!')
            print(f'Risk level: {data.get("risk_level")}')
            analysis = data.get('analysis', {})
            print(f'Summary: {analysis.get("summary", "")[:200]}')
        else:
            print(f'FAILED: {r.status_code}')
            print(json.dumps(r.json(), indent=2, ensure_ascii=False)[:500])
        print()
        
        print('=== 5. COURT PRACTICE (GigaChat AI) ===')
        r = await client.post(f'{BASE}/api/v1/court-practice/analyze', headers=headers, json={
            'topic': 'взыскание долга по договору'
        })
        if r.status_code == 200:
            data = r.json()
            print('SUCCESS!')
            print(f'Topic: {data.get("topic", "")}')
            print(f'Trends: {len(data.get("key_trends", []))}')
        else:
            print(f'FAILED: {r.status_code}')
            print(json.dumps(r.json(), indent=2, ensure_ascii=False)[:500])
        print()
        
        print('=== 6. LEGISLATION MONITOR (GigaChat AI) ===')
        r = await client.post(f'{BASE}/api/v1/legislation/monitor', headers=headers, json={
            'topic': 'защита прав потребителей'
        })
        if r.status_code == 200:
            data = r.json()
            print('SUCCESS!')
            print(f'Report date: {data.get("report_date", "")}')
            print(f'Changes: {len(data.get("changes", []))}')
        else:
            print(f'FAILED: {r.status_code}')
            print(json.dumps(r.json(), indent=2, ensure_ascii=False)[:500])
        
        print()
        print('='*60)
        print('ALL TESTS COMPLETED!')

import asyncio
asyncio.run(test())
