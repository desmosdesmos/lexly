import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.support_message import SupportMessage
from app.config import settings

async def test():
    engine = create_async_engine(settings.DATABASE_URL)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        try:
            result = await session.execute(select(SupportMessage).limit(1))
            msg = result.scalar_one_or_none()
            print(f"Success: {msg}")
        except Exception as e:
            print(f"Error: {e}")
    await engine.dispose()

if __name__ == "__main__":
    import os
    import sys
    # Add backend to path to import app
    sys.path.append(os.getcwd())
    asyncio.run(test())
