import asyncio
import aiosqlite

async def check():
    user_id = '2789cc36-d6ca-4c07-9eca-c92224ec6723'
    async with aiosqlite.connect('law_ai.db') as db:
        async with db.execute('SELECT id, user_id, plan_type, max_documents, documents_generated, reset_date FROM usage_limits WHERE user_id = ?', (user_id,)) as cur:
            rows = await cur.fetchall()
            print(f"usage_limits записей: {len(rows)}")
            for r in rows:
                print(r)

asyncio.run(check())
