'use client'

import Link from 'next/link'

export default function PricingPage() {
  const plans = [
    {
      name: 'Стартовый',
      price: '0',
      credits: 1,
      features: [
        '1 бесплатная генерация',
        'Базовое качество',
        'Все стили доступны',
        'Скачивание результатов'
      ]
    },
    {
      name: 'Базовый',
      price: '9',
      credits: 10,
      popular: false,
      features: [
        '10 генераций',
        'Высокое качество',
        'Все стили доступны',
        'Приоритетная обработка',
        'Скачивание в HD'
      ]
    },
    {
      name: 'Профессиональный',
      price: '29',
      credits: 50,
      popular: true,
      features: [
        '50 генераций',
        'Максимальное качество',
        'Все стили доступны',
        'Приоритетная обработка',
        'Скачивание в 4K',
        'Email поддержка'
      ]
    },
    {
      name: 'Безлимитный',
      price: '99',
      credits: 999,
      features: [
        'Неограниченные генерации',
        'Максимальное качество',
        'Эксклюзивные стили',
        'Моментальная обработка',
        'Скачивание в 4K',
        'Приоритетная поддержка 24/7',
        'Коммерческая лицензия'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Навигация */}
      <nav className="w-full px-6 py-5 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-gray-700 hover:text-gray-900">
              Генерация
            </Link>
            <Link href="/pricing" className="text-gray-900 font-medium">
              Тарифы
            </Link>
            <Link href="/generate" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Начать
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Выберите свой <span className="text-blue-600">план</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Начните бесплатно или выберите план, который подходит для ваших потребностей
          </p>
        </div>

        {/* Тарифы */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-white rounded-2xl shadow-lg p-8 
                ${plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''}
                transition-all hover:shadow-xl
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price !== '0' && (
                    <span className="text-gray-500">/месяц</span>
                  )}
                </div>
                <p className="text-gray-600 mt-2">
                  {plan.credits} {plan.credits === 999 ? 'кредитов' : plan.credits === 1 ? 'кредит' : 'кредитов'}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`
                  w-full py-3 rounded-lg font-semibold transition-all
                  ${plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }
                `}
              >
                {plan.price === '0' ? 'Начать бесплатно' : 'Выбрать план'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center mb-12">
            Часто задаваемые вопросы
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Как работают кредиты?',
                a: 'Каждая генерация изображения использует определенное количество кредитов в зависимости от выбранного качества. Высокое качество - 2 кредита, среднее - 1 кредит.'
              },
              {
                q: 'Могу ли я использовать изображения в коммерческих целях?',
                a: 'Да, при наличии плана "Безлимитный" вы получаете коммерческую лицензию на все сгенерированные изображения.'
              },
              {
                q: 'Что происходит после использования всех кредитов?',
                a: 'Вы можете купить дополнительные кредиты в любое время или обновить свой план до более высокого уровня.'
              },
              {
                q: 'Могу ли я отменить подписку?',
                a: 'Да, вы можете отменить подписку в любое время. Неиспользованные кредиты останутся доступными до конца расчетного периода.'
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
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
      <footer className="w-full py-8 border-t border-gray-200 bg-white/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>Создано с ❤️ для любителей красивого интерьера</p>
        </div>
      </footer>
    </div>
  )
}

