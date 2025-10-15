# Инструкция по деплою обновлений на сервер

## Быстрый деплой

Подключитесь к серверу и выполните:

```bash
ssh root@212.193.26.21

cd /opt/roomai

# Получить последние изменения
git pull origin main

# Пересобрать и перезапустить Docker контейнер
docker-compose build
docker-compose up -d

# Проверить логи
docker-compose logs -f
```

## Что было добавлено в этом обновлении

### 1. Улучшенная страница входа (`/auth/signin`)
- ✨ Красивый градиентный фон
- 🎁 Badge о количестве пользователей
- 💎 Информация о 3 бесплатных кредитах
- ✅ Преимущества (без VPN, российские карты, русский язык)

### 2. Юридические документы
- 📄 Публичная оферта (`/terms`)
- 🔒 Политика конфиденциальности (`/privacy`)
- 💰 Политика возврата средств (`/refund`)
- Ссылки добавлены во все футеры

### 3. SEO оптимизация
- 🎯 Title: "RoomGPT на русском - нейросеть для дизайна интерьера без VPN с оплатой российскими картами"
- 📝 Полное description с ключевыми словами
- 🔑 Keywords включают всю семантику (roomgpt, дизайн интерьера, нейросеть и т.д.)
- 🌐 Open Graph для соцсетей
- 🐦 Twitter Cards
- 📊 JSON-LD Structured Data (Schema.org)
- 🤖 robots.txt
- 🗺️ sitemap.xml
- 📱 SEO-блок с текстом на главной

### 4. Дополнительные файлы
- `SEO-SETUP.md` - инструкция по дополнительной SEO настройке
- `public/robots.txt` - правила для поисковых роботов
- `public/sitemap.xml` - карта сайта

## После деплоя проверьте

1. **Главная страница**: https://room-gpt.ru
   - Проверьте новый SEO-блок внизу
   - Ссылки на юридические документы в футере

2. **Страница входа**: https://room-gpt.ru/auth/signin
   - Должна быть красивая с градиентом
   - Информация о 3 бесплатных кредитах

3. **Юридические документы**:
   - https://room-gpt.ru/terms
   - https://room-gpt.ru/privacy
   - https://room-gpt.ru/refund

4. **SEO файлы**:
   - https://room-gpt.ru/robots.txt
   - https://room-gpt.ru/sitemap.xml

5. **Meta-теги**:
   - Просмотрите источник страницы (Ctrl+U)
   - Проверьте title, description, Open Graph

## Следующие шаги

1. **Создайте Open Graph изображение**
   - Размер: 1200x630px
   - Сохраните как `/opt/roomai/public/og-image.jpg`
   - Перезапустите контейнер

2. **Настройте Яндекс Вебмастер** (см. SEO-SETUP.md)
   - Добавьте сайт
   - Получите код подтверждения
   - Обновите `app/layout.tsx`
   - Загрузите sitemap.xml

3. **Настройте Google Search Console** (см. SEO-SETUP.md)
   - Добавьте сайт
   - Получите код подтверждения
   - Обновите `app/layout.tsx`

4. **Установите счетчики**
   - Яндекс Метрика
   - Google Analytics

## Проверка производительности

```bash
# Проверьте статус контейнера
docker-compose ps

# Проверьте использование ресурсов
docker stats roomai-app

# Проверьте логи на ошибки
docker-compose logs --tail=100 | grep -i error
```

## Откат изменений (если что-то пошло не так)

```bash
cd /opt/roomai
git log --oneline  # Найдите предыдущий коммит
git reset --hard <commit-hash>
docker-compose build
docker-compose up -d
```

## Полезные команды

```bash
# Остановить контейнер
docker-compose down

# Запустить без пересборки
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Очистить старые образы
docker system prune -a
```

