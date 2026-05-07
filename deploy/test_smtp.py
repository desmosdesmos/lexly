"""Тест SMTP через порт 465 (SSL)."""
import smtplib
from email.mime.text import MIMEText

SMTP_USER = 'yan.pashhenko6486@gmail.com'
SMTP_PASSWORD = 'zhczlphjgayfxxjq'

for port, method in [(587, 'STARTTLS'), (465, 'SSL')]:
    print(f"\nТестирую порт {port} ({method})...")
    try:
        if port == 465:
            server = smtplib.SMTP_SSL('smtp.gmail.com', port, timeout=15)
        else:
            server = smtplib.SMTP('smtp.gmail.com', port, timeout=15)
            server.starttls()
        
        server.login(SMTP_USER, SMTP_PASSWORD)
        print(f"  ✅ Авторизация успешна")
        
        msg = MIMEText(f"Тест через порт {port} ({method})", "plain", "utf-8")
        msg["Subject"] = f"Тест Laxly (port {port})"
        msg["From"] = SMTP_USER
        msg["To"] = SMTP_USER
        
        server.send_message(msg)
        print(f"  ✅ Письмо отправлено через порт {port}!")
        server.quit()
        break
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"  ❌ Ошибка авторизации: {e}")
    except Exception as e:
        print(f"  ❌ Ошибка подключения: {type(e).__name__}: {e}")
