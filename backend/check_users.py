import asyncio
import aiosqlite

async def check():
    async with aiosqlite.connect('law_ai.db') as db:
        async with db.execute('SELECT id, email, full_name, created_at FROM users') as cur:
            rows = await cur.fetchall()
            print(f'Users: {len(rows)}')
            for r in rows:
                print(r)

asyncio.run(check())
