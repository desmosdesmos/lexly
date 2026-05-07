#!/bin/bash
# Скрипт настройки VPS для Law AI Agent
# Запускать от root: bash setup_server.sh

set -e

echo "🚀 Начинаем настройку сервера для Law AI Agent..."

# 1. Обновляем систему
echo "📦 Обновляем систему..."
apt update && apt upgrade -y

# 2. Устанавливаем базовые зависимости
echo "📦 Устанавливаем зависимости..."
apt install -y \
  python3 python3-pip python3-venv \
  nodejs npm \
  nginx \
  certbot python3-certbot-nginx \
  git curl wget \
  sqlite3 \
  build-essential \
  supervisor

# 3. Устанавливаем pm2 для Node.js
echo "📦 Устанавливаем PM2..."
npm install -g pm2

# 4. Создаём директорию приложения
echo "📁 Создаём директории..."
mkdir -p /opt/law-ai-agent/{backend,frontend,logs}
mkdir -p /opt/law-ai-agent/backend/uploads

# 5. Создаём пользователя для приложения
echo "👤 Создаём пользователя..."
useradd -r -s /bin/false -d /opt/law-ai-agent lawai 2>/dev/null || true

# 6. Создаём директории для логов
echo "📝 Создаём логи..."
touch /opt/law-ai-agent/logs/backend.log
touch /opt/law-ai-agent/logs/frontend.log
touch /opt/law-ai-agent/logs/error.log

echo "✅ Базовая настройка завершена!"
echo "Теперь загрузите файлы приложения через scp или git"
