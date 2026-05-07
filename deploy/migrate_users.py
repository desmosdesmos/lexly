"""Миграция: добавить поля согласия в таблицу users."""
import sqlite3
import os

DB_PATH = '/opt/law-ai-agent/backend/laxly.db'

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Проверим какие колонки есть
    cursor.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Current columns in 'users': {columns}")
    
    # Добавим недостающие колонки
    new_cols = [
        ('pdp_consent', 'INTEGER DEFAULT 0'),
        ('pdp_consent_date', 'TEXT'),
        ('marketing_consent', 'INTEGER DEFAULT 0'),
    ]
    
    for col_name, col_type in new_cols:
        if col_name not in columns:
            print(f"Adding column: {col_name}")
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}")
            except Exception as e:
                print(f"  Error: {e}")
        else:
            print(f"Column {col_name} already exists")
    
    conn.commit()
    conn.close()
    print("Migration completed!")

if __name__ == '__main__':
    migrate()
