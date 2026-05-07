# 🚀 Деплой Law AI Agent на VPS

## ✅ Выполнено

### 1. Настройка сервера
- ✅ Ubuntu 24.04 на VPS 195.58.34.47
- ✅ Python 3.12 + Node.js 20 установлены
- ✅ Nginx настроен как reverse proxy
- ✅ Supervisor для автоматического запуска backend
- ✅ База данных SQLite инициализирована

### 2. Backend
- ✅ Загружен в `/opt/law-ai-agent/backend`
- ✅ Виртуальное окружение настроено
- ✅ Все зависимости установлены
- ✅ GigaChat AI работает (все 4 функции)
- ✅ Запускается автоматически через Supervisor

### 3. Frontend  
- ⏳ Пока не собран (нужно собрать React приложение)

### 4. Nginx конфигурация
- ✅ Конфиг: `/etc/nginx/sites-available/laxlylaw.ru`
- ✅ Проксирование API: `http://IP/api/*` → `localhost:8000`
- ✅ Статические файлы: `http://IP/` → `/opt/law-ai-agent/frontend/dist`

## 📋 Что осталось сделать

### 1. Настроить DNS (ВАЖНО!)
В панели управления хостингом Intelligent Hoopoe добавьте:

**A-запись:**
```
laxlylaw.ru → 195.58.34.47
www.laxlylaw.ru → 195.58.34.47
```

После этого (через 5-60 минут) выполните:
```bash
ssh root@195.58.34.47 "certbot --nginx -d laxlylaw.ru -d www.laxlylaw.ru --non-interactive --agree-tos --email yan.pashhenko6486@gmail.com"
```

### 2. Собрать и загрузить Frontend
```bash
# Локально на вашем компьютере
cd frontend
npm install
npm run build

# Загрузить на сервер
scp -r dist/* root@195.58.34.47:/opt/law-ai-agent/frontend/dist/
```

### 3. Проверить работу
```bash
# После настройки DNS
curl https://laxlylaw.ru/api/v1/auth/register
curl https://laxlylaw.ru/docs  # Swagger UI
```

## 🔧 Управление сервером

### Проверить статус сервисов
```bash
ssh root@195.58.34.47 "supervisorctl status && nginx -t"
```

### Перезапустить backend
```bash
ssh root@195.58.34.47 "supervisorctl restart lawai-backend"
```

### Посмотреть логи backend
```bash
ssh root@195.58.34.47 "tail -f /opt/law-ai-agent/logs/backend.log"
```

### Посмотреть логи Nginx
```bash
ssh root@195.58.34.47 "tail -f /var/log/nginx/laxlylaw_error.log"
```

## 📁 Структура на сервере

```
/opt/law-ai-agent/
├── backend/
│   ├── app/              # Код приложения
│   ├── venv/             # Python виртуальное окружение
│   ├── .env              # Конфигурация
│   ├── requirements.txt
│   └── uploads/          # Загруженные файлы
├── frontend/
│   └── dist/             # Собранный React (пока пусто)
├── logs/
│   ├── backend.log
│   └── backend_error.log
└── prompts/              # Промпты для AI
    ├── document-generator/
    └── contract-reviewer/
```

## 🔐 Безопасность

### Что нужно сделать:
1. ❌ Сменить root пароль
2. ❌ Настроить firewall (ufw)
3. ❌ Отключить вход по паролю (только SSH ключи)
4. ❌ Настроить автоматическое обновление
5. ❌ Регулярные бэкапы базы данных

### Команды для базовой защиты:
```bash
# Включить firewall
ssh root@195.58.34.47 "ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable"

# Бэкап базы данных
ssh root@195.58.34.47 "cp /opt/law-ai-agent/backend/law_ai_agent.db /opt/law-ai-agent/backend/law_ai_agent.db.backup.$(date +%Y%m%d)"
```

## 🆘 Troubleshooting

### Backend не запускается
```bash
ssh root@195.58.34.47 "tail -100 /opt/law-ai-agent/logs/backend_error.log"
```

### Nginx не работает
```bash
ssh root@195.58.34.47 "nginx -t && systemctl restart nginx"
```

### SSL сертификат не получен
```bash
# Проверьте что DNS настроен
ssh root@195.58.34.47 "dig laxlylaw.ru +short"
# Должно вернуть: 195.58.34.47
```

### Перезапустить всё
```bash
ssh root@195.58.34.47 "supervisorctl restart all && systemctl restart nginx"
```

## 📊 Мониторинг ресурсов

Сервер имеет:
- CPU: 1 ядро 3.3 GHz
- RAM: 1 GB
- Disk: 15 GB NVMe (свободно ~11 GB)

Для отслеживания:
```bash
ssh root@195.58.34.47 "htop"  # или free -h, df -h
```

## 🎯 Следующие шаги

1. ✅ Настроить DNS для laxlylaw.ru
2. ✅ Получить SSL сертификат  
3. ✅ Собрать и загрузить frontend
4. ⏳ Протестировать все функции через домен
5. ⏳ Настроить бэкапы
6. ⏳ Настроить мониторинг
