import asyncio
import json
from app.database import async_session_maker
from app.services.limit_service import limit_service
from app.models.user import User
from sqlalchemy import select

async def run():
    email = "cj2814863@gmail.com"
    async with async_session_maker() as db:
        res = await db.execute(select(User).where(User.email == email))
        user = res.scalar_one_or_none()
        if user:
            status = await limit_service.get_usage_status(user.id, db)
            print(json.dumps(status))
        else:
            print("User not found")

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.getcwd())
    asyncio.run(run())
