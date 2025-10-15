# 🚧 Инструкция по настройке Staging окружения

## Обзор
Staging окружение разворачивается на том же сервере, что и production, но использует:
- Отдельный поддомен: `staging.room-gpt.ru`
- Отдельную базу данных PostgreSQL
- Отдельные Docker контейнеры на других портах
- Защиту от индексации поисковиками

---

## 1️⃣ Настройка DNS

Добавьте A-запись в настройках вашего домена:
```
A  staging  <IP вашего сервера>
```

Проверьте, что запись создана:
```bash
nslookup staging.room-gpt.ru
```

---

## 2️⃣ Настройка на сервере

### Шаг 1: Подключитесь к серверу
```bash
ssh root@<IP сервера>
```

### Шаг 2: Перейдите в директорию проекта и получите изменения
```bash
cd /root/roomai-redesign  # или ваш путь к проекту
git pull origin main
```

### Шаг 3: Создайте ветку staging (опционально)
```bash
git checkout -b staging
git push -u origin staging
```

### Шаг 4: Настройте Nginx для staging
```bash
# Скопируйте конфиг
cp nginx-staging.conf /etc/nginx/sites-available/staging.room-gpt.ru

# Создайте символическую ссылку
ln -s /etc/nginx/sites-available/staging.room-gpt.ru /etc/nginx/sites-enabled/

# Проверьте конфигурацию
nginx -t
```

### Шаг 5: Получите SSL сертификат
```bash
certbot --nginx -d staging.room-gpt.ru
```

### Шаг 6: Перезапустите Nginx
```bash
systemctl reload nginx
```

---

## 3️⃣ Настройка переменных окружения

Создайте файл `.env.staging` в корне проекта:
```bash
nano .env.staging
```

Добавьте необходимые переменные (пример):
```env
# Database
DATABASE_URL=postgresql://postgres:your_password@postgres-staging:5432/roomgpt_staging

# NextAuth
NEXTAUTH_URL=https://staging.room-gpt.ru
NEXTAUTH_SECRET=your_different_secret_key_for_staging

# OAuth (можно использовать отдельные тестовые приложения)
GOOGLE_CLIENT_ID=your_staging_google_client_id
GOOGLE_CLIENT_SECRET=your_staging_google_client_secret

# API Keys
REPLICATE_API_KEY=your_replicate_api_key

# Environment
NODE_ENV=staging
```

**Важно:** используйте отдельные OAuth приложения для staging, добавив в настройках разрешённый redirect URL:
- `https://staging.room-gpt.ru/api/auth/callback/google`

---

## 4️⃣ Запуск Staging окружения

### Шаг 1: Дайте права на выполнение скрипта деплоя
```bash
chmod +x deploy-staging.sh
```

### Шаг 2: Запустите staging окружение
```bash
./deploy-staging.sh
```

Скрипт автоматически:
- Остановит старые контейнеры staging
- Подтянет последние изменения из Git
- Соберёт новые Docker образы
- Запустит контейнеры staging

### Шаг 3: Проверьте статус контейнеров
```bash
docker-compose -f docker-compose.staging.yml ps
```

Должны быть запущены:
- `roomgpt-staging` (Next.js приложение на порту 3001)
- `postgres-staging` (PostgreSQL на порту 5433)

### Шаг 4: Проверьте логи
```bash
# Логи приложения
docker-compose -f docker-compose.staging.yml logs -f app

# Логи базы данных
docker-compose -f docker-compose.staging.yml logs -f db
```

---

## 5️⃣ Проверка работы

### Откройте в браузере
```
https://staging.room-gpt.ru
```

Вы должны увидеть:
- ✅ Баннер вверху страницы: "🚧 ТЕСТОВАЯ ВЕРСИЯ"
- ✅ В title браузера: "🚧 STAGING - RoomGPT"

### Проверьте защиту от индексации
Откройте исходный код страницы (Ctrl+U) и найдите:
```html
<meta name="robots" content="noindex, nofollow">
```

---

## 6️⃣ Обновление Staging

Для обновления staging окружения просто запустите:
```bash
./deploy-staging.sh
```

Или вручную:
```bash
git pull origin staging
docker-compose -f docker-compose.staging.yml down
docker-compose -f docker-compose.staging.yml build --no-cache
docker-compose -f docker-compose.staging.yml up -d
```

---

## 7️⃣ Полезные команды

### Остановить staging
```bash
docker-compose -f docker-compose.staging.yml down
```

### Перезапустить staging
```bash
docker-compose -f docker-compose.staging.yml restart
```

### Посмотреть логи
```bash
docker-compose -f docker-compose.staging.yml logs -f
```

### Выполнить команду в контейнере
```bash
docker-compose -f docker-compose.staging.yml exec app sh
```

### Очистить volumes (если нужно сбросить БД)
```bash
docker-compose -f docker-compose.staging.yml down -v
```

---

## 8️⃣ Troubleshooting

### Проблема: "502 Bad Gateway"
**Решение:** Проверьте, что контейнер app запущен:
```bash
docker-compose -f docker-compose.staging.yml ps
docker-compose -f docker-compose.staging.yml logs app
```

### Проблема: "Cannot connect to database"
**Решение:** Проверьте переменную DATABASE_URL в .env.staging:
```bash
docker-compose -f docker-compose.staging.yml exec app env | grep DATABASE_URL
```

### Проблема: SSL сертификат не работает
**Решение:** Перезапустите certbot:
```bash
certbot renew --nginx
systemctl reload nginx
```

### Проблема: Страница индексируется Google
**Решение:** Проверьте, что установлена переменная NODE_ENV=staging или NEXTAUTH_URL содержит "staging"

---

## 9️⃣ Архитектура

```
┌─────────────────────────────────────────┐
│           Nginx (порт 80/443)           │
│  staging.room-gpt.ru → localhost:3001   │
│  room-gpt.ru → localhost:3000           │
└─────────────────────────────────────────┘
                  ↓
┌──────────────────────┬──────────────────────┐
│  Production          │  Staging             │
│  localhost:3000      │  localhost:3001      │
│  ↓                   │  ↓                   │
│  PostgreSQL:5432     │  PostgreSQL:5433     │
│  (roomgpt)           │  (roomgpt_staging)   │
└──────────────────────┴──────────────────────┘
```

---

## 🎯 Итоговый чеклист

- [ ] DNS A-запись создана для staging.room-gpt.ru
- [ ] Nginx конфигурация скопирована и активирована
- [ ] SSL сертификат получен через certbot
- [ ] Файл .env.staging создан с корректными переменными
- [ ] OAuth приложения настроены для staging URL
- [ ] Docker контейнеры staging запущены
- [ ] Staging сайт доступен по https://staging.room-gpt.ru
- [ ] Баннер "ТЕСТОВАЯ ВЕРСИЯ" отображается
- [ ] Meta tag robots="noindex,nofollow" присутствует
- [ ] Отдельная БД staging работает

---

**Готово!** 🎉 Ваше staging окружение настроено и готово к тестированию.

