# Архитектура AI-юридической платформы

## 1. Общая структура

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Auth Page  │  │  Dashboard   │  │  Document Forms  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                  Backend (FastAPI)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Auth API   │  │  Payment API │  │  Webhook Proxy   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────┬──────────────────┬──────────────────┬─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────┐ ┌──────────────┐ ┌──────────────────────┐
│  PostgreSQL DB  │ │  Redis Cache │ │  n8n Workflows       │
│  - Users        │ │  - Sessions  │ │  - Document Gen      │
│  - Documents    │ │  - Rate Limit│ │  - Contract Review   │
│  - Payments     │ │              │ │  - Law Monitoring    │
│  - History      │ │              │ │  - Court Analysis    │
└─────────────────┘ └──────────────┘ └──────────┬───────────┘
                                                 │
                                    ┌────────────▼───────────┐
                                    │     AI API (OpenAI)    │
                                    │  - GPT-4/GPT-3.5       │
                                    │  - Strict Prompts      │
                                    │  - Validation Layer    │
                                    └────────────────────────┘
```

## 2. Структура проекта

```
law-ai-agent/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # Точка входа приложения
│   │   ├── config.py          # Конфигурация (env variables)
│   │   ├── database.py        # Подключение к БД
│   │   ├── models/            # SQLAlchemy модели
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   ├── payment.py
│   │   │   └── request_log.py
│   │   ├── schemas/           # Pydantic схемы
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   └── payment.py
│   │   ├── routers/           # API роуты
│   │   │   ├── auth.py
│   │   │   ├── documents.py
│   │   │   ├── contracts.py
│   │   │   ├── payments.py
│   │   │   └── user.py
│   │   ├── services/          # Бизнес-логика
│   │   │   ├── auth_service.py
│   │   │   ├── n8n_service.py
│   │   │   ├── payment_service.py
│   │   │   └── rate_limiter.py
│   │   └── middleware/        # Middleware
│   │       └── auth.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # UI компоненты
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── DocumentGenerator/
│   │   │   ├── ContractReviewer/
│   │   │   └── common/
│   │   ├── pages/             # Страницы
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── GenerateDocument.jsx
│   │   │   ├── ReviewContract.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/          # API сервисы
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   ├── documents.js
│   │   │   └── payments.js
│   │   ├── context/           # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/             # Кастомные хуки
│   │   ├── utils/             # Утилиты
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
│
├── n8n/                        # n8n workflows
│   ├── workflows/
│   │   ├── document-generator.json
│   │   ├── contract-reviewer.json
│   │   ├── law-monitor.json
│   │   └── court-analysis.json
│   └── Dockerfile
│
├── prompts/                    # AI промпты
│   ├── document-generator/
│   │   ├── claim.txt
│   │   ├── complaint.txt
│   │   └── demand.txt
│   ├── contract-reviewer/
│   │   └── analysis.txt
│   └── validators/
│       └── legal-norms.txt
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Пример переменных окружения
├── ARCHITECTURE.md             # Этот файл
└── README.md                   # Документация по запуску
```

## 3. Компоненты системы

### 3.1 Backend (FastAPI)

**Технологии:**
- FastAPI (Python 3.11+)
- SQLAlchemy (ORM)
- PostgreSQL (БД)
- Redis (кэш, rate limiting)
- JWT (аутентификация)
- Pydantic (валидация)

**Основные задачи:**
- Управление пользователями (регистрация, авторизация)
- Управление тарифами и лимитами
- Проксирование запросов к n8n
- Обработка платежей
- Логирование запросов

### 3.2 Frontend (React)

**Технологии:**
- React 18
- Vite (сборщик)
- Bootstrap 5 (UI фреймворк)
- React Router (навигация)
- Axios (HTTP клиент)

**Основные страницы:**
- Авторизация / Регистрация
- Дашборд пользователя
- Генератор документов
- Проверка договоров
- Профиль и настройки
- Страница оплаты

### 3.3 n8n Workflows

**Workflow 1: Генератор документов**
```
Webhook → Валидация данных → Загрузка промпта → AI API → 
Валидация ответа → Форматирование → Возврат результата
```

**Workflow 2: Проверка договоров**
```
Webhook → Извлечение текста из файла → Очистка текста → 
AI API (анализ) → Структурирование рисков → Возврат результата
```

**Workflow 3: Мониторинг законодательства** (Phase 2)
```
Cron → Парсинг источников → Сравнение с предыдущей версией → 
AI API (анализ изменений) → Уведомления (email/Telegram)
```

**Workflow 4: Анализ судебной практики** (Phase 2)
```
Webhook → Поиск решений → Фильтрация → AI API (анализ) → 
Формирование отчёта → Возврат результата
```

### 3.4 База данных (PostgreSQL)

**Таблицы:**

```sql
users
├── id (UUID, PK)
├── email (VARCHAR, unique)
├── password_hash (VARCHAR)
├── full_name (VARCHAR)
├── user_type (ENUM: individual, legal)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

