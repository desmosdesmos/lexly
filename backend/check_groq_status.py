import time
print(f"Waiting for Groq rate limit reset...")
print(f"Current time: {time.strftime('%H:%M:%S')}")
print(f"Please try again after ~9 minutes")
print(f"Estimated ready time: ~{time.strftime('%H:%M:%S', time.localtime(time.time() + 540))}")
