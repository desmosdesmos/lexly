"""Тест auth middleware."""
import httpx
import asyncio

BASE_URL = "http://localhost:8000"

async def test_full_auth():
    async with httpx.AsyncClient() as client:
        # Login
        print("1. Logging in...")
        login_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test123!"}
        )
        print(f"   Status: {login_resp.status_code}")
        if login_resp.status_code != 200:
            print(f"   Response: {login_resp.text}")
            return
        
        token = login_resp.json()["access_token"]
        print(f"   Token: {token[:40]}...")
        
        # Test profile
        print("\n2. Getting profile...")
        profile_resp = await client.get(
            f"{BASE_URL}/api/v1/user/profile",
            headers={"Authorization": f"Bearer {token}"}
        )
        print(f"   Status: {profile_resp.status_code}")
        print(f"   Response: {profile_resp.text}")
        
        if profile_resp.status_code == 200:
            print(f"   ✓ Profile: {profile_resp.json()}")
        else:
            print(f"   ✗ Failed")

asyncio.run(test_full_auth())
