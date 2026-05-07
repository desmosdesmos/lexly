#!/bin/bash
# Скрипт настройки SSL сертификата (запускать ПОСЛЕ настройки DNS)

set -e

echo "🔐 Настраиваем SSL сертификат для laxlylaw.ru..."

# Проверяем что DNS настроен
echo "📡 Проверяем DNS..."
IP=$(dig +short laxlylaw.ru | head -1)
if [ "$IP" != "195.58.34.47" ]; then
  echo "❌ DNS ещё не настроен! Текущий IP: $IP"
  echo "Добавьте A-запись: laxlylaw.ru → 195.58.34.47"
  exit 1
fi

echo "✅ DNS настроен правильно: $IP"

# Получаем SSL сертификат
echo "📜 Получаем SSL сертификат..."
certbot --nginx -d laxlylaw.ru -d www.laxlylaw.ru \
  --non-interactive \
  --agree-tos \
  --email yan.pashhenko6486@gmail.com \
  --redirect \
  --hsts \
  --staple-ocsp

echo "✅ SSL сертификат установлен!"
echo "Теперь сайт доступен по: https://laxlylaw.ru"
echo ""
echo "🔄 Автообновление сертификтов настроено автоматически"
echo "Следующее обновление: certbot renew"
