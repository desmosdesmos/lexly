"""Генерация 20 промокодов для каждого плана."""
import asyncio
import httpx
import random
import string

async def gen():
    async with httpx.AsyncClient(timeout=30) as client:
        plans = [
            ('free', 1, 20),
            ('basic', 1, 20),
            ('pro', 1, 20),
            ('enterprise', 1, 20),
        ]
        
        all_codes = []
        
        for plan, months, count in plans:
            print(f'\n{plan.upper()} x{count}:')
            print('='*50)
            
            for i in range(count):
                # Генерируем читаемый код
                code = f'{plan[:3].upper()}'
                code += ''.join(random.choices(string.digits + string.ascii_uppercase, k=6))
                
                r = await client.post(
                    'http://127.0.0.1:8000/api/v1/payments/admin/generate-code',
                    json={'plan_id': plan, 'months': months}
                )
                if r.status_code == 200:
                    data = r.json()
                    print(f'  {data["code"]}')
                    all_codes.append((data['code'], plan, months))
                else:
                    print(f'  Ошибка: {r.status_code}')
        
        print('\n' + '='*50)
        print(f'ВСЕГО СОЗДАНО: {len(all_codes)} промокодов')
        print('='*50)
        
        # Суммарная таблица
        for plan in ['free', 'basic', 'pro', 'enterprise']:
            count = sum(1 for c in all_codes if c[1] == plan)
            print(f'  {plan}: {count} кодов')

asyncio.run(gen())
