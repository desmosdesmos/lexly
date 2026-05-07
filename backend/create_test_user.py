import asyncio
import aiosqlite
import bcrypt

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    pwd_hash = bcrypt.hashpw(password.encode("utf-8"), salt)
    return pwd_hash.decode("utf-8")

async def create_user():
    email = "test@law.ai"
    password = "Test1234!"
    name = "Тестовый пользователь"
    
    hashed = hash_password(password)
    
    import uuid
    user_id = str(uuid.uuid4())
    
    async with aiosqlite.connect('law_ai.db') as db:
        # Проверить, существует ли
        async with db.execute('SELECT id FROM users WHERE email = ?', (email,)) as cur:
            existing = await cur.fetchone()
            if existing:
                print(f"Пользователь {email} уже существует, id: {existing[0]}")
                return
        
        await db.execute(
            'INSERT INTO users (id, email, password_hash, full_name, user_type, email_verified, is_active, created_at) VALUES (?, ?, ?, ?, "individual", 1, 1, datetime("now"))',
            (user_id, email, hashed, name)
        )
        await db.commit()
        
        # Создать подписку
        sub_id = str(uuid.uuid4())
        await db.execute(
            'INSERT INTO subscriptions (id, user_id, plan_type, status, created_at) VALUES (?, ?, "free", "active", datetime("now"))',
            (sub_id, user_id)
        )
        limit_id = str(uuid.uuid4())
        await db.execute(
            'INSERT INTO usage_limits (id, user_id, plan_type, max_documents, max_contracts, created_at) VALUES (?, ?, "free", 5, 3, datetime("now"))',
            (limit_id, user_id)
        )
        await db.commit()
        
        print(f"✅ Пользователь создан!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   ID: {user_id}")

asyncio.run(create_user())
