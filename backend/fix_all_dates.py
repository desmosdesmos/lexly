import asyncio
import aiosqlite
from datetime import datetime

async def fix_all_dates():
    async with aiosqlite.connect('law_ai.db') as db:
        # Получить все записи
        async with db.execute('SELECT id, reset_date FROM usage_limits') as cur:
            rows = await cur.fetchall()
        
        for row_id, reset_date in rows:
            if reset_date:
                # Привести к ISO формату
                try:
                    dt = datetime.fromisoformat(reset_date.replace('Z', '+00:00') if 'T' in reset_date else reset_date.replace(' ', 'T'))
                    iso = dt.isoformat()
                except:
                    iso = datetime.now().isoformat()
                
                await db.execute('UPDATE usage_limits SET reset_date = ? WHERE id = ?', (iso, row_id))
        
        await db.commit()
        print("✅ Все даты исправлены")
        
        # Проверить
        async with db.execute('SELECT id, reset_date FROM usage_limits LIMIT 3') as cur:
            rows = await cur.fetchall()
            for r in rows:
                print(f"  {r[0]}: {r[1]}")

asyncio.run(fix_all_dates())
