# Настройка SEO для room-gpt.ru

## ✅ Что уже сделано

### 1. Meta-теги и структура
- ✅ Title оптимизирован под главные ключевые слова
- ✅ Description с упоминанием всех важных функций
- ✅ Keywords включают всю семантику
- ✅ Open Graph для соцсетей (VK, Facebook)
- ✅ Twitter Cards для Twitter
- ✅ Robots meta для индексации

### 2. Structured Data (JSON-LD)
- ✅ Schema.org разметка WebApplication
- ✅ Информация о компании
- ✅ Рейтинги и отзывы
- ✅ Предложения и цены

### 3. Файлы для поисковиков
- ✅ robots.txt настроен
- ✅ sitemap.xml создан

### 4. Контент
- ✅ SEO-блок с ключевыми словами на главной
- ✅ H1, H2, H3 заголовки оптимизированы
- ✅ Alt-теги для изображений (нужно добавить картинки)

## 🔧 Что нужно сделать дополнительно

### 1. Яндекс Вебмастер
1. Зарегистрируйтесь на https://webmaster.yandex.ru
2. Добавьте сайт room-gpt.ru
3. Подтвердите права через HTML-файл или meta-тег
4. Получите код подтверждения и замените в `app/layout.tsx`:
   ```typescript
   verification: {
     yandex: 'your-yandex-verification-code', // <- Заменить здесь
   }
   ```
5. Загрузите sitemap.xml в Яндекс Вебмастер
6. Настройте регион: Россия

### 2. Google Search Console
1. Зарегистрируйтесь на https://search.google.com/search-console
2. Добавьте сайт room-gpt.ru
3. Подтвердите права через meta-тег
4. Получите код и замените в `app/layout.tsx`:
   ```typescript
   verification: {
     google: 'your-google-verification-code', // <- Заменить здесь
   }
   ```
5. Отправьте sitemap.xml

### 3. Open Graph изображение
Создайте изображение 1200x630px с:
- Логотипом roomGPT
- Текстом "Нейросеть для дизайна интерьера"
- Примером до/после

Сохраните как `/public/og-image.jpg`

Можно использовать Canva или Figma для создания.

### 4. Яндекс Метрика и Google Analytics
Установите счетчики для отслеживания трафика:

**Яндекс Метрика:**
1. Создайте счетчик на https://metrika.yandex.ru
2. Добавьте код в `app/layout.tsx` перед закрывающим `</body>`

**Google Analytics:**
1. Создайте счетчик на https://analytics.google.com
2. Получите ID (G-XXXXXXXXXX)
3. Установите через `next/script`

### 5. Дополнительные страницы для SEO
Создайте блог или статьи:
- `/blog/kak-ispolzovat-neyroset-dlya-dizayna`
- `/blog/stili-dizayna-interiera`
- `/blog/sovety-po-dizaynu-kuhni`

### 6. Внешние ссылки
- Разместите информацию на профильных форумах
- Создайте профили в соцсетях (VK, Telegram)
- Отправьте сайт в каталоги (Yandex Catalog, др.)

### 7. Скорость загрузки
Оптимизируйте:
```bash
# Сжатие изображений
npm install sharp

# Настройка кеширования в nginx
# Добавьте в конфиг:
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
  expires 30d;
  add_header Cache-Control "public, immutable";
}
```

## 📊 Отслеживание позиций

### Ключевые запросы для мониторинга:
1. roomgpt
2. roomgpt нейросеть
3. roomgpt на русском
4. нейросеть для дизайна интерьера
5. дизайн интерьера онлайн
6. room gpt на русском

Используйте:
- https://serpstat.com
- https://wordstat.yandex.ru
- https://topvisor.com

## 🎯 KPI для отслеживания
- Позиции по ключевым запросам (топ-10)
- Органический трафик (цель: 1000+ посетителей/месяц)
- CTR в поиске (цель: >5%)
- Время на сайте (цель: >2 минуты)
- Конверсия в регистрацию (цель: >10%)

## 📱 Мобильная оптимизация
- ✅ Адаптивный дизайн
- ✅ Быстрая загрузка
- 🔧 Проверьте в Google PageSpeed Insights

## 🔗 Полезные ссылки
- Яндекс Вебмастер: https://webmaster.yandex.ru
- Google Search Console: https://search.google.com/search-console
- Schema.org: https://schema.org
- PageSpeed Insights: https://pagespeed.web.dev

