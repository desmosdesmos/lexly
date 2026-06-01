import sqlite3
import os

db_path = "/opt/law-ai-agent/backend/laxly.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications WHERE title LIKE '%Обновление%'")
    print(f"Deleted {cursor.rowcount} rows")
    conn.commit()
    conn.close()
else:
    print("DB not found")
