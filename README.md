# Law AI Agent - AI-юридическая платформа

> SaaS-платформа для автоматизации юридических задач с использованием AI и n8n

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📋 Содержание

- [Описание](#описание)
- [Возможности](#возможности)
- [Архитектура](#архитектура)
- [Технологический стек](#технологический-стек)
- [Быстрый старт](#быстрый-старт)
  - [Запуск через Docker (рекомендуется)](#запуск-через-docker-рекомендуется)
  - [Локальная разработка](#локальная-разработка)
- [Структура проекта](#структура-проекта)
- [API документация](#api-документация)
- [Настройка AI](#настройка-ai)
- [Модули платформы](#модули-платформы)
- [Тарифные планы](#тарифные-планы)
- [Защита от AI галлюцинаций](#защита-от-ai-галлюцинаций)
- [Масштабирование](#масштабирование)
- [FAQ](#faq)
- [Лицензия](#лицензия)

## 📖 Описание

**Law AI Agent** — это веб-платформа (SaaS) в юридической сфере, которая помогает пользователям автоматизировать юридические задачи:

- ✅ Генерация исковых заявлений, жалоб и претензий
- ✅ Проверка договоров на риски
- 🔄 Мониторинг изменений законодательства (в разработке)
- 🔄 Анализ судебной практики (в разработке)

**Модель монетизации:** Freemium (бесплатный доступ с лимитами + платные подписки)

## ⚡ Возможности

### MVP (доступно сейчас)

1. **Генератор документов**
   - Исковые заявления
   - Жалобы
   - Претензии
   - AI формирует юридически структурированный документ

2. **Проверка договоров**
   - Выявление юридических рисков
   - Анализ невыгодных условий
   - Рекомендации по исправлению
   - Пояснения простым языком

### В разработке

3. **Мониторинг законодательства**
   - Автоматический парсинг источников
   - Уведомления об изменениях
   - Влияние на пользователей

4. **Анализ судебной практики**
   - Поиск релевантных решений
   - Аналитическая выжимка
   - Типичные исходы дел

## 🏗 Архитектура

```
┌─────────────────┐
│   Frontend      │  React + Bootstrap
│   (Port 80)     │
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend       │  FastAPI
│   (Port 8000)   │
└──┬───────┬──────┘
   │       │
┌──▼──┐  ┌─▼────────┐
│ DB  │  │ n8n      │  AI Workflows
│ PG  │  │ (5678)   │
└─────┘  └────┬─────┘
              │
         ┌────▼────┐
         │ AI API  │  OpenAI/GPT-4
         └─────────┘
```

## 💻 Технологический стек

**Backend:**
- Python 3.11+
- FastAPI (веб-фреймворк)
- SQLAlchemy (ORM)
- PostgreSQL (база данных)
- Redis (кэш, rate limiting)
- n8n (оркестрация AI workflows)

**Frontend:**
- React 18
- Vite (сборщик)
- Bootstrap 5 + React-Bootstrap
- Axios (HTTP клиент)
- React Router

**AI:**
- OpenAI API (GPT-4)
- Строгие промпты с валидацией
- Защита от галлюцинаций

**Инфраструктура:**
- Docker + Docker Compose
- Nginx (reverse proxy)

## 🚀 Быстрый старт

### Запуск через Docker (рекомендуется)

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd law-ai-agent
```

2. **Создайте файл .env:**
```bash
cp .env.example .env
```

3. **Заполните .env:**
```env
SECRET_KEY=your-super-secret-key-here
OPENAI_API_KEY=sk-your-openai-api-key
```

4. **Запустите все сервисы:**
```bash
docker-compose up -d
```

5. **Откройте браузер:**
- Frontend: http://localhost
- Backend API: http://localhost:8000
- n8n: http://localhost:5678
- API Docs: http://localhost:8000/docs

6. **Зарегистрируйтесь и начните использовать!**

**Остановка:**
```bash
docker-compose down
```

**Остановка с удалением данных:**
```bash
docker-compose down -v
```

---

### Локальная разработка

#### Требования
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- n8n (глобально или через Docker)

#### Backend

1. **Создайте виртуальное окружение:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. **Установите зависимости:**
```bash
pip install -r requirements.txt
```

3. **Настройте .env:**
```bash
cp .env.example .env
# Отредактируйте .env
```

4. **Создайте базу данных:**
```bash
psql -U postgres
CREATE DATABASE law_ai_agent;
\q

# Импортируйте схему
psql -U postgres -d law_ai_agent -f ../database/schema.sql
```

5. **Запустите backend:**
```bash
uvicorn app.main:app --reload --port 8000
```

Backend доступен на: http://localhost:8000

#### Frontend

1. **Установите зависимости:**
```bash
cd frontend
npm install
```

2. **Запустите:**
```bash
npm run dev
```

Frontend доступен на: http://localhost:5173

#### n8n

**Вариант 1: Через Docker**
```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

**Вариант 2: Глобальная установка**
```bash
npm install n8n -g
n8n start
```

**Импорт workflows:**
1. Откройте http://localhost:5678
2. Создайте новый workflow
3. Импортируйте из `n8n/workflows/*.json`
4. Настройте credentials для OpenAI
5. Активируйте workflow

## 📁 Структура проекта

```
law-ai-agent/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # Точка входа
│   │   ├── config.py          # Конфигурация
│   │   ├── database.py        # Подключение к БД
│   │   ├── models/            # SQLAlchemy модели
│   │   ├── schemas/           # Pydantic схемы
│   │   ├── routers/           # API роуты
│   │   ├── services/          # Бизнес-логика
│   │   └── middleware/        # Middleware
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # UI компоненты
│   │   ├── pages/             # Страницы
│   │   ├── services/          # API сервисы
│   │   ├── context/           # React Context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.js
│
├── n8n/                        # n8n workflows
│   └── workflows/
│       ├── document-generator.json
│       └── contract-reviewer.json
│
├── prompts/                    # AI промпты
│   ├── document-generator/
│   │   ├── claim.txt
│   │   ├── complaint.txt
│   │   └── demand.txt
│   └── contract-reviewer/
│       └── analysis.txt
│
├── database/
│   └── schema.sql             # SQL схема
│
├── docker-compose.yml          # Docker orchestration
├── .env.example                # Пример переменных
├── .gitignore
├── ARCHITECTURE.md             # Архитектура
├── API.md                      # API документация
└── README.md                   # Этот файл
```

## 📚 API документация

Полная документация API доступна в файле [API.md](API.md) или через Swagger UI:

```
http://localhost:8000/docs
```

### Основные эндпоинты

**Аутентификация:**
- `POST /api/v1/auth/register` - Регистрация
- `POST /api/v1/auth/login` - Вход
- `POST /api/v1/auth/refresh` - Обновление токена

**Документы:**
- `POST /api/v1/documents/generate` - Генерация документа
- `GET /api/v1/documents` - Список документов
- `GET /api/v1/documents/{id}` - Получить документ

**Договоры:**
- `POST /api/v1/contracts/review` - Проверка договора
- `GET /api/v1/contracts` - Список проверок
- `GET /api/v1/contracts/{id}` - Результат проверки

**Пользователь:**
- `GET /api/v1/user/profile` - Профиль
- `GET /api/v1/user/usage` - Лимиты
- `GET /api/v1/user/history` - История

**Оплата:**
- `GET /api/v1/payments/plans` - Тарифы
- `POST /api/v1/payments/subscribe` - Подписка
- `GET /api/v1/payments/history` - История платежей

## 🤖 Настройка AI

### OpenAI API

1. **Получите API ключ:**
   - Зарегистрируйтесь на https://platform.openai.com
   - Создайте API ключ в разделе API Keys

2. **Добавьте в .env:**
```env
OPENAI_API_KEY=sk-your-api-key-here
```

3. **Настройте модель (опционально):**
```env
OPENAI_MODEL=gpt-4
AI_MAX_TOKENS=4000
AI_TEMPERATURE=0.3
```

### Альтернативные AI провайдеры

Если OpenAI недоступен, можно использовать совместимые API:

```env
OPENAI_BASE_URL=https://your-alternative-ai-api.com/v1
OPENAI_MODEL=your-model-name
```

## 📦 Модули платформы

### 1. Генератор документов

**Как работает:**
1. Пользователь заполняет форму
2. Данные отправляются в n8n workflow
3. Workflow загружает промпт, подставляет данные
4. AI генерирует документ
5. Результат возвращается пользователю

**Типы документов:**
- Исковые заявления
- Жалобы
- Претензии

**Защита от галлюцинаций:**
- Строгие промпты с запретами на вымышленные нормы
- Валидация ответа
- Требование указывать только реальные статьи

### 2. Проверка договоров

**Как работает:**
1. Пользователь загружает файл (PDF/DOC/DOCX)
2. Backend извлекает текст
3. Текст отправляется в n8n workflow
4. AI анализирует договор по категориям
5. Возвращается структурированный отчёт с рисками

**Категории рисков:**
- Финансовые (штрафы, скрытые платежи)
- Юридические (несоответствие законам)
- Операционные (нереалистичные сроки)
- Риски расторжения

### 3. Мониторинг законодательства (в разработке)

**Функционал:**
- Парсинг источников права
- Выявление изменений
- Уведомления пользователей

### 4. Анализ судебной практики (в разработке)

**Функционал:**
- Поиск релевантных решений
- Фильтрация и анализ
- Аналитическая выжимка

## 💰 Тарифные планы

| Возможность | Free | Basic (990₽/мес) | Pro (2990₽/мес) | Enterprise (9990₽/мес) |
|-------------|------|------------------|-----------------|------------------------|
| Документов/мес | 5 | 30 | 200 | ∞ |
| Проверок договоров/мес | 3 | 20 | 100 | ∞ |
| Приоритетная поддержка | ❌ | ❌ | ✅ | ✅ |
| API доступ | ❌ | ❌ | ✅ | ✅ |
| Командная работа | ❌ | ❌ | ❌ | ✅ (10 чел) |
| Кастомные интеграции | ❌ | ❌ | ❌ | ✅ |

## 🛡 Защита от AI галлюцинаций

### Многоуровневая система

**1. Строгие промпты:**
- Запрет на вымышленные нормы права
- Требование указывать только реальные статьи
- Чёткая структура ответа

**2. Валидация ответов:**
- Проверка структуры (JSON schema)
- Извлечение ссылок на нормы права
- Проверка на пустой ответ

**3. Постобработка:**
- Анализ уверенности AI
- Предупреждения при низкой уверенности
- Логирование для анализа

**4. Disclaimer:**
- "Сервис не является юридической консультацией"
- Пользовательское соглашение
- Ограничение ответственности

## 📈 Масштабирование

### Phase 1 (MVP) ✅
- [x] Генератор документов
- [x] Проверка договоров
- [x] Базовая аутентификация
- [x] Freemium модель

### Phase 2
- [ ] Мониторинг законодательства
- [ ] Анализ судебной практики
- [ ] Telegram бот
- [ ] Email уведомления

### Phase 3
- [ ] Мультиязычность
- [ ] Интеграция с государственными API
- [ ] Командная работа
- [ ] Public API

## ❓ FAQ

### Как изменить AI модель?

Отредактируйте `.env`:
```env
OPENAI_MODEL=gpt-3.5-turbo  # или gpt-4
```

### Как увеличить лимиты?

Измените тарифный план в БД или отредактируйте `PLAN_LIMITS` в `usage_limit_service.py`.

### Как добавить новый тип документа?

1. Создайте промпт в `prompts/document-generator/new_type.txt`
2. Добавьте enum в `backend/app/models/document.py`
3. Обновите frontend форму

### Как настроить платежи?

1. Зарегистрируйтесь в платёжной системе (Stripe/YooKassa)
2. Добавьте API ключи в `.env`
3. Обновите `payments.py` webhook handler

### Как импортировать n8n workflows?

1. Откройте n8n (http://localhost:5678)
2. Создайте новый workflow
3. Импортируйте JSON из `n8n/workflows/`
4. Настройте credentials
5. Активируйте

## 📝 Лицензия

MIT License

## ⚠️ Юридическое ограничение

**ВАЖНО:** Данный сервис не является юридической консультацией. Все результаты носят информационный характер. Для получения квалифицированной юридической помощи обратитесь к лицензированному юристу.

## 📞 Поддержка

- Email: support@law-ai-agent.com
- Документация: [ARCHITECTURE.md](ARCHITECTURE.md), [API.md](API.md)

---

Сделано с ❤️ для юридической автоматизации
