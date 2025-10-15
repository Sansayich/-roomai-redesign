'use client'

import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import Script from 'next/script'

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'roomGPT',
    alternateName: ['room gpt', 'рум гпт', 'румгпт'],
    url: 'https://room-gpt.ru',
    description: 'Нейросеть для дизайна интерьера на русском языке. Создайте дизайн комнаты, кухни, ванной с помощью искусственного интеллекта за секунды.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB',
      description: '3 бесплатных кредита при регистрации'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '10000',
      bestRating: '5',
      worstRating: '1'
    },
    inLanguage: 'ru-RU',
    availableLanguage: {
      '@type': 'Language',
      name: 'Russian',
      alternateName: 'ru'
    },
    featureList: [
      'Генерация дизайна интерьера с помощью ИИ',
      'Работает без VPN на территории РФ',
      'Оплата российскими картами',
      'Более 8 стилей интерьера',
      'Дизайн комнаты, кухни, ванной, спальни',
      '3 бесплатных кредита при регистрации'
    ],
    provider: {
      '@type': 'Organization',
      name: 'ИП Степыгин А.А.',
      email: 'hello@room-gpt.ru',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Люберцы',
        addressRegion: 'Московская область',
        postalCode: '140074',
        streetAddress: 'ул. Преображенская 3, 111',
        addressCountry: 'RU'
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Навигация */}
      <nav className="w-full px-6 py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex gap-6 items-center">
            <Link 
              href="/generate" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Генерация
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Тарифы
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center">
          {/* Заголовок */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Редизайн вашей <span className="text-blue-600">комнаты</span> за секунды
          </h1>

          {/* Подзаголовок */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Загрузите фото вашей комнаты и позвольте искусственному интеллекту создать потрясающий новый дизайн. 
            Получите <span className="font-semibold text-gray-900">3 бесплатных кредита</span> после регистрации.
          </p>

          {/* CTA кнопка */}
          <Link 
            href="/generate"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            Начать редизайн
          </Link>

          {/* Примеры стилей */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Доступные стили интерьера
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Современный', emoji: '🏢' },
                { name: 'Минимализм', emoji: '⚪️' },
                { name: 'Профессиональный', emoji: '💼' },
                { name: 'Тропический', emoji: '🌴' },
                { name: 'Индустриальный', emoji: '🏭' },
                { name: 'Неоклассика', emoji: '🏛' },
                { name: 'Винтаж', emoji: '📻' },
                { name: 'Прибрежный', emoji: '🌊' },
              ].map((style, index) => (
                <div
                  key={index}
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-white transition-all cursor-pointer"
                >
                  <div className="text-3xl mb-2">{style.emoji}</div>
                  <div className="font-semibold text-gray-900 text-sm">{style.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Как это работает */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold mb-12 text-gray-900">
              Как это работает
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Загрузите фото</h3>
                <p className="text-gray-600">
                  Загрузите фотографию вашей комнаты, которую хотите преобразить
                </p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Выберите стиль</h3>
                <p className="text-gray-600">
                  Выберите желаемый стиль интерьера из множества вариантов
                </p>
              </div>
              <div className="p-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-14 h-14 mx-auto mb-4 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Получите результат</h3>
                <p className="text-gray-600">
                  ИИ создаст новый дизайн вашей комнаты за считанные секунды
                </p>
              </div>
            </div>
          </div>

          {/* SEO блок */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                RoomGPT — нейросеть для дизайна интерьера на русском языке
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>RoomGPT (room gpt)</strong> — это бесплатная нейросеть для дизайна интерьера, 
                  которая работает на русском языке без VPN. Наш сервис позволяет создать дизайн комнаты, 
                  дизайн кухни, дизайн ванной и любого другого помещения с помощью искусственного интеллекта 
                  всего за несколько секунд.
                </p>
                <p>
                  <strong>Дизайн интерьера онлайн</strong> стал доступнее благодаря современным нейросетям. 
                  RoomGPT использует продвинутые алгоритмы ИИ для генерации фотореалистичных изображений 
                  интерьера. Просто загрузите фото вашей комнаты, выберите желаемый стиль дизайна интерьера 
                  (современный, минимализм, неоклассика, винтаж и др.) — и получите готовый дизайн проект интерьера.
                </p>
                <p>
                  <strong>Нейросеть для дизайна интерьера бесплатно:</strong> при регистрации вы получаете 
                  3 бесплатных кредита для генерации. Это отличная возможность попробовать сервис и оценить 
                  качество работы нейросети. RoomGPT io — это российская альтернатива зарубежным сервисам, 
                  которая работает без VPN и принимает оплату российскими картами.
                </p>
                <p>
                  <strong>Программа для дизайна интерьера</strong> на основе ИИ подходит для всех: 
                  дизайнеров интерьера, архитекторов, риелторов и обычных пользователей, которые хотят 
                  обновить дизайн интерьера квартиры или дома. Создайте дизайн интерьера комнаты, 
                  спальни, гостиной или кухни за считанные минуты!
                </p>
                <p>
                  <strong>Стили дизайна интерьера:</strong> современный дизайн интерьера, минимализм, 
                  неоклассика, индустриальный стиль, тропический, винтаж, прибрежный и профессиональный. 
                  Все стили доступны в нашей нейросети для создания дизайна интерьера.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm space-y-3">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-gray-900">Публичная оферта</Link>
            <Link href="/privacy" className="hover:text-gray-900">Политика конфиденциальности</Link>
            <Link href="/refund" className="hover:text-gray-900">Возврат средств</Link>
            <Link href="/referral" className="hover:text-gray-900">Партнерская программа</Link>
          </div>
          <div className="flex justify-center items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:hello@room-gpt.ru" className="hover:text-gray-900">hello@room-gpt.ru</a>
          </div>
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

