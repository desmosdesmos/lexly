import asyncio
from sqlalchemy import select
from app.database import async_session_maker
from app.models.user import User
from app.models.subscription import Subscription
from app.models.usage_limit import UsageLimit
from app.services.limit_service import limit_service
import json

async def diagnose():
    email = 'yan.pashhenko6486@gmail.com'
    async with async_session_maker() as db:
        print(f"--- Diagnosing {email} ---")
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if not user:
            print("User not found")
            return
        
        print(f"User ID: {user.id}")
        
        # Check User fields
        try:
            print(f"User.subscription_type: {getattr(user, 'subscription_type', 'N/A')}")
        except:
            print("User has no subscription_type attribute")

        # Check Subscription
        res = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
        sub = res.scalar_one_or_none()
        if sub:
            print(f"Subscription found: plan={sub.plan_type}, status={sub.status}")
        else:
            print("No Subscription record found")

        # Check UsageLimit
        res = await db.execute(select(UsageLimit).where(UsageLimit.user_id == user.id))
        usage = res.scalar_one_or_none()
        if usage:
            print(f"UsageLimit found: plan={usage.plan_type}, docs={usage.documents_generated}/{usage.max_documents}")
        else:
            print("No UsageLimit record found")

        # Check what the API actually returns
        status = await limit_service.get_usage_status(user.id, db)
        print(f"\nFinal API Status Response:\n{json.dumps(status, indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(diagnose())
