import aiosqlite
import asyncio

async def check():
    async with aiosqlite.connect('law_ai.db') as db:
        async with db.execute('SELECT typeof(id), id, email FROM users WHERE email = "test@example.com"') as c:
            row = await c.fetchone()
            with open('user_check.txt', 'w') as f:
                f.write(f'Type: {row[0]}\n')
                f.write(f'ID: {row[1]}\n')
                f.write(f'Email: {row[2]}\n')
                f.write(f'ID repr: {repr(row[1])}\n')
                f.write(f'ID len: {len(row[1])}\n')
asyncio.run(check())
