# 🚀 Инструкция по деплою на Timeweb Cloud

## Подготовка проекта

Проект готов к деплою! Все необходимые файлы созданы:
- ✅ `Dockerfile` - Конфигурация Docker
- ✅ `.dockerignore` - Исключения для Docker
- ✅ `docker-compose.yml` - Оркестрация контейнеров
- ✅ `.env.production` - Шаблон переменных окружения

## Шаг 1: Создание сервера на Timeweb Cloud

1. Зайдите в [Timeweb Cloud](https://timeweb.cloud/)
2. Создайте новый **Cloud сервер**:
   - **Конфигурация**: Ubuntu 22.04 LTS
   - **Ресурсы**: Минимум 2 GB RAM, 2 vCPU, 20 GB диск
   - **Регион**: Выберите ближайший

3. Дождитесь создания сервера и получите:
   - IP адрес
   - Root пароль (или SSH ключ)

## Шаг 2: Подключение к серверу

```bash
ssh root@ВАШ_IP_АДРЕС
```

## Шаг 3: Установка Docker на сервере

```bash
# Обновление пакетов
apt update && apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose -y

# Проверка установки
docker --version
docker-compose --version
```

## Шаг 4: Подготовка проекта

### Вариант A: Загрузка через Git (Рекомендуется)

1. **На вашем компьютере**, создайте Git репозиторий:

```bash
cd /Users/alexstepygin/roomai-redesign
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и загрузите код
git remote add origin https://github.com/ваш-username/roomai-redesign.git
git push -u origin main
```

2. **На сервере**, клонируйте репозиторий:

```bash
cd /root
git clone https://github.com/ваш-username/roomai-redesign.git
cd roomai-redesign
```

### Вариант B: Загрузка через SFTP/SCP

```bash
# На вашем компьютере
cd /Users/alexstepygin
scp -r roomai-redesign root@ВАШ_IP:/root/
```

## Шаг 5: Настройка переменных окружения

На сервере создайте файл `.env`:

```bash
cd /root/roomai-redesign
nano .env
```

Вставьте и настройте:

```env
# Replicate API Token
REPLICATE_API_TOKEN=r8_ваш_токен_здесь

# NextAuth Secret (сгенерируйте новый)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# URL вашего домена
NEXTAUTH_URL=https://ваш-домен.ru

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Сохраните: `Ctrl+X`, `Y`, `Enter`

### Генерация NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### Получение REPLICATE_API_TOKEN:

1. Зарегистрируйтесь на [replicate.com](https://replicate.com)
2. Перейдите в [API Tokens](https://replicate.com/account/api-tokens)
3. Создайте новый токен
4. Скопируйте в `.env`

## Шаг 6: Сборка и запуск Docker контейнера

```bash
# Сборка образа
docker-compose build

# Запуск контейнера
docker-compose up -d

# Проверка статуса
docker-compose ps
docker-compose logs -f
```

## Шаг 7: Настройка Nginx (реверс-прокси)

```bash
# Установка Nginx
apt install nginx -y

# Создание конфигурации
nano /etc/nginx/sites-available/roomai
```

Вставьте конфигурацию:

```nginx
server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

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
```

Активируйте конфигурацию:

```bash
ln -s /etc/nginx/sites-available/roomai /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Шаг 8: Настройка SSL (HTTPS)

```bash
# Установка Certbot
apt install certbot python3-certbot-nginx -y

# Получение SSL сертификата
certbot --nginx -d ваш-домен.ru -d www.ваш-домен.ru

# Автоматическое обновление
certbot renew --dry-run
```

## Шаг 9: Настройка домена

В панели управления доменом (например, на Timeweb):

1. Добавьте **A-запись**:
   - Имя: `@`
   - Тип: `A`
   - Значение: `IP_ВАШЕГО_СЕРВЕРА`

2. Добавьте **A-запись** для www:
   - Имя: `www`
   - Тип: `A`
   - Значение: `IP_ВАШЕГО_СЕРВЕРА`

Подождите 5-30 минут для обновления DNS.

## 🎉 Готово!

Ваше приложение доступно по адресу: `https://ваш-домен.ru`

## 📊 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск контейнера
docker-compose restart

# Остановка
docker-compose down

# Обновление после изменений
git pull
docker-compose build
docker-compose up -d

# Проверка использования ресурсов
docker stats
```

## 🔧 Troubleshooting

### Приложение не запускается

```bash
# Проверьте логи
docker-compose logs

# Проверьте, что порт 3000 свободен
netstat -tulpn | grep 3000
```

### Ошибка генерации изображений

- Проверьте, что `REPLICATE_API_TOKEN` правильно установлен в `.env`
- Убедитесь, что на счету Replicate есть средства
- Проверьте логи: `docker-compose logs -f`

### Nginx не работает

```bash
# Проверьте конфигурацию
nginx -t

# Перезапустите
systemctl restart nginx

# Проверьте статус
systemctl status nginx
```

### SSL не работает

```bash
# Убедитесь, что домен указывает на сервер
dig ваш-домен.ru

# Переустановите сертификат
certbot --nginx -d ваш-домен.ru --force-renewal
```

## 💰 Стоимость

**Timeweb Cloud:**
- VPS 2GB RAM: ~300₽/месяц
- Домен: ~200₽/год

**Replicate API:**
- ~$0.01-0.02 за генерацию
- $10 хватит на ~500-1000 генераций

## 🔐 Безопасность

```bash
# Создайте нового пользователя (вместо root)
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Настройте firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

## 📝 Бэкап

```bash
# Создание бэкапа
docker-compose down
tar -czf roomai-backup-$(date +%Y%m%d).tar.gz roomai-redesign/

# Восстановление
tar -xzf roomai-backup-20241010.tar.gz
cd roomai-redesign
docker-compose up -d
```

---

**Нужна помощь?** Проверьте логи: `docker-compose logs -f`

