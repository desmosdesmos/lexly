import sqlite3

emails = ['yan.pashhenko6486@gmail.com', 'desmosymail@gmail.com']
dbs = ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']

for db_path in dbs:
    print(f"DATABASE: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        for email in emails:
            cur.execute("SELECT id FROM users WHERE email=?", (email,))
            user = cur.fetchone()
            if user:
                uid = user[0]
                # Move to business plan
                cur.execute("UPDATE subscriptions SET plan_type = 'business' WHERE user_id = ?", (uid,))
                cur.execute("UPDATE usage_limits SET plan_type = 'business', max_documents = -1, max_contracts = -1 WHERE user_id = ?", (uid,))
                print(f"  Updated {email} to business (unlimited)")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"  Error: {e}")
