'use client'

import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export default function PricingPage() {
  const plans = [
    {
      name: 'Мини',
      price: '99',
      credits: 10,
      generations: '10',
      popular: false,
    },
    {
      name: 'Популярный',
      price: '699',
      credits: 100,
      generations: '100',
      popular: true,
    },
    {
      name: 'Стандарт',
      price: '299',
      credits: 30,
      generations: '30',
      popular: false,
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
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`
                relative bg-gray-50 rounded-xl border p-6
                ${plan.popular ? 'border-blue-600 border-2 bg-blue-600 text-white' : 'border-gray-200'}
                transition-all hover:border-blue-300
              `}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gray-700 text-white px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className={`text-xl font-semibold mb-4 ${plan.popular ? 'text-white' : 'text-gray-600'}`}>
                  {plan.credits} {plan.credits === 1 ? 'кредит' : plan.credits < 5 ? 'кредита' : 'кредитов'}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? 'text-white opacity-90' : 'text-gray-700'}`}>
                  {plan.generations} генераций
                </p>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white opacity-90' : 'text-gray-700'}`}>
                  Все стили доступны
                </p>
                <div className="flex items-baseline justify-center gap-1 mb-6">
                  <span className={`text-sm font-medium ${plan.popular ? 'text-white' : 'text-gray-900'}`}>₽</span>
                  <span className={`text-5xl font-semibold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                </div>
              </div>

              <button
                className={`
                  w-full py-3 rounded-lg font-semibold transition-all
                  ${plan.popular
                    ? 'bg-white text-blue-600 hover:bg-gray-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                Оплатить
              </button>
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

              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Скоро: Сохранение в личном кабинете</h3>
                  <p className="text-sm text-gray-600">Все ваши генерации в одном месте</p>
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

