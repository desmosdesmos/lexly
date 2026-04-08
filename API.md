# API Документация

## Базовый URL
```
Development: http://localhost:8000/api/v1
Production: https://api.law-ai-agent.com/api/v1
```

## Аутентификация

Все защищённые эндпоинты требуют заголовок авторизации:
```
Authorization: Bearer <access_token>
```

---

## 1. Аутентификация

### 1.1 Регистрация пользователя
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "Иванов Иван Иванович",
  "user_type": "individual"
}
```

**Response 201:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "full_name": "Иванов Иван Иванович",
  "user_type": "individual",
  "created_at": "2026-04-05T10:00:00Z"
}
```

**Response 400 (Email уже зарегистрирован):**
```json
{
  "detail": "Пользователь с таким email уже существует"
}
```

---

### 1.2 Вход в систему
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**Response 401 (Неверные учётные данные):**
```json
{
  "detail": "Неверный email или пароль"
}
```

---

### 1.3 Обновление токена
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### 1.4 Выход из системы
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "message": "Вы успешно вышли из системы"
}
```

---

## 2. Документы

### 2.1 Генерация документа
**POST** `/documents/generate`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "document_type": "claim",
  "data": {
    "court_name": "Арбитражный суд г. Москвы",
    "plaintiff": {
      "name": "ООО \"Ромашка\"",
      "inn": "7701234567",
      "address": "г. Москва, ул. Примерная, д. 1"
    },
    "defendant": {
      "name": "ООО \"Лютик\"",
      "inn": "7709876543",
      "address": "г. Москва, ул. Другая, д. 2"
    },
    "circumstances": "Между сторонами был заключён договор поставки №123 от 01.01.2026. Ответчик нарушил сроки поставки на 30 дней.",
    "legal_basis": "Ст. 506, 506.1 ГК РФ, ст. 28 АПК РФ",
    "claims": [
      "Взыскать неустойку в размере 50 000 рублей",
      "Взыскать судебные расходы в размере 10 000 рублей"
    ]
  }
}
```

**Response 202 (Запрос принят):**
```json
{
  "document_id": "uuid-string",
  "status": "pending",
  "estimated_time_seconds": 30
}
```

**Response 400 (Ошибка валидации):**
```json
{
  "detail": {
    "field": "data.court_name",
    "message": "Наименование суда обязательно для заполнения"
  }
}
```

**Response 429 (Превышен лимит):**
```json
{
  "detail": "Превышен лимит генерации документов для вашего тарифа. Доступно: 3, использовано: 3"
}
```

---

### 2.2 Получение статуса документа
**GET** `/documents/{document_id}`

**Headers:** `Authorization: Bearer <token>`

**Response 200 (Готов):**
```json
{
  "id": "uuid-string",
  "document_type": "claim",
  "status": "completed",
  "generated_content": "В Арбитражный суд г. Москвы\n\nИстец: ООО \"Ромашка\"...\n\nИСКОВОЕ ЗАЯВЛЕНИЕ\nо взыскании неустойки по договору поставки\n\n...",
  "created_at": "2026-04-05T10:00:00Z",
  "completed_at": "2026-04-05T10:00:30Z"
}
```

**Response 200 (В процессе):**
```json
{
  "id": "uuid-string",
  "document_type": "claim",
  "status": "pending",
  "generated_content": null,
  "created_at": "2026-04-05T10:00:00Z",
  "completed_at": null
}
```

---

### 2.3 Список документов пользователя
**GET** `/documents?page=1&limit=20`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-string",
      "document_type": "claim",
      "status": "completed",
      "created_at": "2026-04-05T10:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

---

### 2.4 Скачивание документа
**GET** `/documents/{document_id}/download`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="claim_2026-04-05.pdf"

[Binary PDF data]
```

---

## 3. Договоры

### 3.1 Проверка договора
**POST** `/contracts/review`

**Headers:** 
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: [binary file data] (PDF/DOC/DOCX)
```

**Response 202 (Запрос принят):**
```json
{
  "contract_review_id": "uuid-string",
  "status": "pending",
  "estimated_time_seconds": 60
}
```