subscriptions
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── plan_type (ENUM: free, basic, pro, enterprise)
├── status (ENUM: active, expired, cancelled)
├── start_date (DATE)
├── end_date (DATE)
└── auto_renew (BOOLEAN)

usage_limits
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── plan_type (VARCHAR)
├── documents_generated (INT)
├── contracts_reviewed (INT)
├── max_documents (INT)
├── max_contracts (INT)
└── reset_date (DATE)

documents
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── document_type (ENUM: claim, complaint, demand)
├── input_data (JSONB)
├── generated_content (TEXT)
├── status (ENUM: pending, completed, failed)
├── created_at (TIMESTAMP)
└── completed_at (TIMESTAMP)

contract_reviews
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── original_file_path (VARCHAR)
├── extracted_text (TEXT)
├── analysis_result (JSONB)
├── risks (JSONB)
├── recommendations (JSONB)
├── created_at (TIMESTAMP)
└── completed_at (TIMESTAMP)

payments
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── amount (DECIMAL)
├── currency (VARCHAR)
├── status (ENUM: pending, completed, failed, refunded)
├── payment_method (VARCHAR)
├── transaction_id (VARCHAR)
├── created_at (TIMESTAMP)
└── completed_at (TIMESTAMP)

request_logs
├── id (UUID, PK)
├── user_id (UUID, FK → users)
├── endpoint (VARCHAR)
├── request_data (JSONB)
├── response_status (INT)
├── ai_tokens_used (INT)
├── created_at (TIMESTAMP)
```

## 4. API Endpoints

### 4.1 Аутентификация
```
POST /api/v1/auth/register      # Регистрация
POST /api/v1/auth/login         # Вход
POST /api/v1/auth/logout        # Выход
POST /api/v1/auth/refresh       # Обновление токена
POST /api/v1/auth/forgot-password  # Сброс пароля
```

### 4.2 Документы
```
POST /api/v1/documents/generate      # Генерация документа
GET  /api/v1/documents               # Список документов пользователя
GET  /api/v1/documents/{id}          # Получить документ
GET  /api/v1/documents/{id}/download # Скачать документ
```

### 4.3 Договоры
```
POST /api/v1/contracts/review        # Проверка договора
GET  /api/v1/contracts               # Список проверок
GET  /api/v1/contracts/{id}          # Получить результат
```

### 4.4 Пользователь
```
GET  /api/v1/user/profile            # Профиль пользователя
PUT  /api/v1/user/profile            # Обновить профиль
GET  /api/v1/user/usage              # Использование лимитов
GET  /api/v1/user/history            # История запросов
```

### 4.5 Оплата
```
GET  /api/v1/payments/plans          # Тарифные планы
POST /api/v1/payments/subscribe      # Подписка
POST /api/v1/payments/webhook        # Webhook от платёжной системы
GET  /api/v1/payments/history        # История платежей
```

## 5. Защита от AI галлюцинаций

### 5.1 Многоуровневая валидация

```
AI Response → Структурная валидация → Проверка ссылок на нормы → 
Форматирование → Возврат пользователю
```

### 5.2 Строгие промпты

- Чёткая структура ответа (JSON schema)
- Запрет на вымышленные нормы права
- Требование указывать реальные статьи
- Системный промпт с ограничениями

### 5.3 Постобработка

- Извлечение и проверка всех ссылок на законодательство
- Сравнение с базой известных норм (если доступна)
- Предупреждения при неуверенности AI

## 6. Масштабирование

### Phase 1 (MVP)
- ✅ Генератор документов
- ✅ Проверка договоров
- ✅ Базовая аутентификация
- ✅ Freemium модель

### Phase 2
- ⬜ Мониторинг законодательства
- ⬜ Анализ судебной практики
- ⬜ Telegram бот для уведомлений
- ⬜ Расширенная аналитика

### Phase 3
- ⬜ Мультиязычность
- ⬜ Интеграция с государственными API
- ⬜ Командная работа
- ⬜ API для внешних интеграций

## 7. Безопасность

- JWT токены с коротким временем жизни
- HTTPS для всех запросов
- Шифрование чувствительных данных
- Rate limiting на пользователя
- Валидация всех входных данных
- Логирование подозрительной активности
- GDPR compliance

## 8. Мониторинг и логирование

- Sentry для отслеживания ошибок
- Prometheus + Grafana для метрик
- Логирование всех AI запросов
- Мониторинг использования токенов
- Алерты при аномалиях
