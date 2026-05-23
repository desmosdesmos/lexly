import asyncio
from sqlalchemy import update, select
from app.database import async_session_maker
from app.models.subscription import Subscription, SubscriptionStatus
from app.models.usage_limit import UsageLimit

async def upgrade_user(user_id, plan_id):
    async with async_session_maker() as db:
        # Update subscription
        sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
        subscription = sub_result.scalar_one_or_none()
        if subscription:
            subscription.plan_type = plan_id
            subscription.status = SubscriptionStatus.ACTIVE
            print(f"Updated subscription for {user_id} to {plan_id}")
        else:
            subscription = Subscription(user_id=user_id, plan_type=plan_id, status=SubscriptionStatus.ACTIVE)
            db.add(subscription)
            print(f"Created subscription for {user_id} to {plan_id}")
        
        # Update usage limits
        limit_result = await db.execute(select(UsageLimit).where(UsageLimit.user_id == user_id))
        limit = limit_result.scalar_one_or_none()
        
        # Enterprise is unlimited (-1)
        max_docs = -1
        max_contracts = -1
        
        if limit:
            limit.plan_type = plan_id
            limit.max_documents = max_docs
            limit.max_contracts = max_contracts
            print(f"Updated limits for {user_id} to unlimited")
        else:
            limit = UsageLimit(
                user_id=user_id, 
                plan_type=plan_id, 
                max_documents=max_docs,
                max_contracts=max_contracts
            )
            db.add(limit)
            print(f"Created limits for {user_id} to unlimited")
            
        await db.commit()
        print("Done.")

if __name__ == "__main__":
    USER_ID = "56f7e709-3ef8-4137-99ab-f5e8ff788f3c"
    PLAN_ID = "enterprise"
    asyncio.run(upgrade_user(USER_ID, PLAN_ID))
