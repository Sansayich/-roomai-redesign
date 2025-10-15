import Link from 'next/link'

export default function ContactsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <Link href="/" className="text-sm sm:text-base text-gray-700 hover:text-gray-900">
            На главную
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Контакты и реквизиты</h1>

        {/* Контактная информация */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Контактная информация</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Email для связи</h3>
                <a href="mailto:hello@room-gpt.ru" className="text-blue-600 hover:underline text-lg">
                  hello@room-gpt.ru
                </a>
                <p className="text-sm text-gray-600 mt-1">Ответим в течение 24 часов</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Сайт</h3>
                <a href="https://room-gpt.ru" className="text-blue-600 hover:underline text-lg">
                  room-gpt.ru
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Реквизиты */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Реквизиты</h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-1">Наименование</h3>
              <p>Индивидуальный предприниматель Степыгин Александр Андреевич</p>
              <p className="text-sm text-gray-600 mt-1">(ИП Степыгин А.А.)</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-1">ИНН</h3>
              <p className="font-mono text-lg">860221500587</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-1">ОГРНИП</h3>
              <p className="font-mono text-lg">325508100363022</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-1">Юридический адрес</h3>
              <p>140074, Россия, Московская область</p>
              <p>г. Люберцы, ул. Преображенская, д. 3, помещение 111</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-1">Email</h3>
              <a href="mailto:hello@room-gpt.ru" className="text-blue-600 hover:underline">
                hello@room-gpt.ru
              </a>
            </div>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
          <h3 className="font-bold text-blue-900 mb-2">Нужна помощь?</h3>
          <p className="text-blue-800 text-sm mb-3">
            Если у вас есть вопросы по использованию сервиса, оплате или возврату средств, 
            напишите нам на <a href="mailto:hello@room-gpt.ru" className="underline font-medium">hello@room-gpt.ru</a>
          </p>
          <div className="flex flex-wrap gap-3">
            <Link 
              href="/terms" 
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              Публичная оферта
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              Политика конфиденциальности
            </Link>
            <Link 
              href="/refund" 
              className="text-sm text-blue-700 hover:text-blue-900 underline"
            >
              Возврат средств
            </Link>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-6 sm:py-8 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-xs sm:text-sm space-y-3">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            <Link href="/terms" className="hover:text-gray-900">Публичная оферта</Link>
            <Link href="/privacy" className="hover:text-gray-900">Политика конфиденциальности</Link>
            <Link href="/refund" className="hover:text-gray-900">Возврат средств</Link>
            <Link href="/payment-info" className="hover:text-gray-900">Способы оплаты</Link>
            <Link href="/contacts" className="hover:text-gray-900">Контакты и реквизиты</Link>
            <Link href="/referral" className="hover:text-gray-900">Партнерская программа</Link>
          </div>
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