**Response 400 (Неподдерживаемый формат):**
```json
{
  "detail": "Неподдерживаемый формат файла. Поддерживаются: PDF, DOC, DOCX"
}
```

**Response 413 (Файл слишком большой):**
```json
{
  "detail": "Размер файла не должен превышать 10 МБ"
}
```

---

### 3.2 Получение результата проверки
**GET** `/contracts/{contract_review_id}`

**Headers:** `Authorization: Bearer <token>`

**Response 200 (Готов):**
```json
{
  "id": "uuid-string",
  "original_file_name": "contract.pdf",
  "status": "completed",
  "analysis": {
    "summary": "Договор содержит 5 потенциальных рисков",
    "risk_level": "medium",
    "risks": [
      {
        "id": 1,
        "type": "financial",
        "severity": "high",
        "clause": "п. 5.2 Договора",
        "text": "Штраф за нарушение сроков оплаты составляет 50% от суммы договора",
        "explanation": "Чрезмерно высокий размер неустойки. Согласно ст. 333 ГК РФ, суд может уменьшить неустойку, но лучше заранее согласовать разумный размер.",
        "recommendation": "Предложить снизить штраф до 0.1% от суммы задолженности за каждый день просрочки"
      },
      {
        "id": 2,
        "type": "legal",
        "severity": "medium",
        "clause": "п. 8.1 Договора",
        "text": "Все споры подлежат рассмотрению в суде по месту нахождения Истца",
        "explanation": "Данное условие может быть невыгодным для Ответчика, так как потребует ведения дел в другом регионе.",
        "recommendation": "Предложить альтернативу: рассмотрение споров по месту нахождения Ответчика или в согласованном суде"
      }
    ],
    "recommendations": [
      "Согласовать размер неустойки в соответствии со ст. 395 ГК РФ",
      "Добавить условие о досудебном урегулировании споров",
      "Уточнить порядок приёмки товаров/услуг"
    ]
  },
  "created_at": "2026-04-05T10:00:00Z",
  "completed_at": "2026-04-05T10:01:00Z"
}
```

---

### 3.3 Список проверок договоров
**GET** `/contracts?page=1&limit=20`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-string",
      "original_file_name": "contract.pdf",
      "status": "completed",
      "risk_level": "medium",
      "created_at": "2026-04-05T10:00:00Z"
    }
  ],
  "total": 8,
  "page": 1,
  "limit": 20
}
```

---

## 4. Пользователь

### 4.1 Профиль пользователя
**GET** `/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "full_name": "Иванов Иван Иванович",
  "user_type": "individual",
  "subscription": {
    "plan": "free",
    "status": "active",
    "end_date": null
  },
  "created_at": "2026-04-05T10:00:00Z"
}
```

---

### 4.2 Обновление профиля
**PUT** `/user/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "Иванов Иван Петрович"
}
```

**Response 200:**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "full_name": "Иванов Иван Петрович",
  "user_type": "individual"
}
```

---

### 4.3 Использование лимитов
**GET** `/user/usage`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "plan": "free",
  "limits": {
    "documents": {
      "max": 5,
      "used": 3,
      "remaining": 2,
      "reset_date": "2026-05-05"
    },
    "contracts": {
      "max": 3,
      "used": 1,
      "remaining": 2,
      "reset_date": "2026-05-05"
    }
  }
}
```

---

### 4.4 История запросов
**GET** `/user/history?page=1&limit=20`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-string",
      "type": "document_generation",
      "status": "completed",
      "created_at": "2026-04-05T10:00:00Z",
      "tokens_used": 1500
    },
    {
      "id": "uuid-string",
      "type": "contract_review",
      "status": "completed",
      "created_at": "2026-04-05T09:00:00Z",
      "tokens_used": 2500
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20
}
```

---

## 5. Оплата

### 5.1 Тарифные планы
**GET** `/payments/plans`

