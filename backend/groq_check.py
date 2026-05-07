"""Быстрый тест GROQ API с новым ключом."""
import httpx
import asyncio
import os

async def test_groq():
    output = []
    async with httpx.AsyncClient() as client:
        # Test chat completion
        try:
            resp = await client.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {os.getenv("GROQ_API_KEY")}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [{'role': 'user', 'content': 'Say hello in Russian'}],
                    'max_tokens': 50,
                    'temperature': 0.2
                },
                timeout=30.0
            )
            output.append(f'Status: {resp.status_code}')
            if resp.status_code == 200:
                data = resp.json()
                msg = data.get('choices', [{}])[0].get('message', {}).get('content', '')
                output.append(f'Response: {msg}')
                output.append('✅ GROQ API работает!')
            else:
                output.append(f'Error: {resp.text}')
        except Exception as e:
            import traceback
            output.append(f'Error: {e}')
            output.append(f'Traceback: {traceback.format_exc()}')
    
    result = '\n'.join(output)
    print(result)
    with open('groq_check.txt', 'w', encoding='utf-8') as f:
        f.write(result)

asyncio.run(test_groq())
