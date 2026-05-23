import sqlite3

dbs = ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']

for db_path in dbs:
    print(f"Checking {db_path}...")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Check if table exists
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='support_messages'")
        if cur.fetchone():
            # Check if column exists
            cur.execute("PRAGMA table_info(support_messages)")
            columns = [c[1] for c in cur.fetchall()]
            if 'image_url' not in columns:
                cur.execute("ALTER TABLE support_messages ADD COLUMN image_url VARCHAR(500)")
                print(f"  Added image_url to {db_path}")
            else:
                print(f"  Column already exists in {db_path}")
        else:
            print(f"  Table support_messages does not exist in {db_path}")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"  Error fixing {db_path}: {e}")
