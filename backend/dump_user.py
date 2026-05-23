import sqlite3

db_path = '/opt/law-ai-agent/backend/laxly.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

email = 'yan.pashhenko6486@gmail.com'
print(f"Checking user: {email}")

cur.execute("SELECT id FROM users WHERE email=?", (email,))
user = cur.fetchone()
if user:
    uid = user[0]
    print(f"User ID: {uid}")
    
    cur.execute("SELECT plan_type, status, end_date FROM subscriptions WHERE user_id=?", (uid,))
    print(f"Subscription: {cur.fetchone()}")
    
    cur.execute("SELECT plan_type, max_documents, max_contracts FROM usage_limits WHERE user_id=?", (uid,))
    print(f"Usage Limits: {cur.fetchone()}")
else:
    print("User not found")

conn.close()
