import sqlite3

db_path = '/opt/law-ai-agent/backend/laxly.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

emails = ['yan.pashhenko6486@gmail.com', 'desmosymail@gmail.com']

for email in emails:
    print(f"\nChecking user: {email}")
    cur.execute("SELECT id FROM users WHERE email=?", (email,))
    user = cur.fetchone()
    if user:
        uid = user[0]
        cur.execute("SELECT plan_type, status FROM subscriptions WHERE user_id=?", (uid,))
        print(f"Subscription: {cur.fetchone()}")
    else:
        print("User not found")

conn.close()
