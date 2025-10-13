#!/bin/bash

echo "🔍 Проверка состояния сервера RoomAI"
echo "====================================="
echo ""

# Проверка Docker
echo "1️⃣  Docker:"
docker --version 2>/dev/null && echo "✅ Установлен" || echo "❌ Не установлен"
echo ""

# Проверка Docker Compose
echo "2️⃣  Docker Compose:"
docker-compose --version 2>/dev/null && echo "✅ Установлен" || echo "❌ Не установлен"
echo ""

# Проверка Nginx
echo "3️⃣  Nginx:"
nginx -v 2>&1 | head -1
systemctl is-active nginx >/dev/null 2>&1 && echo "✅ Запущен" || echo "❌ Не запущен"
echo ""

# Проверка директории проекта
echo "4️⃣  Директория проекта:"
if [ -d "/opt/roomai" ]; then
    echo "✅ Существует: /opt/roomai"
    ls -la /opt/roomai | head -10
else
    echo "❌ Не найдена: /opt/roomai"
fi
echo ""

# Проверка .env файла
echo "5️⃣  Файл .env:"
if [ -f "/opt/roomai/.env" ]; then
    echo "✅ Существует"
    echo "Содержимое (без секретов):"
    cat /opt/roomai/.env | sed 's/=.*/=***/' 
else
    echo "❌ Не найден"
fi
echo ""

# Проверка контейнеров
echo "6️⃣  Docker контейнеры:"
docker ps -a 2>/dev/null | grep roomai || echo "Нет контейнеров RoomAI"
echo ""

# Проверка логов cloud-init
echo "7️⃣  Статус cloud-init:"
if [ -f "/var/log/cloud-init-output.log" ]; then
    echo "Последние строки лога:"
    tail -20 /var/log/cloud-init-output.log
else
    echo "❌ Лог не найден"
fi
echo ""

echo "====================================="
echo "Проверка завершена!"


