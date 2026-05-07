import asyncio
import aiosqlite
from datetime import date

async def fix_reset_date():
    async with aiosqlite.connect('law_ai.db') as db:
        today = date.today().isoformat()  # "2026-04-08"
        await db.execute('UPDATE usage_limits SET reset_date = ?', (today,))
        await db.commit()
        
        async with db.execute('SELECT id, reset_date FROM usage_limits LIMIT 3') as cur:
            rows = await cur.fetchall()
            for r in rows:
                print(f"  id={r[0][:8]}... reset_date={r[1]}")
        print(f"✅ reset_date установлен на {today}")

asyncio.run(fix_reset_date())
