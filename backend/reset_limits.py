import asyncio
import aiosqlite

async def reset_limits():
    email = "test@law.ai"
    
    async with aiosqlite.connect('law_ai.db') as db:
        # Найти пользователя
        async with db.execute('SELECT id FROM users WHERE email = ?', (email,)) as cur:
            row = await cur.fetchone()
            if not row:
                print("Пользователь не найден!")
                return
            user_id = row[0]
        
        # Сбросить лимиты
        await db.execute(
            'UPDATE usage_limits SET documents_generated = 0, max_documents = 50, contracts_reviewed = 0, max_contracts = 30 WHERE user_id = ?',
            (user_id,)
        )
        await db.commit()
        
        # Проверить результат
        async with db.execute('SELECT max_documents, documents_generated, max_contracts, contracts_reviewed FROM usage_limits WHERE user_id = ?', (user_id,)) as cur:
            row = await cur.fetchone()
            print(f"✅ Лимиты обновлены:")
            print(f"   Документы: {row[1]}/{row[0]}")
            print(f"   Договоры: {row[3]}/{row[2]}")

asyncio.run(reset_limits())
