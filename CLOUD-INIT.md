# 🚀 Быстрый деплой через Cloud-init (Timeweb Cloud)

## Что это?

Cloud-init автоматически настроит сервер при создании - установит Docker, Nginx, настроит firewall и всё необходимое!

## 📋 Пошаговая инструкция

### Шаг 1: Подготовка проекта

**Вариант A: Загрузить в GitHub (Рекомендуется)**

На вашем компьютере:

```bash
cd /Users/alexstepygin/roomai-redesign

# Инициализация Git
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и загрузите
git remote add origin https://github.com/ваш-username/roomai-redesign.git
git push -u origin main
```

Затем отредактируйте `cloud-init.yml`, строка ~40:
```yaml
- git clone https://github.com/ваш-username/roomai-redesign.git /opt/roomai
```

**Вариант B: Загрузить в облако (Dropbox, Google Drive и т.д.)**

1. Заархивируйте проект:
```bash
cd /Users/alexstepygin
zip -r roomai-redesign.zip roomai-redesign/
```

2. Загрузите на файлообменник и получите прямую ссылку

3. Отредактируйте `cloud-init.yml`, строка ~43:
```yaml
- wget https://ваша-ссылка.com/roomai-redesign.zip -O /tmp/roomai.zip
- unzip /tmp/roomai.zip -d /opt/roomai
```

### Шаг 2: Подготовка Cloud-init скрипта

1. Откройте файл `cloud-init.yml`

2. **ОБЯЗАТЕЛЬНО** замените:
   - Строка ~50: `REPLICATE_API_TOKEN=ваш_токен`
   - Строка ~51: `NEXTAUTH_SECRET=ваш_секрет`
   - Строка ~52: `NEXTAUTH_URL=http://ваш-ip`

Как получить токены:

**REPLICATE_API_TOKEN:**
1. Зарегистрируйтесь на [replicate.com](https://replicate.com)
2. Перейдите в [API Tokens](https://replicate.com/account/api-tokens)
3. Создайте токен и скопируйте

**NEXTAUTH_SECRET:**
Сгенерируйте на вашем Mac:
```bash
openssl rand -base64 32
```

3. **Если используете Git**, раскомментируйте строки:
```yaml
# Строка ~40
- git clone https://github.com/username/roomai-redesign.git /opt/roomai

# Строки ~60-62
- cd /opt/roomai
- docker-compose build
- docker-compose up -d
```

### Шаг 3: Создание сервера на Timeweb Cloud

1. Зайдите в панель [Timeweb Cloud](https://timeweb.cloud/)

2. Нажмите **"Создать сервер"**

3. Выберите конфигурацию:
   - **ОС**: Ubuntu 22.04 LTS
   - **Тариф**: Минимум 2GB RAM, 2 vCPU
   - **Регион**: Ближайший к вам

4. В разделе **"7. Cloud-init"**:
   - Откройте файл `cloud-init.yml`
   - Скопируйте ВСЁ содержимое
   - Вставьте в поле на Timeweb

5. Нажмите **"Создать сервер"**

6. Дождитесь создания (3-5 минут)

### Шаг 4: Подключение к серверу

После создания сервера:

```bash
ssh root@ВАШ_IP_АДРЕС
```

Проверьте статус установки:

```bash
# Проверка Docker
docker --version

# Проверка проекта
ls -la /opt/roomai

# Проверка логов cloud-init
tail -f /var/log/cloud-init-output.log
```

### Шаг 5: Завершение установки

Если вы НЕ использовали автозапуск в cloud-init:

```bash
cd /opt/roomai

# Проверьте .env файл
nano .env

# Запустите контейнеры
docker-compose build
docker-compose up -d

# Проверьте статус
docker-compose ps
docker-compose logs -f
```

### Шаг 6: Проверка работы

Откройте в браузере:
```
http://ВАШ_IP_АДРЕС
```

Вы должны увидеть главную страницу RoomAI! 🎉

### Шаг 7: Настройка домена (опционально)

Если у вас есть домен:

1. Добавьте A-запись в DNS:
   - Имя: `@`
   - Значение: IP вашего сервера

2. Настройте SSL на сервере:
```bash
# Замените your-domain.com на ваш домен
certbot --nginx -d your-domain.com -d www.your-domain.com
```

3. Обновите `.env`:
```bash
nano /opt/roomai/.env
# Измените NEXTAUTH_URL на https://your-domain.com

# Перезапустите
cd /opt/roomai
docker-compose restart
```

## 🔧 Полезные команды

```bash
# Просмотр логов
docker-compose logs -f

# Перезапуск
docker-compose restart

# Остановка
docker-compose down

# Обновление проекта (если используете Git)
cd /opt/roomai
git pull
docker-compose build
docker-compose up -d
```

## ❗ Troubleshooting

### Проект не запускается

```bash
# Проверьте логи cloud-init
cat /var/log/cloud-init-output.log

# Проверьте статус Docker
systemctl status docker

# Проверьте контейнеры
docker-compose ps
docker-compose logs
```

### Не работает генерация изображений

1. Проверьте API токен:
```bash
cat /opt/roomai/.env | grep REPLICATE
```

2. Проверьте баланс на [replicate.com/account](https://replicate.com/account)

3. Проверьте логи:
```bash
docker-compose logs -f
```

### Nginx не работает

```bash
# Проверьте конфигурацию
nginx -t

# Перезапустите
systemctl restart nginx

# Проверьте статус
systemctl status nginx
```

## 📝 Что делает Cloud-init скрипт?

✅ Обновляет систему  
✅ Устанавливает Docker и Docker Compose  
✅ Устанавливает Nginx  
✅ Создает пользователя `deploy`  
✅ Клонирует проект (если настроено)  
✅ Создает `.env` файл  
✅ Настраивает Nginx reverse proxy  
✅ Настраивает firewall  
✅ Запускает контейнеры (если настроено)  

## 💰 Стоимость

- **Timeweb Cloud VPS** (2GB): ~300₽/мес
- **Replicate API**: $0.01-0.02 за генерацию
- **Домен**: ~200₽/год (опционально)

## ⚡ Время установки

- Создание сервера: 3-5 минут
- Cloud-init установка: 5-7 минут
- Настройка проекта: 2-3 минуты

**Итого: ~15 минут до полностью рабочего приложения!**

---

Нужна помощь? Проверьте логи: `tail -f /var/log/cloud-init-output.log`

