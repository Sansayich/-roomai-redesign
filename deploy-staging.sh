#!/bin/bash

echo "🚀 Deploying to STAGING..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переходим в директорию проекта
cd /opt/roomai || exit

echo -e "${YELLOW}📦 Pulling latest code from main branch...${NC}"
git fetch origin
git pull origin main

echo -e "${YELLOW}🛑 Stopping staging containers...${NC}"
docker-compose -f docker-compose.staging.yml down -v

echo -e "${YELLOW}🧹 Cleaning up old images and volumes...${NC}"
docker rmi roomai-roomai-staging 2>/dev/null || true
docker volume rm roomai_postgres_data_staging 2>/dev/null || true
docker system prune -f

echo -e "${YELLOW}🔨 Building staging images with clean cache...${NC}"
docker-compose -f docker-compose.staging.yml build --no-cache --pull

echo -e "${YELLOW}🚀 Starting staging containers...${NC}"
docker-compose -f docker-compose.staging.yml up -d

echo -e "${YELLOW}⏳ Waiting for containers to start...${NC}"
sleep 5

echo -e "${YELLOW}🔄 Running database migrations...${NC}"
# Ждем пока контейнер полностью запустится
sleep 10
docker exec roomai-app-staging sh -c "./node_modules/.bin/prisma db push" || {
    echo -e "${YELLOW}⚠️  Prisma CLI not found, trying alternative...${NC}"
    docker exec roomai-app-staging sh -c "npm run prisma:push"
}

echo -e "${GREEN}✅ Staging deployment complete!${NC}"
echo -e "${GREEN}🌐 Staging URL: https://staging.room-gpt.ru${NC}"

echo -e "${YELLOW}📋 Checking logs...${NC}"
docker-compose -f docker-compose.staging.yml logs --tail=20 roomai-staging

