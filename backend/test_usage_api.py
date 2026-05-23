import asyncio
from sqlalchemy import select
from app.database import async_session_maker
from app.services.limit_service import limit_service
from app.models.user import User

async def test():
    email = 'yan.pashhenko6486@gmail.com'
    async with async_session_maker() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            status = await limit_service.get_usage_status(user.id, db)
            print(status)
        else:
            print("User not found")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(test())
