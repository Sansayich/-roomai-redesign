import Link from 'next/link'

export default function PaymentInfoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <Link href="/pricing" className="text-sm sm:text-base text-gray-700 hover:text-gray-900">
            Вернуться к тарифам
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Способы оплаты</h1>

        {/* Доступные методы оплаты */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Принимаем к оплате</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Банковские карты: VISA, MasterCard, МИР</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-gray-900 font-medium">Система быстрых платежей (СБП)</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Обратите внимание:</strong> Оплата производится через защищенный шлюз банка-партнера. 
              Мы не храним данные ваших банковских карт.
            </p>
          </div>
        </div>

        {/* Как оплатить */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Как оплатить</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">1. Выберите тариф</h3>
              <p className="text-gray-600">На странице тарифов выберите подходящий план и нажмите кнопку "Оплатить"</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">2. Подтвердите согласие</h3>
              <p className="text-gray-600">Отметьте чекбокс о согласии с публичной офертой и политикой конфиденциальности</p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">3. Введите данные карты</h3>
              <p className="text-gray-600">Вы будете перенаправлены на безопасную страницу платежной системы, где нужно ввести:</p>
              <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                <li>Номер карты</li>
                <li>Срок действия карты</li>
                <li>Трёхзначный код CVC2/CVV2 (на обороте карты)</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">4. Подтвердите платёж</h3>
              <p className="text-gray-600">
                Если ваша карта подключена к услуге 3D-Secure, вы будете автоматически перенаправлены 
                на страницу банка для подтверждения платежа (SMS-код или push-уведомление)
              </p>
            </div>

            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-bold text-gray-900 mb-2">5. Получите кредиты</h3>
              <p className="text-gray-600">После успешной оплаты кредиты моментально зачисляются на ваш аккаунт</p>
            </div>
          </div>
        </div>

        {/* Безопасность платежей */}
        <div className="bg-green-50 rounded-xl border border-green-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Безопасность платежей</h2>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Шифрование SSL</h3>
                <p className="text-sm">Все данные передаются по защищённому протоколу SSL и шифруются с использованием современных алгоритмов</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Стандарт PCI DSS</h3>
                <p className="text-sm">Интернет-платежи обрабатываются через безопасный шлюз банка согласно международному сертификату безопасности PCI DSS</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Технология 3D-Secure</h3>
                <p className="text-sm">Дополнительная защита платежей через подтверждение в мобильном приложении банка или по SMS</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Не храним данные карт</h3>
                <p className="text-sm">Мы не сохраняем и не имеем доступа к данным вашей банковской карты. Вся информация обрабатывается напрямую банком</p>
              </div>
            </div>
          </div>
        </div>

        {/* Сроки зачисления */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Сроки зачисления</h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Система быстрых платежей (СБП)</h3>
              <p className="text-gray-600">Кредиты зачисляются <span className="font-bold text-green-600">моментально</span></p>
            </div>

            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-2">Банковские карты</h3>
              <p className="text-gray-600">Кредиты зачисляются <span className="font-bold text-blue-600">в течение 1-2 минут</span></p>
            </div>
          </div>
        </div>

        {/* Возврат средств */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Возврат средств</h2>
          <p className="text-gray-700 mb-4">
            Если вы хотите вернуть деньги за неиспользованные кредиты, ознакомьтесь с нашей{' '}
            <Link href="/refund" className="text-blue-600 hover:underline font-medium">
              политикой возврата средств
            </Link>.
          </p>
          <p className="text-gray-700">
            При возврате средств на банковскую карту деньги вернутся на ту карту, с которой был совершён платёж. 
            Срок возврата составляет от 1 до 30 рабочих дней в зависимости от банка-эмитента.
          </p>
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
            <Link href="/referral" className="hover:text-gray-900">Партнерская программа</Link>
          </div>

          {/* Реквизиты компании */}
          <div className="border-t border-gray-300 pt-3">
            <p className="font-medium text-gray-700 mb-2">Реквизиты</p>
            <p>ИП Степыгин Александр Александрович</p>
            <p>ИНН: 860221500587 | ОГРНИП: 325508100363022</p>
            <p>Юр. адрес: 140074, Россия, Московская область, г. Люберцы, ул. Преображенская 3, 111</p>
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

