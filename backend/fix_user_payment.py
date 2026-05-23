import asyncio
import uuid
from sqlalchemy import update, select
from app.database import async_session_maker
from app.models.subscription import Subscription, SubscriptionPlan, SubscriptionStatus
from app.models.usage_limit import UsageLimit
from app.models.payment import Payment, PaymentStatus

async def fix_user_payment(user_id, payment_id, plan_id):
    async with async_session_maker() as db:
        # Update subscription
        sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
        subscription = sub_result.scalar_one_or_none()
        if subscription:
            subscription.plan_type = plan_id
            subscription.status = SubscriptionStatus.ACTIVE
            print(f"Updated subscription for {user_id}")
        else:
            subscription = Subscription(user_id=user_id, plan_type=plan_id, status=SubscriptionStatus.ACTIVE)
            db.add(subscription)
            print(f"Created subscription for {user_id}")
        
        # Update usage limits
        limit_result = await db.execute(select(UsageLimit).where(UsageLimit.user_id == user_id))
        limit = limit_result.scalar_one_or_none()
        if limit:
            limit.plan_type = plan_id
            limit.max_documents = 50 if plan_id == "pro" else 200 if plan_id == "business" else -1
            limit.max_contracts = 25 if plan_id == "pro" else 100 if plan_id == "business" else -1
            print(f"Updated limits for {user_id}")
        else:
            limit = UsageLimit(
                user_id=user_id, 
                plan_type=plan_id, 
                max_documents=50 if plan_id == "pro" else 200 if plan_id == "business" else -1,
                max_contracts=25 if plan_id == "pro" else 100 if plan_id == "business" else -1
            )
            db.add(limit)
            print(f"Created limits for {user_id}")
            
        # Update payment
        payment_result = await db.execute(select(Payment).where(Payment.id == payment_id))
        payment = payment_result.scalar_one_or_none()
        if payment:
            payment.status = PaymentStatus.COMPLETED
            print(f"Updated payment {payment_id}")
            
        await db.commit()
        print("Done.")

if __name__ == "__main__":
    USER_ID = "9c0b6d37-fc5a-4ff8-b571-7e5d01a1e083"
    PAYMENT_ID = "8330bfd5-f89b-41a0-be5b-099c7afc5d53"
    asyncio.run(fix_user_payment(USER_ID, PAYMENT_ID, "pro"))
