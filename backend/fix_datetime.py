import asyncio
import aiosqlite

async def fix_all_datetime_cols():
    async with aiosqlite.connect('law_ai.db') as db:
        tables_with_dt = [
            ('usage_limits', ['created_at', 'updated_at']),
        ]
        
        for table, columns in tables_with_dt:
            for col in columns:
                try:
                    # Найти записи без T
                    async with db.execute(f'SELECT id, {col} FROM {table} WHERE {col} NOT LIKE "%T%" AND {col} IS NOT NULL') as cur:
                        rows = await cur.fetchall()
                        fixed = 0
                        for row_id, val in rows:
                            if val and 'T' not in str(val):
                                # Заменить пробел на T
                                new_val = str(val).replace(' ', 'T')
                                await db.execute(f'UPDATE {table} SET {col} = ? WHERE id = ?', (new_val, row_id))
                                fixed += 1
                        if fixed:
                            print(f"  {table}.{col}: исправлено {fixed} записей")
                except Exception as e:
                    print(f"  {table}.{col}: ошибка {e}")
        
        await db.commit()
        print("✅ Готово")
        
        # Проверить usage_limits
        async with db.execute('SELECT id, created_at, updated_at FROM usage_limits LIMIT 2') as cur:
            rows = await cur.fetchall()
            for r in rows:
                print(f"  id={r[0][:8]}... created_at={r[1]}, updated_at={r[2]}")

asyncio.run(fix_all_datetime_cols())
