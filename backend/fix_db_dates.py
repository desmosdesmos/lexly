import sqlite3
import datetime

def fix_date_formats(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # Get all subscriptions
    cur.execute('SELECT id, start_date, end_date FROM subscriptions')
    rows = cur.fetchall()
    
    for row_id, start, end in rows:
        new_start = start.split('T')[0] if start and 'T' in start else start
        new_end = end.split('T')[0] if end and 'T' in end else end
        
        cur.execute(
            'UPDATE subscriptions SET start_date = ?, end_date = ? WHERE id = ?',
            (new_start, new_end, row_id)
        )
    
    # Also fix usage_limits reset_date just in case
    cur.execute('SELECT id, reset_date FROM usage_limits')
    rows = cur.fetchall()
    for row_id, reset_date in rows:
        if reset_date and 'T' in reset_date:
            new_reset = reset_date.split('T')[0]
            cur.execute('UPDATE usage_limits SET reset_date = ? WHERE id = ?', (new_reset, row_id))

    conn.commit()
    conn.close()
    print(f"Fixed date formats in {db_path}")

if __name__ == "__main__":
    for db in ['/opt/law-ai-agent/backend/laxly.db', '/opt/law-ai-agent/backend/law_ai_agent.db']:
        try:
            fix_date_formats(db)
        except Exception as e:
            print(f"Error fixing {db}: {e}")
