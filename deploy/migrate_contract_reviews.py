import sqlite3
import os
import sys

def migrate(db_path):
    if not os.path.exists(db_path):
        print(f"Database file not found: {db_path}")
        return False
        
    print(f"Migrating database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check current columns
    cursor.execute("PRAGMA table_info(contract_reviews)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns in contract_reviews: {columns}")
    
    # Columns to add
    new_cols = [
        ('score', 'INTEGER DEFAULT 100'),
        ('fixed_content', 'TEXT'),
        ('fixed_risks_count', 'INTEGER DEFAULT 0'),
    ]
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            print(f"Adding column: {col_name}")
            try:
                cursor.execute(f"ALTER TABLE contract_reviews ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"  Error adding column {col_name}: {e}")
        else:
            print(f"Column {col_name} already exists")
            
    conn.commit()
    
    # Verify columns after migration
    cursor.execute("PRAGMA table_info(contract_reviews)")
    updated_columns = [row[1] for row in cursor.fetchall()]
    print(f"Updated columns: {updated_columns}")
    
    conn.close()
    print("Migration completed successfully!\n")
    return True

if __name__ == '__main__':
    # Determine database path
    # If run on server, default to VPS path
    if os.path.exists('/opt/law-ai-agent/backend/law_ai_agent.db'):
        vps_db = '/opt/law-ai-agent/backend/law_ai_agent.db'
        migrate(vps_db)
    else:
        # Fallback to local paths
        local_db = 'backend/law_ai_agent.db'
        if os.path.exists(local_db):
            migrate(local_db)
        
        local_db_alt = 'law_ai_agent.db'
        if os.path.exists(local_db_alt):
            migrate(local_db_alt)
