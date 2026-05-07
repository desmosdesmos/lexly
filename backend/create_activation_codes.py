"""Скрипт для генерации кодов активации в БД."""
import asyncio
import sys
import os
import secrets
import string

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.database import async_session_maker
from app.models.activation_code import ActivationCode


async def generate_codes():
    """Сгенерировать коды активации и сохранить в БД."""
    print("🔑 ГЕНЕРАТОР КОДОВ АКТИВАЦИИ")
    print("=" * 60)
    
    # Настройки кодов
    codes_to_create = [
        # (plan_id, months, quantity)
        ("basic", 1, 5),
        ("pro", 1, 10),
        ("enterprise", 1, 3),
    ]
    
    all_codes = []
    
    async with async_session_maker() as db:
        for plan_id, months, quantity in codes_to_create:
            print(f"\n📦 Генерирую {quantity} кодов для тарифа '{plan_id}' ({months} мес.)...")
            
            for i in range(quantity):
                # Генерируем уникальный код
                while True:
                    code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
                    # Проверяем уникальность
                    from sqlalchemy import select
                    existing = await db.execute(select(ActivationCode).where(ActivationCode.code == code))
                    if not existing.scalar_one_or_none():
                        break
                
                # Создаём запись
                activation_code = ActivationCode(
                    code=code,
                    plan_id=plan_id,
                    months=months,
                )
                db.add(activation_code)
                all_codes.append((code, plan_id, months))
            
            print(f"   ✅ Сгенерировано {quantity} кодов")
        
        await db.commit()
        print(f"\n💾 Всего создано: {len(all_codes)} кодов")
    
    # Выводим все коды
    print("\n" + "=" * 60)
    print("📋 СПИСОК КОДОВ:")
    print("=" * 60)
    
    prices = {
        "basic": "990 ₽/мес",
        "pro": "2 990 ₽/мес",
        "enterprise": "9 990 ₽/мес",
    }
    
    for code, plan_id, months in all_codes:
        print(f"  {code}  |  {plan_id:12}  |  {prices[plan_id]:15}  |  {months} мес.")
    
    print("\n" + "=" * 60)
    print("💡 Эти коды можно отправлять клиентам после оплаты!")
    print("   Клиент вводит код в профиле → подписка активируется")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(generate_codes())
