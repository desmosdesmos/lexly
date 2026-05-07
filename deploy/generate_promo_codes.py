"""Генерация промокодов для тестирования."""
import asyncio
import httpx

async def gen():
    async with httpx.AsyncClient() as client:
        codes = [
            ('pro', 1, 'PRO1MONTH'),
            ('basic', 3, 'BASIC3M'),
            ('pro', 6, 'PRO6MONTHS'),
        ]
        print('Генерация промокодов:')
        print('='*50)
        for plan, months, custom_code in codes:
            # Используем кастомный код для удобства
            r = await client.post(
                'http://127.0.0.1:8000/api/v1/payments/admin/generate-code',
                json={'plan_id': plan, 'months': months}
            )
            if r.status_code == 200:
                data = r.json()
                print(f'✅ Код: {data["code"]} | План: {data["plan_id"]} | Месяцев: {data["months"]}')
            else:
                print(f'❌ Ошибка: {r.status_code} - {r.text[:100]}')

asyncio.run(gen())
