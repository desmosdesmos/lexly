import aiosqlite
import asyncio
import sys

async def check():
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'law_ai.db'
    async with aiosqlite.connect(db_path) as db:
        async with db.execute('SELECT name FROM sqlite_master WHERE type="table"') as cursor:
            tables = await cursor.fetchall()
            print(f"Tables: {tables}")
            
        async with db.execute('SELECT COUNT(*) FROM users') as cursor:
            count = await cursor.fetchone()
            print(f"User count: {count[0]}")
            
        async with db.execute('SELECT id, email, full_name FROM users') as cursor:
            users = await cursor.fetchall()
            print(f"Users ({len(users)}):")
            for u in users:
                print(f"  - {u[0]}: {u[1]} ({u[2]})")

asyncio.run(check())
