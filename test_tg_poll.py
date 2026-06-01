import requests
import time

TOKEN = "8470156263:AAGM25GR-y9gUxREqxEvEMdo5mCmG16_tME"
print("Deleting webhook...")
requests.get(f"https://api.telegram.org/bot{TOKEN}/deleteWebhook")

print("Polling for 20 seconds. Please reply to the bot NOW.")
start_time = time.time()
while time.time() - start_time < 20:
    resp = requests.get(f"https://api.telegram.org/bot{TOKEN}/getUpdates").json()
    if resp.get("result"):
        print(f"FOUND UPDATES: {resp['result']}")
    time.sleep(2)

print("Restoring webhook...")
requests.post(f"https://api.telegram.org/bot{TOKEN}/setWebhook", json={"url": "https://laxlylaw.ru/api/v1/support/telegram-webhook"})
