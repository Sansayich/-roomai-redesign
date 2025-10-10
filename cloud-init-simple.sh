#!/bin/bash

# RoomAI - Простой установочный скрипт для Cloud-init
# Вставьте этот скрипт в поле Cloud-init на Timeweb

set -e

echo "=== RoomAI Auto Installation ==="

# Обновление системы
apt-get update
apt-get upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
systemctl enable docker
systemctl start docker

# Установка Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Установка дополнительных пакетов
apt-get install -y git nginx certbot python3-certbot-nginx

# Создание директории проекта
mkdir -p /opt/roomai
cd /opt/roomai

# ВАРИАНТ 1: Клонирование из Git (раскомментируйте и измените URL)
# git clone https://github.com/ваш-username/roomai-redesign.git .

# ВАРИАНТ 2: Создание базовых файлов вручную
# После создания сервера загрузите файлы через SCP

# Создание .env файла
cat > /opt/roomai/.env << 'EOF'
# ВАЖНО: Замените эти значения!
REPLICATE_API_TOKEN=ваш_токен_с_replicate.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://$(curl -s ifconfig.me)
EOF

# Настройка Nginx
cat > /etc/nginx/sites-available/roomai << 'EOF'
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    client_max_body_size 10M;
}
EOF

ln -sf /etc/nginx/sites-available/roomai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# Настройка firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo "=== Установка завершена! ==="
echo "IP: $(curl -s ifconfig.me)"
echo ""
echo "Следующие шаги:"
echo "1. Подключитесь: ssh root@$(curl -s ifconfig.me)"
echo "2. Загрузите проект в /opt/roomai"
echo "3. Отредактируйте /opt/roomai/.env"
echo "4. Запустите: cd /opt/roomai && docker-compose up -d"