**Response 200:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Бесплатный",
      "price": 0,
      "currency": "RUB",
      "billing_period": null,
      "features": {
        "documents_per_month": 5,
        "contracts_per_month": 3,
        "priority_support": false,
        "api_access": false
      }
    },
    {
      "id": "basic",
      "name": "Базовый",
      "price": 990,
      "currency": "RUB",
      "billing_period": "monthly",
      "features": {
        "documents_per_month": 30,
        "contracts_per_month": 20,
        "priority_support": false,
        "api_access": false
      }
    },
    {
      "id": "pro",
      "name": "Профессиональный",
      "price": 2990,
      "currency": "RUB",
      "billing_period": "monthly",
      "features": {
        "documents_per_month": 200,
        "contracts_per_month": 100,
        "priority_support": true,
        "api_access": true
      }
    },
    {
      "id": "enterprise",
      "name": "Корпоративный",
      "price": 9990,
      "currency": "RUB",
      "billing_period": "monthly",
      "features": {
        "documents_per_month": -1,
        "contracts_per_month": -1,
        "priority_support": true,
        "api_access": true,
        "team_members": 10,
        "custom_integrations": true
      }
    }
  ]
}
```

---

### 5.2 Оформление подписки
**POST** `/payments/subscribe`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "plan_id": "basic",
  "payment_method": "card"
}
```

**Response 200:**
```json
{
  "payment_url": "https://payment-gateway.com/pay/session_abc123",
  "session_id": "session_abc123",
  "plan_id": "basic",
  "amount": 990,
  "currency": "RUB"
}
```

---

### 5.3 Webhook от платёжной системы
**POST** `/payments/webhook`

**Headers:** 
```
X-Webhook-Signature: <signature>
```

**Request Body:**
```json
{
  "event": "payment.completed",
  "session_id": "session_abc123",
  "user_id": "uuid-string",
  "amount": 990,
  "currency": "RUB",
  "plan_id": "basic"
}
```

**Response 200:**
```json
{
  "status": "ok"
}
```

---

### 5.4 История платежей
**GET** `/payments/history?page=1&limit=20`

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-string",
      "plan_id": "basic",
      "amount": 990,
      "currency": "RUB",
      "status": "completed",
      "payment_method": "card",
      "created_at": "2026-04-05T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

---

## 6. Ошибки

### Стандартные коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Ошибка валидации запроса |
| 401 | Неавторизованный доступ |
| 403 | Недостаточно прав |
| 404 | Ресурс не найден |
| 429 | Превышен лимит запросов |
| 500 | Внутренняя ошибка сервера |

### Формат ошибки
```json
{
  "detail": "Описание ошибки"
}
```

Или для ошибок валидации:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Некорректный email адрес",
      "type": "value_error"
    }
  ]
}
```

---

## 7. Rate Limiting

| Тариф | Документов/мес | Договоров/мес | Запросов/мин |
|-------|----------------|---------------|--------------|
| Free  | 5              | 3             | 10           |
| Basic | 30             | 20            | 30           |
| Pro   | 200            | 100           | 100          |
| Enterprise | ∞         | ∞             | 500          |

**Response при превышении лимита (429):**
```json
{
  "detail": "Превышен лимит запросов. Попробуйте через 60 секунд",
  "retry_after": 60
}
```

---

## 8. WebSocket (для статусов в реальном времени)

### Подключение
```
ws://localhost:8000/ws/{user_id}?token=<access_token>
```

### Сообщения

**Подписка на статус документа:**
```json
{
  "action": "subscribe",
  "document_id": "uuid-string"
}
```

**Получение обновления:**
```json
{
  "type": "document_status",
  "document_id": "uuid-string",
  "status": "completed",
  "content": "..."
}
```

---

## 9. Примеры использования

### JavaScript (Fetch API)

```javascript
// Генерация документа
const response = await fetch('http://localhost:8000/api/v1/documents/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    document_type: 'claim',
    data: {
      court_name: 'Арбитражный суд г. Москвы',
      // ... остальные данные
    }
  })
});

const result = await response.json();
console.log(result);
```

### Python (requests)

```python
import requests

# Проверка договора
with open('contract.pdf', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/v1/contracts/review',
        headers={'Authorization': f'Bearer {token}'},
        files={'file': f}
    )
    
result = response.json()
print(result)
```
