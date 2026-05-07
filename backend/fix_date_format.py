import asyncio
import aiosqlite

async def fix_date():
    async with aiosqlite.connect('law_ai.db') as db:
        # Исправить формат даты в usage_limits
        await db.execute(
            "UPDATE usage_limits SET reset_date = replace(reset_date, ' ', 'T') || 'Z' WHERE reset_date NOT LIKE '%T%'"
        )
        await db.commit()
        
        # Проверить
        async with db.execute('SELECT id, reset_date FROM usage_limits') as cur:
            rows = await cur.fetchall()
            for r in rows:
                print(f"id={r[0]}, reset_date={r[1]}")
        
        print("✅ Даты исправлены")

asyncio.run(fix_date())
