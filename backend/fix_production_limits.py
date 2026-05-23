import sqlite3
import uuid
from datetime import datetime, timedelta

def fix_limits(db_path, email):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get user id
    cur.execute('SELECT id FROM users WHERE email = ?', (email,))
    user = cur.fetchone()
    if not user:
        print(f"User {email} not found in {db_path}")
        conn.close()
        return
    
    user_id = user[0]
    print(f"Found user {email} with id {user_id}")
    
    # Upgrade subscription
    now = datetime.utcnow().isoformat()
    end_date = (datetime.utcnow() + timedelta(days=365)).isoformat()
    
    cur.execute('SELECT id FROM subscriptions WHERE user_id = ?', (user_id,))
    if cur.fetchone():
        cur.execute('''
            UPDATE subscriptions 
            SET plan_type = 'enterprise', status = 'active', start_date = ?, end_date = ? 
            WHERE user_id = ?
        ''', (now, end_date, user_id))
        print("Updated existing subscription to enterprise")
    else:
        sub_id = str(uuid.uuid4())
        cur.execute('''
            INSERT INTO subscriptions (id, user_id, plan_type, status, start_date, end_date)
            VALUES (?, ?, 'enterprise', 'active', ?, ?)
        ''', (sub_id, user_id, now, end_date))
        print("Created new enterprise subscription")
        
    # Update usage limits
    reset_date = (datetime.utcnow() + timedelta(days=30)).strftime('%Y-%m-%d')
    cur.execute('SELECT id FROM usage_limits WHERE user_id = ?', (user_id,))
    if cur.fetchone():
        cur.execute('''
            UPDATE usage_limits 
            SET plan_type = 'enterprise', 
                documents_generated = 0, 
                contracts_reviewed = 0, 
                max_documents = 999999, 
                max_contracts = 999999,
                reset_date = ?
            WHERE user_id = ?
        ''', (reset_date, user_id))
        print("Updated usage limits to enterprise")
    else:
        limit_id = str(uuid.uuid4())
        cur.execute('''
            INSERT INTO usage_limits (id, user_id, plan_type, documents_generated, contracts_reviewed, max_documents, max_contracts, reset_date)
            VALUES (?, ?, 'enterprise', 0, 0, 999999, 999999, ?)
        ''', (limit_id, user_id, reset_date))
        print("Created new enterprise usage limits")
        
    conn.commit()
    conn.close()
    print(f"Successfully fixed limits for {email}")

if __name__ == "__main__":
    emails = ['yan.pashhenko6486@gmail.com', 'desmosymail@gmail.com']
    # Fix BOTH possible databases to be sure
    for db in ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']:
        print(f"Checking {db}...")
        for email in emails:
            try:
                fix_limits(db, email)
            except Exception as e:
                print(f"Error fixing {db}: {e}")
