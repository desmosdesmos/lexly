import sqlite3

db_path = '/opt/law-ai-agent/backend/laxly.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

email = 'cj2814863@gmail.com'
cur.execute("SELECT id FROM users WHERE email=?", (email,))
user = cur.fetchone()
if user:
    uid = user[0]
    print(f"User {email} ID: {uid}")
    cur.execute("SELECT * FROM subscriptions WHERE user_id=?", (uid,))
    subs = cur.fetchall()
    print(f"Subscriptions ({len(subs)}):")
    for s in subs:
        print(s)
        
    cur.execute("SELECT * FROM usage_limits WHERE user_id=?", (uid,))
    limits = cur.fetchall()
    print(f"Usage Limits ({len(limits)}):")
    for l in limits:
        print(l)
else:
    print("User not found")

conn.close()
