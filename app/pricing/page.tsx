'use client'

import Link from 'next/link'
import UserMenu from '@/components/UserMenu'
import { useState } from 'react'

export default function PricingPage() {
  const [promoCode, setPromoCode] = useState('')
  const [promoData, setPromoData] = useState<{discountPercent?: number, discountAmount?: number} | null>(null)
  const [promoError, setPromoError] = useState('')
  const [isCheckingPromo, setIsCheckingPromo] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState<{ [key: string]: boolean }>({}) // Согласие с офертой

  const checkPromoCode = async () => {
    if (!promoCode.trim()) return

    setIsCheckingPromo(true)
    setPromoError('')

    try {
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setPromoData(data)
        // Сохраняем промокод в localStorage для неавторизованных пользователей
        localStorage.setItem('appliedPromo', JSON.stringify(data))
      } else {
        setPromoError(data.error || 'Неверный промокод')
        setPromoData(null)
      }
    } catch (error) {
      setPromoError('Ошибка проверки промокода')
      setPromoData(null)
    } finally {
      setIsCheckingPromo(false)
    }
  }

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!promoData) return originalPrice

    if (promoData.discountPercent) {
      return Math.round(originalPrice * (1 - promoData.discountPercent / 100))
    }
    
    if (promoData.discountAmount) {
      return Math.max(0, originalPrice - promoData.discountAmount)
    }

    return originalPrice
  }

  const plans = [
    {
      name: 'Мини',
      price: '99',
      credits: 10,
      generations: '10',
      storage: 'Хранение 24 часа',
      popular: false,
    },
    {
      name: 'Популярный',
      price: '299',
      credits: 40,
      generations: '40',
      storage: 'Хранение 24 часа',
      popular: true,
    },
    {
      name: 'Максимум',
      price: '699',
      credits: 100,
      generations: '100',
      storage: 'Хранение 30 дней',
      popular: false,
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/generate" className="hidden sm:inline text-gray-700 hover:text-gray-900">
              Генерация
            </Link>
            <Link href="/pricing" className="text-sm sm:text-base text-gray-900 font-medium">
              Тарифы
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Заголовок */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-900">
            Выберите свой <span className="text-blue-600">план</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
            Начните бесплатно или выберите план, который подходит для ваших потребностей
          </p>
        </div>

        {/* Поле для промокода */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Есть промокод?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Введите промокод"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && checkPromoCode()}
              />
              <button
                onClick={checkPromoCode}
                disabled={isCheckingPromo || !promoCode.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCheckingPromo ? 'Проверка...' : 'Применить'}
              </button>
            </div>
            
            {promoData && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✅ Промокод применен! Скидка{' '}
                  {promoData.discountPercent ? `${promoData.discountPercent}%` : `${promoData.discountAmount}₽`}
                </p>
              </div>
            )}

            {promoError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">
                  ❌ {promoError}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Тарифы */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-white rounded-xl border p-6
                ${plan.popular ? 'border-blue-600 border-2' : 'border-gray-200 bg-gray-50'}
                transition-all hover:border-blue-300
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-4 text-blue-600">
                  {plan.credits} {plan.credits === 1 ? 'кредит' : plan.credits < 5 ? 'кредита' : 'кредитов'}
                </h3>
                <p className="text-sm mb-2 text-gray-700">
                  {plan.generations} генераций
                </p>
                <p className="text-sm mb-2 text-gray-700">
                  Все стили доступны
                </p>
                <p className="text-sm mb-6 font-medium text-blue-600">
                  {plan.storage}
                </p>
                <div className="mb-6">
                  {promoData ? (
                    <>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-sm font-medium text-gray-400 line-through">₽</span>
                        <span className="text-2xl font-semibold text-gray-400 line-through">
                          {plan.price}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-sm font-medium text-blue-600">₽</span>
                        <span className="text-5xl font-semibold text-blue-600">
                          {calculateDiscountedPrice(parseInt(plan.price))}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm font-medium text-gray-900">₽</span>
                      <span className="text-5xl font-semibold text-gray-900">
                        {plan.price}
                      </span>
                    </div>
                  )}
                </div>
              </div>

                  {/* Чекбокс согласия с офертой */}
                  <div className="mb-4">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms[plan.name] || false}
                        onChange={(e) => setAgreedToTerms({ ...agreedToTerms, [plan.name]: e.target.checked })}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-600">
                        Я согласен с{' '}
                        <Link href="/terms" target="_blank" className="text-blue-600 hover:underline">
                          Публичной офертой
                        </Link>
                        {' '}и{' '}
                        <Link href="/privacy" target="_blank" className="text-blue-600 hover:underline">
                          Политикой конфиденциальности
                        </Link>
                      </span>
                    </label>
                  </div>

                  <button
                    disabled={!agreedToTerms[plan.name]}
                    className="w-full py-3 rounded-lg font-semibold transition-all bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Оплатить
                  </button>

                  <div className="mt-3 text-center">
                    <Link href="/payment-info" className="text-xs text-blue-600 hover:underline">
                      Способы оплаты и безопасность
                    </Link>
                  </div>
            </div>
          ))}
        </div>

        {/* What's included */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Что включено
            </h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Хранение изображений</h3>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Мини/Популярный:</span> 24 часа<br/>
                    <span className="font-medium text-blue-600">Максимум:</span> 30 дней
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Поддержка по email</h3>
                  <p className="text-sm text-gray-600">Ответим на все ваши вопросы</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Коммерческое использование</h3>
                  <p className="text-sm text-gray-600">Используйте изображения в любых проектах</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Скачивание результатов</h3>
                  <p className="text-sm text-gray-600">Все сгенерированные изображения доступны для загрузки</p>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="text-gray-600">
                Интересует корпоративный тариф? Напишите на{' '}
                <a href="mailto:hello@room-gpt.ru" className="text-blue-600 hover:underline font-medium">
                  hello@room-gpt.ru
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'Как работают кредиты?',
                a: 'Каждая генерация изображения использует определенное количество кредитов в зависимости от выбранного качества. Высокое качество (ControlNet) - 2 кредита, стандартное качество - 1 кредит. Вы получаете 3 бесплатных кредита при регистрации!'
              },
              {
                q: 'Как долго хранятся мои изображения?',
                a: 'Для тарифов Мини и Стандарт изображения доступны 24 часа - обязательно скачайте их! Для тарифа "Популярный" изображения хранятся 30 дней на нашем сервере в истории генераций.'
              },
              {
                q: 'В чем разница между качествами генерации?',
                a: 'Стандартное качество (1 кредит) отлично подходит для большинства задач. Высокое качество (2 кредита) использует более продвинутую модель ControlNet для максимальной детализации и точности.'
              },
              {
                q: 'Могу ли я использовать изображения в коммерческих целях?',
                a: 'Да, все сгенерированные изображения можно использовать в любых целях, включая коммерческие проекты.'
              },
              {
                q: 'Что происходит после использования всех кредитов?',
                a: 'Вы можете купить дополнительные кредиты в любое время. Кредиты не сгорают и остаются у вас навсегда.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl border border-gray-200 p-6 hover:bg-white hover:border-blue-200 transition-all">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {item.q}
                </h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-6 sm:py-8 border-t border-gray-200 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-xs sm:text-sm space-y-3">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
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

