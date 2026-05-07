import httpx
import asyncio

async def test():
    async with httpx.AsyncClient() as client:
        r = await client.post(
            'http://localhost:8000/api/v1/auth/register',
            json={
                "email": "test123@example.com",
                "password": "Test123!",
                "full_name": "Test User",
                "user_type": "individual",
            }
        )
        print(f'Status: {r.status_code}')
        print(f'Body: {r.text}')

asyncio.run(test())
