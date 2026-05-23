import sqlite3
import os

db_path = '/opt/law-ai-agent/backend/laxly.db'
print(f"Checking {db_path}...")
conn = sqlite3.connect(db_path)
cur = conn.cursor()
try:
    cur.execute("SELECT * FROM support_messages LIMIT 1")
    cols = [d[0] for d in cur.description]
    print(f"Columns: {cols}")
except Exception as e:
    print(f"Error: {e}")
conn.close()
