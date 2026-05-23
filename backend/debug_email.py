import asyncio
import logging
import sys
import os

# Добавляем путь к приложению
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))

from app.services.email_service import email_service

async def test():
    logging.basicConfig(level=logging.INFO)
    print("Testing email delivery to yan.pashhenko6486@gmail.com...")
    try:
        result = await email_service.send_email(
            "yan.pashhenko6486@gmail.com", 
            "Test from Server Environment", 
            "<h1>Test Message</h1><p>If you see this, email sending works from the server app context.</p>"
        )
        print(f"Final Result: {result}")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    asyncio.run(test())
