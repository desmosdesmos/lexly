import sqlite3

emails = ['yan.pashhenko6486@gmail.com', 'desmosymail@gmail.com']
dbs = ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']

for db_path in dbs:
    print(f"\nDATABASE: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for email in emails:
            print(f"  EMAIL: {email}")
            cur.execute("SELECT id FROM users WHERE email=?", (email,))
            user = cur.fetchone()
            if not user:
                print("    User not found")
                continue
            uid = user[0]
            
            cur.execute("SELECT plan_type, status FROM subscriptions WHERE user_id=?", (uid,))
            print(f"    Subscription: {cur.fetchone()}")
            
            cur.execute("SELECT plan_type, documents_generated, max_documents, contracts_reviewed, max_contracts FROM usage_limits WHERE user_id=?", (uid,))
            print(f"    Limits: {cur.fetchone()}")
        conn.close()
    except Exception as e:
        print(f"  Error: {e}")
