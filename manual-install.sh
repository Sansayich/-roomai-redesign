#!/bin/bash

# RoomAI - Ручная установка на сервер
# Выполняйте команды по порядку на вашем сервере

set -e

echo "🚀 Начинаем установку RoomAI"
echo "=============================="
echo ""

# ===== ШАГ 1: Обновление системы =====
echo "1️⃣  Обновление системы..."
apt-get update
apt-get upgrade -y

# ===== ШАГ 2: Установка Docker =====
echo ""
echo "2️⃣  Установка Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Проверка
docker --version

# ===== ШАГ 3: Установка Docker Compose =====
echo ""
echo "3️⃣  Установка Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Проверка
docker-compose --version

# ===== ШАГ 4: Установка Nginx =====
echo ""
echo "4️⃣  Установка Nginx..."
apt-get install -y nginx certbot python3-certbot-nginx

# ===== ШАГ 5: Создание директории проекта =====
echo ""
echo "5️⃣  Создание директории проекта..."
mkdir -p /opt/roomai
cd /opt/roomai

echo ""
echo "✅ Базовая установка завершена!"
echo ""
echo "=============================="
echo "СЛЕДУЮЩИЕ ШАГИ:"
echo "=============================="
echo ""
echo "Теперь нужно загрузить проект на сервер."
echo "У вас есть 2 варианта:"
echo ""
echo "ВАРИАНТ А: Через Git (рекомендуется)"
echo "  1. Создайте репозиторий на GitHub"
echo "  2. Загрузите код с вашего Mac"
echo "  3. Клонируйте на сервер"
echo ""
echo "ВАРИАНТ Б: Прямая загрузка через SCP"
echo "  Выполните на вашем Mac:"
echo "  scp -r /Users/alexstepygin/roomai-redesign/* root@$(curl -s ifconfig.me):/opt/roomai/"
echo ""
echo "Выберите вариант и продолжим!"


