import sqlite3

db_path = '/opt/law-ai-agent/backend/laxly.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

print("Users with non-free subscriptions:")
cur.execute('''
    SELECT u.email, s.plan_type, l.max_documents 
    FROM users u 
    JOIN subscriptions s ON u.id = s.user_id 
    JOIN usage_limits l ON u.id = l.user_id 
    WHERE s.plan_type != 'free'
''')
for row in cur.fetchall():
    print(row)

conn.close()
