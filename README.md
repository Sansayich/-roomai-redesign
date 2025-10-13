# roomGPT - Редизайн интерьера с помощью ИИ 🏠✨

Аналог [RoomGPT](https://www.roomgpt.io/dream) - веб-приложение для автоматического редизайна интерьеров комнат с использованием искусственного интеллекта.

![RoomAI](https://img.shields.io/badge/Next.js-14-black) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-cyan)

## 🌟 Возможности

- 🖼️ **Загрузка изображений** - Drag & Drop или выбор файла
- 🎨 **9 стилей интерьера** - Modern, Summer, Professional, Tropical, Coastal, Vintage, Industrial, Neoclassic, Tribal
- 🏠 **6 типов комнат** - Гостиная, Спальня, Кухня, Ванная, Офис, Столовая
- ⚡ **Два уровня качества** - Быстрая генерация или максимальное качество
- 🎯 **Множественный выбор** - До 4 стилей одновременно
- 💾 **Скачивание результатов** - Сохранение всех сгенерированных дизайнов
- 💳 **Система кредитов** - Гибкие тарифные планы

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ 
- npm или yarn
- API ключ от [Replicate](https://replicate.com) (опционально для демо)

### Установка

1. **Клонируйте проект:**
```bash
cd roomai-redesign
```

2. **Установите зависимости:**
```bash
npm install
# или
yarn install
```

3. **Настройте переменные окружения:**

Создайте файл `.env.local` в корне проекта:

```bash
cp .env.example .env.local
```

Отредактируйте `.env.local`:

```env
# Replicate API ключ (получить на https://replicate.com/account/api-tokens)
REPLICATE_API_TOKEN=your_api_token_here

# NextAuth Secret (сгенерируйте случайную строку)
NEXTAUTH_SECRET=your_secret_here

# Google OAuth (опционально)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

4. **Запустите сервер разработки:**
```bash
npm run dev
# или
yarn dev
```

5. **Откройте браузер:**

Перейдите на [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
roomai-redesign/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # API endpoint для генерации
│   ├── generate/
│   │   └── page.tsx              # Страница генерации
│   ├── pricing/
│   │   └── page.tsx              # Страница тарифов
│   ├── layout.tsx                # Основной layout
│   ├── page.tsx                  # Главная страница
│   └── globals.css               # Глобальные стили
├── public/                       # Статические файлы
├── .env.example                  # Пример конфигурации
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Конфигурация

### Получение API ключа Replicate

1. Зарегистрируйтесь на [replicate.com](https://replicate.com)
2. Перейдите в [Account API Tokens](https://replicate.com/account/api-tokens)
3. Создайте новый токен
4. Скопируйте токен в `.env.local`

**Примечание:** Без API ключа приложение работает в demo-режиме (возвращает оригинальное изображение).

### Настройка стилей

Вы можете изменить доступные стили в файле `app/generate/page.tsx`:

```typescript
const roomStyles: RoomStyle[] = [
  { id: 'modern', name: 'Modern', prompt: 'modern', imageUrl: '/themes/modern.jpg' },
  // добавьте свои стили...
]
```

## 💰 Тарифные планы

- **Стартовый** - Бесплатно (1 кредит)
- **Базовый** - $9/месяц (10 кредитов)
- **Профессиональный** - $29/месяц (50 кредитов)
- **Безлимитный** - $99/месяц (неограниченно)

## 🛠️ Технологии

- **Frontend:**
  - [Next.js 14](https://nextjs.org/) - React фреймворк
  - [React 18](https://react.dev/) - UI библиотека
  - [TypeScript](https://www.typescriptlang.org/) - Типизация
  - [Tailwind CSS](https://tailwindcss.com/) - Стилизация
  - [react-dropzone](https://react-dropzone.js.org/) - Загрузка файлов

- **Backend:**
  - [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
  - [Replicate API](https://replicate.com/) - AI генерация изображений

- **AI модели:**
  - ControlNet (для сохранения структуры комнаты)
  - Stable Diffusion (базовая модель)

## 📝 Скрипты

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для production
npm run build

# Запуск production сервера
npm run start

# Проверка кода (linting)
npm run lint
```

## 🎨 Использование

1. **Загрузите фото комнаты** - Перетащите или выберите изображение
2. **Выберите тип комнаты** - Гостиная, спальня и т.д.
3. **Выберите качество** - Высокое (2 кредита) или среднее (1 кредит)
4. **Выберите стили** - До 4 стилей одновременно
5. **Нажмите "Render designs"** - Подождите генерации
6. **Скачайте результаты** - Сохраните понравившиеся варианты

## 🚧 Roadmap

- [ ] Авторизация через Google OAuth
- [ ] Интеграция платежной системы (Stripe)
- [ ] Сохранение истории генераций
- [ ] Сравнение до/после в одном интерфейсе
- [ ] Расширенные настройки генерации
- [ ] Мобильное приложение
- [ ] API для разработчиков

## 🐛 Известные проблемы

- Генерация может занимать 30-60 секунд в зависимости от качества
- Максимальный размер загружаемого изображения - 10MB
- Без API ключа работает только demo-режим

## 🤝 Вклад в проект

Contributions приветствуются! Пожалуйста:

1. Fork проекта
2. Создайте feature ветку (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в ветку (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект создан в образовательных целях. Вдохновлен [RoomGPT](https://www.roomgpt.io).

## 👨‍💻 Автор

Создано с ❤️ для любителей красивого интерьера

## 🙏 Благодарности

- [RoomGPT](https://www.roomgpt.io) - За вдохновение
- [Replicate](https://replicate.com) - За API для AI
- [Vercel](https://vercel.com) - За хостинг Next.js приложений

---

**Примечание:** Для коммерческого использования необходимо проверить лицензии используемых AI моделей.

