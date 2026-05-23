import asyncio
import sqlite3
import os
import sys

# Simplified script to run via python3 directly (no async SQLAlchemy needed for simple SQLite fix)

def sync_limits(db_path):
    print(f"Syncing limits in {db_path}...")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all users and their subscriptions
    cur.execute('''
        SELECT u.id, s.plan_type 
        FROM users u 
        LEFT JOIN subscriptions s ON u.id = s.user_id
    ''')
    users = cur.fetchall()
    
    for uid, plan in users:
        plan = plan or 'free'
        plan = plan.lower()
        
        # Map old names to new ones
        if plan in ('enterprise', 'vip'):
            plan = 'business'
        
        # Define limits
        max_docs = 2
        max_contracts = 1
        
        if plan == 'pro':
            max_docs = 30
            max_contracts = 15
        elif plan == 'business':
            max_docs = -1
            max_contracts = -1
            
        # Update usage_limits table
        cur.execute('''
            UPDATE usage_limits 
            SET plan_type = ?, max_documents = ?, max_contracts = ? 
            WHERE user_id = ?
        ''', (plan, max_docs, max_contracts, uid))
        
        if cur.rowcount == 0:
            # Create entry if missing
            import uuid
            cur.execute('''
                INSERT INTO usage_limits (id, user_id, plan_type, documents_generated, contracts_reviewed, max_documents, max_contracts)
                VALUES (?, ?, ?, 0, 0, ?, ?)
            ''', (str(uuid.uuid4()), uid, plan, max_docs, max_contracts))
            
        print(f"  User {uid}: synced to {plan} (docs: {max_docs}, contracts: {max_contracts})")

    conn.commit()
    conn.close()
    print("Done!")

if __name__ == "__main__":
    dbs = ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']
    for db in dbs:
        if os.path.exists(db):
            sync_limits(db)
        else:
            print(f"Skip {db} (not found)")
