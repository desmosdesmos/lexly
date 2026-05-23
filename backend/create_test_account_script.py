import asyncio
import uuid
import sys
import os
from datetime import datetime, timedelta

# Fix path for server execution
sys.path.insert(0, os.path.join(os.getcwd(), '.'))

from app.database import async_session_maker
from app.models.user import User
from app.models.subscription import Subscription
from app.models.usage_limit import UsageLimit
from app.services.auth_service import hash_password

async def create_test_account():
    email = "test@laxlylaw.ru"
    password = "LaxlyVerify2026"
    full_name = "ЮKassa Тест"
    
    print(f"🚀 Creating test account: {email}...")
    
    async with async_session_maker() as db:
        # 1. Create User
        user_id = str(uuid.uuid4())
        new_user = User(
            id=user_id,
            email=email,
            password_hash=hash_password(password),
            full_name=full_name,
            is_active=True,
            email_verified=True
        )
        db.add(new_user)
        
        # 2. Create Subscription (Business/Unlimited)
        sub_id = str(uuid.uuid4())
        now = datetime.utcnow()
        end_date = now + timedelta(days=365)
        new_sub = Subscription(
            id=sub_id,
            user_id=user_id,
            plan_type="business",
            status="active",
            start_date=now.date(),
            end_date=end_date.date()
        )
        db.add(new_sub)
        
        # 3. Create Usage Limits
        limit_id = str(uuid.uuid4())
        new_limits = UsageLimit(
            id=limit_id,
            user_id=user_id,
            plan_type="business",
            max_documents=-1,
            max_contracts=-1,
            documents_generated=0,
            contracts_reviewed=0,
            reset_date=now.date()
        )
        db.add(new_limits)
        
        await db.commit()
        print(f"✅ Successfully created test account!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")

if __name__ == "__main__":
    asyncio.run(create_test_account())
