#!/bin/bash
# Скрипт деплоя Frontend на сервер
# Использование: bash deploy/deploy_frontend.sh

set -e

SERVER="root@195.58.34.47"
REMOTE_DIR="/opt/law-ai-agent/frontend/dist"

echo "🚀 Деплой Frontend на $SERVER..."

# 1. Сборка
echo "📦 Сборка..."
cd "$(dirname "$0")/../frontend"
npm run build

# 2. Загрузка файлов
echo "📤 Загрузка файлов..."
scp -r dist/* $SERVER:$REMOTE_DIR/

# 3. Исправление прав и перезапуск Nginx
echo "🔧 Исправление прав и перезапуск Nginx..."
ssh $SERVER "chmod -R 755 $REMOTE_DIR && pkill nginx 2>/dev/null; sleep 1; nginx && echo '✅ Nginx перезапущен'"

echo "✅ Деплой завершён!"
echo "🌐 Сайт: https://laxlylaw.ru"
