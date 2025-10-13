#!/bin/bash

# RoomAI - Установка на сервер (выполнять на сервере!)

set -e

echo "📥 Клонирование проекта с GitHub..."
cd /opt/roomai

# Клонирование репозитория
git clone https://github.com/Sansayich/-roomai-redesign.git .

echo ""
echo "✅ Проект клонирован!"
echo ""

# Создание .env файла
echo "📝 Создание .env файла..."
cat > .env << 'EOF'
# REPLICATE API TOKEN - ЗАМЕНИТЕ НА СВОЙ!
REPLICATE_API_TOKEN=r8_ваш_токен_здесь

# NEXTAUTH SECRET - сгенерирован автоматически
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# URL сервера - ЗАМЕНИТЕ НА ВАШ IP!
NEXTAUTH_URL=http://ваш-ip-адрес

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOF

echo ""
echo "⚠️  ВАЖНО! Отредактируйте .env файл:"
echo ""
echo "nano /opt/roomai/.env"
echo ""
echo "Замените:"
echo "1. REPLICATE_API_TOKEN - получите на https://replicate.com/account/api-tokens"
echo "2. NEXTAUTH_URL - укажите IP вашего сервера"
echo ""
echo "После редактирования нажмите: Ctrl+X, затем Y, затем Enter"
echo ""
read -p "Нажмите Enter после редактирования .env..."

# Настройка Nginx
echo ""
echo "🌐 Настройка Nginx..."
cat > /etc/nginx/sites-available/roomai << 'NGINX_EOF'
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
NGINX_EOF

ln -sf /etc/nginx/sites-available/roomai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo "✅ Nginx настроен!"
echo ""

# Настройка firewall
echo "🔥 Настройка firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable

echo ""
echo "🐳 Сборка и запуск Docker контейнера..."
cd /opt/roomai
docker-compose build
docker-compose up -d

echo ""
echo "======================================"
echo "✅ Установка завершена!"
echo "======================================"
echo ""
echo "📊 Проверка статуса:"
docker-compose ps
echo ""
echo "🌐 Приложение доступно на:"
echo "   http://$(curl -s ifconfig.me)"
echo ""
echo "📝 Просмотр логов:"
echo "   docker-compose logs -f"
echo ""

