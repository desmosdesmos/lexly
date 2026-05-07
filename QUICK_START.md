# 🚀 Быстрая настройка Google OAuth и Email

## ✅ Что уже работает:

- ✅ **Backend сервер** запущен: http://localhost:8000
- ✅ **Frontend сервер** запущен: http://localhost:5173
- ✅ **Регистрация/Вход** работают
- ✅ **Forgot Password** endpoint работает
- ✅ **Reset Password** endpoint работает
- ✅ **Страницы** `/forgot-password` и `/reset-password` доступны

## ⚠️ Что нужно настроить:

### 1️⃣ Google OAuth (5 минут)

**Шаг 1:** Создайте Google проект
1. Откройте https://console.cloud.google.com/
2. **New Project** → Введите название → **Create**
3. **APIs & Services** → **OAuth consent screen** → **External** → **Save** (3 раза)
4. **Credentials** → **Create Credentials** → **OAuth client ID**
5. Тип: **Web application**
6. Authorized JavaScript origins: `http://localhost:5173`
7. Скопируйте **Client ID**

**Шаг 2:** Добавьте в конфиг

Откройте `backend\.env` и добавьте:
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

Откройте `frontend\.env` и добавьте:
```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

**Шаг 3:** Перезапустите серверы
```bash
# Остановите текущие серверы (Ctrl+C)
# Затем:
cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
cd frontend && npm run dev
```

---

### 2️⃣ Email для восстановления пароля (3 минуты)

**Шаг 1:** Создайте App Password (Gmail)
1. Откройте https://myaccount.google.com/apppasswords
2. **Create** → App: "Law AI Agent"
3. Скопируйте **16-символьный пароль**

**Шаг 2:** Добавьте в `backend\.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # 16 символов без пробелов
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Law AI Agent
```

**Шаг 3:** Перезапустите backend

---

## 🎯 Готово!

После настройки:
- Кнопка **"Continue with Google"** появится на странице входа
- При нажатии **"Забыли пароль?"** придет email со ссылкой
- Пользователи смогут сбрасывать пароль через почту

---

## 🔗 Полезные ссылки:

| Страница | URL |
|----------|-----|
| Главная | http://localhost:5173 |
| Вход | http://localhost:5173/login |
| Регистрация | http://localhost:5173/register |
| Забыли пароль | http://localhost:5173/forgot-password |
| Swagger API | http://localhost:8000/docs |

---

## 📁 Файлы для редактирования:

- `backend\.env` — GOOGLE_CLIENT_ID, SMTP настройки
- `frontend\.env` — VITE_GOOGLE_CLIENT_ID
