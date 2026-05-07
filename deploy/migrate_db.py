"""Миграция: добавить новые daily поля в usage_limits."""
import sqlite3
import sys

DB_PATH = '/opt/law-ai-agent/backend/law_ai_agent.db'

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Проверим какие колонки есть
    cursor.execute("PRAGMA table_info(usage_limits)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns: {columns}")
    
    # Добавим недостающие колонки
    new_cols = [
        ('ai_requests_today', 'INTEGER DEFAULT 0'),
        ('court_practice_today', 'INTEGER DEFAULT 0'),
        ('law_monitoring_today', 'INTEGER DEFAULT 0'),
        ('last_ai_request_date', 'TEXT'),
        ('last_court_practice_date', 'TEXT'),
        ('last_law_monitoring_date', 'TEXT'),
    ]
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            print(f"Adding column: {col_name}")
            try:
                cursor.execute(f"ALTER TABLE usage_limits ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"  Error: {e}")
        else:
            print(f"Column {col_name} already exists")
    
    conn.commit()
    
    # Проверим результат
    cursor.execute("PRAGMA table_info(usage_limits)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"New columns: {columns}")
    
    conn.close()
    print("Migration completed!")

if __name__ == '__main__':
    migrate()
