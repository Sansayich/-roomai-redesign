#!/bin/bash

# Скрипт для быстрого деплоя на сервер
# Использование: ./deploy.sh

echo "🚀 RoomAI Deployment Script"
echo "============================"
echo ""

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "⚠️  Файл .env не найден!"
    echo "Копирую .env.production в .env..."
    cp .env.production .env
    echo ""
    echo "📝 Отредактируйте файл .env и добавьте необходимые токены:"
    echo "   - REPLICATE_API_TOKEN"
    echo "   - NEXTAUTH_SECRET"
    echo ""
    read -p "Нажмите Enter после редактирования .env..."
fi

# Остановка старых контейнеров
echo "🛑 Остановка старых контейнеров..."
docker-compose down

# Сборка образа
echo "🔨 Сборка Docker образа..."
docker-compose build --no-cache

# Запуск контейнера
echo "▶️  Запуск контейнера..."
docker-compose up -d

# Проверка статуса
echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📊 Статус контейнеров:"
docker-compose ps

echo ""
echo "📝 Просмотр логов:"
echo "   docker-compose logs -f"
echo ""
echo "🌐 Приложение доступно на: http://localhost:3000"
echo ""

