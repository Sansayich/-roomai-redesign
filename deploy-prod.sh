#!/bin/bash

echo "🚀 Deploying to PRODUCTION server"
echo "=================================="

ssh root@room-gpt.ru << 'EOF'
cd /opt/roomai

echo "📥 Pulling latest changes..."
git pull origin main

echo "🛑 Stopping production containers..."
docker-compose down

echo "🔨 Building new production image..."
docker-compose build --no-cache

echo "▶️ Starting production containers..."
docker-compose up -d

echo "📊 Production container status:"
docker-compose ps

echo "✅ Production deployment completed!"
echo "🌐 Production URL: https://room-gpt.ru"
EOF

echo "🎉 Production deployment completed!"
