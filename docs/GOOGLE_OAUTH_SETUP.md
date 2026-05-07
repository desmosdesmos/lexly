# Настройка Google OAuth и Email для Law AI Agent

## 📋 Содержание
1. [Google OAuth авторизация](#google-oauth)
2. [Email для восстановления пароля](#email-настройка)
3. [Тестирование](#тестирование)

---

## 🔐 Google OAuth

### Шаг 1: Создание проекта в Google Cloud Console

1. Перейдите на [Google Cloud Console](https://console.cloud.google.com/)
2. Нажмите **"Select a project"** → **"NEW PROJECT"**
3. Введите название (например, "Law AI Agent")
4. Нажмите **"CREATE"**

### Шаг 2: Настройка OAuth consent screen

1. Перейдите в **APIs & Services** → **OAuth consent screen**
2. Выберите **External** (или **Internal** если у вас Google Workspace)
3. Заполните:
   - **App name**: Law AI Agent
   - **User support email**: Ваш email
   - **Developer contact email**: Ваш email
4. Нажмите **"SAVE AND CONTINUE"** (3 раза, пропуская scopes и test users)

### Шаг 3: Создание OAuth credentials

1. Перейдите в **APIs & Services** → **Credentials**
2. Нажмите **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Выберите **Application type**: **Web application**
4. Заполните:
   - **Name**: Law AI Agent Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     http://localhost:3000
     http://localhost:8000
     ```
   - **Authorized redirect URIs**: (оставьте пустым для One Tap)
5. Нажмите **"CREATE"**
6. **Скопируйте Client ID** (вида `xxxxx.apps.googleusercontent.com`)

### Шаг 4: Настройка в проекте

#### Backend (.env):
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

#### Frontend (.env):
Создайте файл `frontend/.env`:
```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

### Шаг 5: Публикация приложения (опционально)

Для production нужно опубликовать OAuth consent screen:
1. Перейдите в **OAuth consent screen**
2. Нажмите **"PUBLISH APP"**
3. Это сделает приложение доступным для всех пользователей

---

## 📧 Email настройка

### Вариант 1: Gmail с App Password

#### Шаг 1: Включите 2-Step Verification

1. Перейдите в [Google Account](https://myaccount.google.com/)
2. **Security** → **2-Step Verification** → Включите

#### Шаг 2: Создайте App Password

1. Перейдите на [App Passwords](https://myaccount.google.com/apppasswords)
2. Выберите **App**: Mail
3. Выберите **Device**: Other (Custom name)
4. Введите: "Law AI Agent"
5. Нажмите **"GENERATE"**
6. **Скопируйте пароль** (16 символов, без пробелов)

#### Шаг 3: Настройка в .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop  # 16-символьный App Password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Law AI Agent
```

### Вариант 2: Yandex Mail

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your-email@yandex.ru
SMTP_PASSWORD=your-yandex-password
SMTP_FROM_EMAIL=your-email@yandex.ru
SMTP_FROM_NAME=Law AI Agent
```

### Вариант 3: Mail.ru

```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=587
SMTP_USER=your-email@mail.ru
SMTP_PASSWORD=your-mailru-password
SMTP_FROM_EMAIL=your-email@mail.ru
SMTP_FROM_NAME=Law AI Agent
```

---

## 🧪 Тестирование

### Тест Google авторизации:

1. Запустите backend:
   ```bash
   cd backend
   venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
   ```

2. Запустите frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Перейдите на `http://localhost:5173/login`
4. Должна появиться кнопка **"Continue with Google"**
5. Нажмите и войдите через Google аккаунт

### Тест восстановления пароля:

1. Перейдите на `http://localhost:5173/forgot-password`
2. Введите email зарегистрированного пользователя
3. Проверьте почту (должно прийти письмо)
4. Перейдите по ссылке из письма
5. Введите новый пароль
6. Попробуйте войти с новым паролем

---

## 🔧 Troubleshooting

### Google кнопка не появляется:
- Проверьте `VITE_GOOGLE_CLIENT_ID` в `frontend/.env`
- Перезапустите `npm run dev`
- Откройте Console (F12) и проверьте ошибки

### Ошибка "invalid_client" при Google входе:
- Проверьте `GOOGLE_CLIENT_ID` в `backend/.env`
- Убедитесь что Client ID заканчивается на `.apps.googleusercontent.com`

### Email не отправляется:
- Проверьте логи backend (должно быть предупреждение)
- Для тестирования токен сброса выводится в логи
- Убедитесь что SMTP_PASSWORD правильный (App Password для Gmail)

### Письмо не приходит:
- Проверьте папку "Спам"
- Для Gmail убедитесь что используется **App Password**, не обычный пароль
- Проверьте логи backend на ошибки SMTP

---

## 📁 Итоговые файлы

### backend/.env:
```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Law AI Agent
```

### frontend/.env:
```env
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## ✅ Готово!

После настройки у вас будут работать:
- ✅ Вход через Google (One Tap)
- ✅ Регистрация через Google
- ✅ Восстановление пароля через email
- ✅ Красивые email письма с HTML шаблоном
