'use client'

import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
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
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

