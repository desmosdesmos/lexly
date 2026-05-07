## Qwen Added Memories
- Проект Law AI Agent - SaaS юридическая платформа с AI. Дата последней работы: 11 апреля 2026.
- **GIGACHAT AI ИНТЕГРАЦИЯ ЗАВЕРШЕНА!** Все 4 функции работают через GigaChat API.
- GigaChat Client ID: `019d790e-8da9-72a6-ad4a-d8c5ae5b7263`
- GigaChat Client Secret: `116eb66c-fd06-44ec-b3ab-c6b9e860804d`
- Модель: `GigaChat-Pro`
- AI_PROVIDER=gigachat (в .env)
- **ВАЖНО:** GigaChat возвращает JSON в markdown блоках (```json...) - исправлено в ai_service.py
- **Все функции работают через GIGACHAT:**
  1. `/api/v1/documents/generate` - генерация документов (claim/complaint/demand) ✅
  2. `/api/v1/contracts/review` - проверка договоров ✅
  3. `/api/v1/court-practice/analyze` - анализ судебной практики ✅
  4. `/api/v1/legislation/monitor` - мониторинг законодательства ✅
- GROQ API больше не используется (ключ сохранён но не активен)
- Все модели БД на SQLite (String вместо UUID, без PostgreSQL Enum).
- Промпты: prompts/document-generator/, prompts/contract-reviewer
- Внешние источники: sudact.ru (судебная практика), garant.ru (законодательство)
- Middleware auth.py имеет фикс для UUID (убраны дефисы).
- Тестовые скрипты: test_gigachat_full.py (полный тест), test_ai_simple.py (простой тест)
- Исправлены все проблемы с SQLite (dict -> json.dumps для Text колонок).
- Исправлены все проблемы с Enum (.value -> hasattr проверка).
- Исправлен парсинг JSON из GigaChat (удаление markdown блоков)

## 🚀 ДЕПЛОЙ НА VPS (11 апреля 2026)
- **Домен:** laxlylaw.ru
- **VPS:** 195.58.34.47 (Cloud MSK 15: 1 CPU, 1GB RAM, 15GB NVMe)
- **OS:** Ubuntu 24.04
- **Root пароль:** zNng*xz4Cww4TC
- **Backend:** /opt/law-ai-agent/backend (Supervisor: lawai-backend)
- **Frontend:** /opt/law-ai-agent/frontend/dist (собран и загружен)
- **Nginx:** reverse proxy (конфликтующий конфиг lexly удалён)
- **CORS:** обновлены для laxlylaw.ru
- **SSL:** НЕ ПОЛУЧЕН (DNS ещё не настроен!)

### ❌ ОЖИДАЕТСЯ:
- DNS A-запись: laxlylaw.ru → 195.58.34.47 (нужно добавить в панели Intelligent Hoopoe)
- После DNS: запустить `ssh root@195.58.34.47 setup_ssl.sh`

### 🔧 Управление:
- Проверка: `ssh root@195.58.34.47 "supervisorctl status && nginx -t"`
- Логи backend: `ssh root@195.58.34.47 "tail -f /opt/law-ai-agent/logs/backend.log"`
- Рестарт backend: `ssh root@195.58.34.47 "supervisorctl restart lawai-backend"`
- Документация: deploy/DEPLOY_COMPLETE.md
