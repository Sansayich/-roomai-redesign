'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
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
      <Navigation />

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-16 sm:pb-24">
        <div className="text-center">
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
            Редизайн вашей <span className="text-blue-600">комнаты</span> за секунды
          </h1>

          {/* Подзаголовок */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: 'Скандинавский', imageUrl: '/images/styles/scandinavian.jpg' },
                { name: 'Минимализм', imageUrl: '/images/styles/minimalism.jpg' },
                { name: 'Неоклассика', imageUrl: '/images/styles/neoclassic.jpg' },
                { name: 'Лофт', imageUrl: '/images/styles/loft.jpg' },
                { name: 'Классика', imageUrl: '/images/styles/classic.jpg' },
                { name: 'Эклектика', imageUrl: '/images/styles/eclectic.jpg' },
                { name: 'Japandi', imageUrl: '/images/styles/japandi.jpg' },
                { name: 'Контемпорари', imageUrl: '/images/styles/contemporary.jpg' },
                { name: 'Бабушкин вариант', imageUrl: '/images/styles/vintage.jpg' },
              ].map((style, index) => (
                <div
                  key={index}
                  className="cursor-pointer"
                >
                  <div className="aspect-[4/3] mb-3 rounded-xl overflow-hidden">
                    <img
                      src={style.imageUrl}
                      alt={style.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="font-semibold text-gray-900 text-sm text-center">{style.name}</div>
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
          <div className="mt-12 sm:mt-16 md:mt-20 max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                RoomGPT — нейросеть для дизайна интерьера на русском языке
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700">
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

      <Footer />
    </div>
  )
}

