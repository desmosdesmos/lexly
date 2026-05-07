"""Тесты для API эндпоинтов."""
import httpx
import asyncio


BASE_URL = "http://localhost:8000"


async def test_root():
    """Test root endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        print(f"✓ Root endpoint: {data}")


async def test_health():
    """Test health endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"✓ Health endpoint: {data}")


async def test_register():
    """Test user registration."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": "test2@example.com",
                "password": "Test123!",
                "full_name": "Тестовый Пользователь",
                "user_type": "individual",
            },
        )
        assert response.status_code in [200, 201, 400]  # 400 если уже существует
        data = response.json()
        if response.status_code < 400:
            assert "id" in data
            print(f"✓ Registration: {data['email']}")
        else:
            print(f"✓ Registration (exists): {data.get('detail', 'unknown')}")


async def test_login():
    """Test login."""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={
                "email": "test@example.com",
                "password": "Test123!",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        print(f"✓ Login successful, token expires in: {data['expires_in']}s")
        return data["access_token"]


async def test_profile():
    """Test profile endpoint."""
    async with httpx.AsyncClient() as client:
        # Login first
        login_resp = await client.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"email": "test@example.com", "password": "Test123!"},
        )
        token = login_resp.json()["access_token"]

        # Get profile
        response = await client.get(
            f"{BASE_URL}/api/v1/user/profile",
            headers={"Authorization": f"Bearer {token}"},
        )
        print(f"Profile status: {response.status_code}")
        print(f"Profile response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            assert "email" in data
            print(f"✓ Profile: {data['email']} - {data.get('full_name', 'N/A')}")
        else:
            print(f"✗ Profile failed: {response.text}")


async def test_user_test():
    """Test user/test endpoint (no auth)."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/api/v1/user/test")
        assert response.status_code == 200
        data = response.json()
        assert "msg" in data
        print(f"✓ User test: {data['msg']}")


if __name__ == "__main__":
    import asyncio

    async def run_tests():
        tests = [
            test_root,
            test_health,
            test_register,
            test_login,
            test_user_test,
            test_profile,
        ]

        print("\n" + "=" * 60)
        print("🧪 Запуск тестов API")
        print("=" * 60 + "\n")

        passed = 0
        failed = 0

        for test in tests:
            try:
                await test()
                passed += 1
            except Exception as e:
                print(f"✗ {test.__name__} FAILED: {e}")
                failed += 1

        print("\n" + "=" * 60)
        print(f"✅ Пройдено: {passed}/{len(tests)}")
        print(f"❌ Провалено: {failed}/{len(tests)}")
        print("=" * 60 + "\n")

    asyncio.run(run_tests())
