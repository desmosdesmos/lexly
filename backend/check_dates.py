import asyncio
import aiosqlite

async def check():
    user_id = '2789cc36-d6ca-4c07-9eca-c92224ec6723'
    async with aiosqlite.connect('law_ai.db') as db:
        async with db.execute('SELECT id, user_id, reset_date FROM usage_limits WHERE user_id = ?', (user_id,)) as cur:
            rows = await cur.fetchall()
            print(f"usage_limits для test@law.ai: {len(rows)}")
            for r in rows:
                print(f"  id={r[0]}, reset_date='{r[2]}'")
        
        # Просто покажу все записи с плохими датами
        print("\nВсе записи:")
        async with db.execute('SELECT id, user_id, reset_date FROM usage_limits') as cur:
            rows = await cur.fetchall()
            for r in rows:
                has_t = 'T' in str(r[2]) if r[2] else 'NULL'
                print(f"  id={r[0][:8]}... user={r[1][:8]}... reset_date='{r[2]}' has_T={has_t}")

asyncio.run(check())
