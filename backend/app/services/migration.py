"""Миграция БД: добавление новых колонок для подписок и учёта."""
import asyncio
import aiosqlite


async def migrate_db():
    """Добавить новые колонки в существующие таблицы."""
    async with aiosqlite.connect('law_ai.db') as db:
        # 1. Обновить users — поля подписки
        user_columns = [
            ("subscription_type", "TEXT DEFAULT 'free'"),
            ("subscription_expires_at", "TEXT"),
            ("subscription_is_trial", "INTEGER DEFAULT 0"),
            ("subscription_is_active", "INTEGER DEFAULT 1"),
            ("subscription_last_charged_at", "TEXT"),
        ]
        for col_name, col_def in user_columns:
            try:
                await db.execute(f'ALTER TABLE users ADD COLUMN {col_name} {col_def}')
                print(f"  users.{col_name} добавлена")
            except Exception:
                print(f"  users.{col_name} уже существует")

        # 2. Обновить usage_limits — новые поля учёта
        usage_columns = [
            ("tokens_used_this_month", "INTEGER DEFAULT 0"),
            ("ai_requests_today", "INTEGER DEFAULT 0"),
            ("court_practice_today", "INTEGER DEFAULT 0"),
            ("law_monitoring_today", "INTEGER DEFAULT 0"),
            ("last_ai_request_date", "TEXT"),
            ("last_court_practice_date", "TEXT"),
            ("last_law_monitoring_date", "TEXT"),
        ]
        for col_name, col_def in usage_columns:
            try:
                await db.execute(f'ALTER TABLE usage_limits ADD COLUMN {col_name} {col_def}')
                print(f"  usage_limits.{col_name} добавлена")
            except Exception:
                print(f"  usage_limits.{col_name} уже существует")

        # 3. Создать таблицу usage_stats (детальный учёт по месяцам)
        try:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS usage_stats (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    period TEXT NOT NULL,
                    documents_used INTEGER DEFAULT 0,
                    contracts_used INTEGER DEFAULT 0,
                    ai_requests INTEGER DEFAULT 0,
                    tokens_used INTEGER DEFAULT 0,
                    court_practice_requests INTEGER DEFAULT 0,
                    law_monitoring_requests INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ''')
            print("  usage_stats таблица создана")
        except Exception as e:
            print(f"  usage_stats: {e}")

        # 4. Создать таблицу token_usage (учёт токенов по запросам)
        try:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS token_usage (
                    id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    request_type TEXT NOT NULL,
                    tokens_used INTEGER NOT NULL,
                    request_date TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ''')
            print("  token_usage таблица создана")
        except Exception as e:
            print(f"  token_usage: {e}")

        # 5. Обновить существующих пользователей — установить subscription_type из plan_type
        try:
            # Пользователи с pro/enterprise -> Pro, basic -> Free, enterprise -> Business
            await db.execute('''
                UPDATE users SET subscription_type = 
                    CASE 
                        WHEN (SELECT plan_type FROM subscriptions WHERE subscriptions.user_id = users.id LIMIT 1) = 'pro' THEN 'pro'
                        WHEN (SELECT plan_type FROM subscriptions WHERE subscriptions.user_id = users.id LIMIT 1) = 'enterprise' THEN 'business'
                        ELSE 'free'
                    END
                WHERE subscription_type = 'free'
            ''')
            print("  users.subscription_type обновлены из существующих подписок")
        except Exception as e:
            print(f"  users.subscription_type: {e}")

        await db.commit()
        print("\n✅ Миграция завершена")


asyncio.run(migrate_db())
