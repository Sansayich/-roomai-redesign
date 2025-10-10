'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Навигация */}
      <nav className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            RoomAI
          </Link>
          <div className="flex gap-4 items-center">
            <Link 
              href="/generate" 
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Генерация
            </Link>
            <button className="px-6 py-2 bg-white rounded-lg text-gray-800 font-medium shadow-sm hover:shadow-md transition-all">
              Войти
            </button>
          </div>
        </div>
      </nav>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          {/* Бейдж */}
          <Link 
            href="#" 
            className="inline-block mb-8 px-6 py-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all animate-fadeIn"
          >
            <span className="text-sm text-gray-600">
              Более <span className="font-bold text-blue-600">2 миллионов пользователей</span> уже используют наш сервис
            </span>
          </Link>

          {/* Заголовок */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fadeIn">
            Редизайн вашей{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              комнаты
            </span>
            <br />
            за секунды
          </h1>

          {/* Подзаголовок */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fadeIn">
            Загрузите фото вашей комнаты и позвольте искусственному интеллекту создать потрясающий новый дизайн. 
            Получите <span className="font-bold text-gray-900">1 бесплатную генерацию</span> после регистрации.
          </p>

          {/* CTA кнопка */}
          <Link 
            href="/generate"
            onMouseEnter={() => setHoveredButton(true)}
            onMouseLeave={() => setHoveredButton(false)}
            className={`
              inline-flex items-center gap-3 px-10 py-5 
              bg-gradient-to-r from-blue-600 to-purple-600 
              text-white text-lg font-semibold rounded-2xl
              shadow-lg hover:shadow-2xl 
              transform transition-all duration-300
              ${hoveredButton ? 'scale-105' : 'scale-100'}
            `}
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
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-8 text-gray-800">
              Доступные стили интерьера
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
                  className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="text-4xl mb-3">{style.emoji}</div>
                  <div className="font-semibold text-gray-800">{style.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Как это работает */}
          <div className="mt-24">
            <h2 className="text-2xl font-bold mb-12 text-gray-800">
              Как это работает
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Загрузите фото</h3>
                <p className="text-gray-600">
                  Загрузите фотографию вашей комнаты, которую хотите преобразить
                </p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Выберите стиль</h3>
                <p className="text-gray-600">
                  Выберите желаемый стиль интерьера из множества вариантов
                </p>
              </div>
              <div className="p-8 bg-white rounded-2xl shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-pink-600">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Получите результат</h3>
                <p className="text-gray-600">
                  ИИ создаст новый дизайн вашей комнаты за считанные секунды
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-8 border-t border-gray-200 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>
            Создано с ❤️ для любителей красивого интерьера
          </p>
        </div>
      </footer>
    </div>
  )
}

