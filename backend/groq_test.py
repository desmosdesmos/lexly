import httpx
import asyncio
import sys
import os

async def test():
    output = []
    async with httpx.AsyncClient() as client:
        # Test models list
        try:
            resp = await client.get(
                'https://api.groq.com/openai/v1/models',
                headers={'Authorization': f'Bearer {os.getenv("GROQ_API_KEY")}'},
                timeout=30.0
            )
            output.append(f'Models list status: {resp.status_code}')
            if resp.status_code == 200:
                models = resp.json()
                for m in models.get('data', [])[:10]:
                    output.append(f'  - {m["id"]}')
            else:
                output.append(f'Error: {resp.text}')
        except Exception as e:
            output.append(f'Models list error: {e}')
        
        # Test chat completion with llama-3.1-8b-instant
        try:
            resp2 = await client.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {os.getenv("GROQ_API_KEY")}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.1-8b-instant',
                    'messages': [{'role': 'user', 'content': 'Say hello'}],
                    'max_tokens': 10
                },
                timeout=30.0
            )
            output.append(f'\nChat test (llama-3.1-8b-instant) status: {resp2.status_code}')
            if resp2.status_code == 200:
                data = resp2.json()
                output.append(f'Response: {data.get("choices", [{}])[0].get("message", {}).get("content", "")}')
            else:
                output.append(f'Error: {resp2.text}')
        except Exception as e:
            output.append(f'Chat test error: {e}')
        
        # Test with llama-3.3-70b-versatile
        try:
            resp3 = await client.post(
                'https://api.groq.com/openai/v1/chat/completions',
                headers={
                    'Authorization': f'Bearer {os.getenv("GROQ_API_KEY")}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'llama-3.3-70b-versatile',
                    'messages': [{'role': 'user', 'content': 'Say hello'}],
                    'max_tokens': 10
                },
                timeout=30.0
            )
            output.append(f'\nChat test (llama-3.3-70b-versatile) status: {resp3.status_code}')
            if resp3.status_code == 200:
                data = resp3.json()
                output.append(f'Response: {data.get("choices", [{}])[0].get("message", {}).get("content", "")}')
            else:
                output.append(f'Error: {resp3.text}')
        except Exception as e:
            output.append(f'Chat test error (70b): {e}')

    with open('groq_test.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(output))
    
    print('\n'.join(output))

asyncio.run(test())
