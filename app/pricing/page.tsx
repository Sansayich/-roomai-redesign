'use client'

import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export default function PricingPage() {
  const plans = [
    {
      name: 'Мини',
      price: '99',
      credits: 10,
      popular: false,
      features: [
        '10 кредитов',
        '~10 генераций',
        'Все стили доступны',
        'Скачивание результатов'
      ]
    },
    {
      name: 'Стандарт',
      price: '299',
      credits: 30,
      popular: false,
      features: [
        '30 кредитов',
        '~30 генераций',
        'Все стили доступны',
        'Скачивание результатов'
      ]
    },
    {
      name: 'Популярный',
      price: '699',
      credits: 100,
      popular: true,
      features: [
        '100 кредитов',
        '~100 генераций',
        'Все стили доступны',
        'Приоритетная обработка',
        'Скачивание результатов'
      ]
    },
    {
      name: 'Максимум',
      price: '1199',
      credits: 200,
      popular: false,
      features: [
        '200 кредитов',
        '~200 генераций',
        'Все стили доступны',
        'Приоритетная обработка',
        'Скачивание результатов',
        'Email поддержка'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-6 py-5 border-b border-gray-200">
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
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Выберите свой <span className="text-blue-600">план</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Начните бесплатно или выберите план, который подходит для ваших потребностей
          </p>
        </div>

        {/* Тарифы */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-gray-50 rounded-xl border p-6
                ${plan.popular ? 'border-blue-600 border-2 bg-white' : 'border-gray-200'}
                transition-all hover:border-blue-300 hover:bg-white
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-gray-900">
                    {plan.price}₽
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {plan.credits} {plan.credits === 1 ? 'кредит' : plan.credits < 5 ? 'кредита' : 'кредитов'}
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
                Выбрать план
              </button>
            </div>
          ))}
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
      <footer className="w-full py-8 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm space-y-2">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-gray-900">Публичная оферта</Link>
            <Link href="/privacy" className="hover:text-gray-900">Политика конфиденциальности</Link>
            <Link href="/refund" className="hover:text-gray-900">Возврат средств</Link>
          </div>
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

