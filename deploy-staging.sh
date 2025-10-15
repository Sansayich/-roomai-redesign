#!/bin/bash

echo "🚀 Deploying to STAGING..."

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Переходим в директорию проекта
cd /opt/roomai-staging || exit

echo -e "${YELLOW}📦 Pulling latest code from staging branch...${NC}"
git fetch origin
git checkout staging
git pull origin staging

echo -e "${YELLOW}🛑 Stopping staging containers...${NC}"
docker-compose -f docker-compose.staging.yml down

echo -e "${YELLOW}🔨 Building staging images...${NC}"
docker-compose -f docker-compose.staging.yml build --no-cache

echo -e "${YELLOW}🚀 Starting staging containers...${NC}"
docker-compose -f docker-compose.staging.yml up -d

echo -e "${YELLOW}⏳ Waiting for containers to start...${NC}"
sleep 5

echo -e "${YELLOW}🔄 Running database migrations...${NC}"
docker exec roomai-app-staging sh -c "npx prisma db push"

echo -e "${GREEN}✅ Staging deployment complete!${NC}"
echo -e "${GREEN}🌐 Staging URL: https://staging.room-gpt.ru${NC}"

echo -e "${YELLOW}📋 Checking logs...${NC}"
docker-compose -f docker-compose.staging.yml logs --tail=20 roomai-staging

