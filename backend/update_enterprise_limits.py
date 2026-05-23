import sqlite3

dbs = ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']

for db_path in dbs:
    print(f"Updating {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute('''
            UPDATE usage_limits 
            SET max_documents = -1, max_contracts = -1 
            WHERE plan_type = 'enterprise'
        ''')
        print(f"  Rows updated: {conn.total_changes}")
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"  Error: {e}")
