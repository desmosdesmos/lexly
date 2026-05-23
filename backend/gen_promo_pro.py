"""Скрипт для генерации 5 промокодов для тарифа PRO."""
import asyncio
import secrets
import string
import os
import sys

# Добавляем путь к приложению
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.database import async_session_maker
from app.models.activation_code import ActivationCode
from sqlalchemy import select

async def main():
    print("🚀 Генерация 5 промокодов для тарифа PRO...")
    
    quantity = 5
    plan_id = "pro"
    months = 1
    
    generated_codes = []
    
    async with async_session_maker() as db:
        for _ in range(quantity):
            # Генерируем уникальный 8-значный код
            while True:
                code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
                # Проверка на уникальность
                stmt = select(ActivationCode).where(ActivationCode.code == code)
                result = await db.execute(stmt)
                if not result.scalar_one_or_none():
                    break
            
            new_code = ActivationCode(
                code=code,
                plan_id=plan_id,
                months=months
            )
            db.add(new_code)
            generated_codes.append(code)
            
        await db.commit()
    
    print("\n✅ Успешно создано 5 промокодов:")
    print("-" * 20)
    for i, c in enumerate(generated_codes, 1):
        print(f"{i}. {c}")
    print("-" * 20)
    print("Тариф: PRO (1 месяц)")

if __name__ == "__main__":
    asyncio.run(main())
