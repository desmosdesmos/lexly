import asyncio
import aiosqlite

async def check_and_fix():
    email = "test@law.ai"
    
    async with aiosqlite.connect('law_ai.db') as db:
        async with db.execute('SELECT id FROM users WHERE email = ?', (email,)) as cur:
            row = await cur.fetchone()
            if not row:
                print("Пользователь не найден!")
                return
            user_id = row[0]
        
        # Проверить текущие лимиты
        async with db.execute('SELECT max_documents, documents_generated, max_contracts, contracts_reviewed FROM usage_limits WHERE user_id = ?', (user_id,)) as cur:
            limits = await cur.fetchone()
            if limits:
                print(f"Текущие лимиты: max_doc={limits[0]}, gen={limits[1]}, max_cont={limits[2]}, rev={limits[3]}")
            else:
                print("Лимиты не найдены! Создаю...")
                import uuid
                limit_id = str(uuid.uuid4())
                await db.execute(
                    'INSERT INTO usage_limits (id, user_id, plan_type, max_documents, documents_generated, max_contracts, contracts_reviewed, reset_date) VALUES (?, ?, "free", 50, 0, 30, 0, datetime("now"))',
                    (limit_id, user_id)
                )
                await db.commit()
                print("Лимиты созданы: 50 документов, 30 договоров")
                return
        
        # Сбросить
        await db.execute(
            'UPDATE usage_limits SET documents_generated = 0, max_documents = 50, contracts_reviewed = 0, max_contracts = 30 WHERE user_id = ?',
            (user_id,)
        )
        await db.commit()
        
        # Проверить
        async with db.execute('SELECT max_documents, documents_generated FROM usage_limits WHERE user_id = ?', (user_id,)) as cur:
            new_limits = await cur.fetchone()
            print(f"Новые лимиты: max_doc={new_limits[0]}, gen={new_limits[1]}")

asyncio.run(check_and_fix())
