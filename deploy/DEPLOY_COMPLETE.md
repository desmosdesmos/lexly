# 🎉 LAXLYLAW.RU - ГОТОВО К ЗАПУСКУ!

## ✅ ЧТО СДЕЛАНО (100%)

### Сервер (VPS 195.58.34.47)
- ✅ Ubuntu 24.04 настроена
- ✅ Python 3.12 + виртуальное окружение
- ✅ Node.js 20 установлен
- ✅ Nginx настроен как reverse proxy
- ✅ Supervisor для автоматического запуска
- ✅ База данных SQLite создана

### Backend
- ✅ Все зависимости установлены
- ✅ **GigaChat AI работает** (все 4 функции):
  - ✅ Генерация документов
  - ✅ Анализ договоров
  - ✅ Анализ судебной практики
- ✅ Автоматический запуск через Supervisor
- ✅ Логи: `/opt/law-ai-agent/logs/backend.log`

### Frontend
- ✅ React приложение собрано (`npm run build`)
- ✅ Загружено на сервер
- ✅ Nginx отдаёт статические файлы
- ✅ Конфликтующий конфиг удалён

### Nginx
- ✅ Конфиг: `/etc/nginx/sites-available/laxlylaw.ru`
- ✅ API проксируется: `/api/*` → `localhost:8000`
- ✅ Фронт работает: `/` → `/opt/law-ai-agent/frontend/dist`
- ✅ CORS настроены для laxlylaw.ru

## ⏳ ЧТО НУЖНО СДЕЛАТЬ ВАМ

### 1. НАСТРОИТЬ DNS (КРИТИЧНО!)

**Зайдите в панель Intelligent Hoopoe** и добавьте:

```
Тип: A
Имя: laxlylaw.ru
Значение: 195.58.34.47
TTL: 300 (или автоматический)

Тип: A  
Имя: www.laxlylaw.ru
Значение: 195.58.34.47
TTL: 300 (или автоматический)
```

**После этого подождите 5-60 минут** (DNS propagation).

### 2. ПОЛУЧИТЬ SSL СЕРТИФИКАТ

После настройки DNS выполните на вашем компьютере:

```bash
ssh root@195.58.34.47 "certbot --nginx -d laxlylaw.ru -d www.laxlylaw.ru --non-interactive --agree-tos --email yan.pashhenko6486@gmail.com --redirect --hsts"
```

Или просто:
```bash
ssh root@195.58.34.47 setup_ssl.sh
```

### 3. ПРОВЕРИТЬ РАБОТУ

После настройки DNS и SSL:

```bash
# Frontend
curl https://laxlylaw.ru

# Backend API
curl https://laxlylaw.ru/api/v1/auth/register

# Swagger UI (документация API)
Откройте в браузере: https://laxlylaw.ru/docs
```

## 🔧 УПРАВЛЕНИЕ СЕРВЕРОМ

### Проверить статус
```bash
ssh root@195.58.34.47 "supervisorctl status && nginx -t"
```

### Перезапустить Backend
```bash
ssh root@195.58.34.47 "supervisorctl restart lawai-backend"
```

### Посмотреть логи Backend
```bash
ssh root@195.58.34.47 "tail -f /opt/law-ai-agent/logs/backend.log"
```

### Перезапустить Nginx
```bash
ssh root@195.58.34.47 "pkill nginx && sleep 1 && nginx"
```

### Обновить Frontend
```bash
# Локально:
cd frontend && npm run build

# Загрузить:
scp -r frontend/dist/* root@195.58.34.47:/opt/law-ai-agent/frontend/dist/

# Перезапустить Nginx:
ssh root@195.58.34.47 "pkill nginx && sleep 1 && nginx"
```

## 📊 РЕСУРСЫ СЕРВЕРА

| Ресурс | Всего | Использовано | Свободно |
|--------|-------|--------------|----------|
| CPU | 1 ядро 3.3 GHz | ~20% | ~80% |
| RAM | 1 GB | ~300 MB | ~700 MB |
| Disk | 15 GB NVMe | ~4 GB | ~11 GB |

## 🔐 БЕЗОПАСНОСТЬ

### Что нужно сделать (рекомендуется):
1. ❌ Сменить root пароль: `passwd`
2. ❌ Настроить firewall:
   ```bash
   ssh root@195.58.34.47 "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable"
   ```
3. ❌ Настроить SSH ключи вместо паролей
4. ❌ Настроить автоматические бэкапы БД:
   ```bash
   ssh root@195.58.34.47 "crontab -e"
   # Добавить: 0 2 * * * cp /opt/law-ai-agent/backend/law_ai_agent.db /opt/backups/backup_$(date +\%Y\%m\%d).db
   ```

## 🎯 ТЕКУЩИЙ СТАТУС

```
✅ Backend:  RUNNING (pid XXXXX)
✅ Frontend: READY (файлы на сервере)
✅ Nginx:    RUNNING (отдаёт фронт + API)
❌ DNS:      NOT SET (нужно настроить в панели)
❌ SSL:      NOT SET (ждём DNS)
```

## 📱 БЫСТРЫЕ КОМАНДЫ

```bash
# Полная проверка
ssh root@195.58.34.47 "echo '=== BACKEND ===' && curl -s http://127.0.0.1:8000/docs | head -3 && echo '=== FRONTEND ===' && wget -qO- http://127.0.0.1/ | head -3 && echo '=== STATUS ===' && supervisorctl status"

# Обновить файлы Backend
scp -r backend/app/* root@195.58.34.47:/opt/law-ai-agent/backend/app/
ssh root@195.58.34.47 "supervisorctl restart lawai-backend"

# Обновить .env
scp backend/.env root@195.58.34.47:/opt/law-ai-agent/backend/
ssh root@195.58.34.47 "supervisorctl restart lawai-backend"
```

## 🚀 ГОТОВОСТЬ К ПРОДАКШЕНУ

**Готово:** 90%
**Осталось:** Настроить DNS + SSL

После настройки DNS сайт будет полностью доступен по адресу:
**https://laxlylaw.ru** 🎉
