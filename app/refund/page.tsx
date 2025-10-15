import Link from 'next/link'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="w-full px-6 py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← На главную
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Политика возврата средств</h1>
        
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p className="text-sm text-gray-500">Дата последнего обновления: {new Date().toLocaleDateString('ru-RU')}</p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Общие положения</h2>
            <p>
              Настоящая Политика возврата средств (далее — «Политика») определяет условия и порядок 
              возврата денежных средств за услуги Сервиса roomGPT, расположенного по адресу room-gpt.ru.
            </p>
            <p>
              Политика разработана в соответствии с Законом РФ от 07.02.1992 № 2300-1 «О защите прав потребителей» 
              и Гражданским кодексом Российской Федерации.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Условия возврата денежных средств</h2>
            <p><strong>2.1. Возврат возможен в следующих случаях:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>За неиспользованные Кредиты в течение 7 календарных дней с момента покупки</li>
              <li>При технической неисправности Сервиса, из-за которой Пользователь не смог воспользоваться оплаченными услугами</li>
              <li>При двойном или ошибочном списании денежных средств</li>
            </ul>

            <p><strong>2.2. Возврат НЕ производится:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>За Кредиты, которые уже были использованы для генерации изображений</li>
              <li>За бесплатные Кредиты, начисленные при регистрации</li>
              <li>По истечении 7 календарных дней с момента покупки</li>
              <li>Если Пользователь не удовлетворен качеством сгенерированных изображений (качество генерации зависит от алгоритмов ИИ и не гарантируется)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Порядок оформления возврата</h2>
            <p><strong>Для возврата денежных средств необходимо:</strong></p>
            
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
              <p className="font-semibold text-blue-900">Шаг 1: Отправить запрос на возврат</p>
              <p className="text-blue-800 mt-2">
                Направьте письмо на электронную почту{' '}
                <a href="mailto:hello@room-gpt.ru" className="underline font-semibold">
                  hello@room-gpt.ru
                </a>{' '}
                с темой «Возврат средств»
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
              <p className="font-semibold text-blue-900">Шаг 2: Укажите информацию</p>
              <p className="text-blue-800 mt-2">В письме обязательно укажите:</p>
              <ul className="list-disc pl-6 mt-2 text-blue-800">
                <li>Email, использованный при регистрации</li>
                <li>Дату и сумму платежа</li>
                <li>Причину возврата</li>
                <li>Реквизиты для возврата (номер карты или банковский счет)</li>
              </ul>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 my-4">
              <p className="font-semibold text-blue-900">Шаг 3: Ожидайте рассмотрения</p>
              <p className="text-blue-800 mt-2">
                Мы рассмотрим ваш запрос в течение 3 рабочих дней и сообщим о решении
              </p>
            </div>

            <p className="mt-6">
              3.1. После одобрения заявки на возврат, денежные средства будут возвращены в течение 
              10 рабочих дней на банковскую карту или счет, с которого была произведена оплата.
            </p>
            <p>
              3.2. Если оплата производилась через платежную систему, срок возврата может зависеть 
              от правил работы соответствующей платежной системы и вашего банка.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Частичный возврат</h2>
            <p>
              4.1. Если часть приобретенных Кредитов была использована, возврат производится только 
              за неиспользованную часть пропорционально стоимости пакета.
            </p>
            <p><strong>Пример расчета:</strong></p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <p>Приобретен пакет: 100 кредитов за 699 рублей</p>
              <p>Использовано: 25 кредитов</p>
              <p>Стоимость 1 кредита: 699 ÷ 100 = 6,99 рублей</p>
              <p>Остаток: 75 кредитов</p>
              <p className="font-bold text-lg mt-2">Сумма возврата: 75 × 6,99 = 524,25 рублей</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Технические проблемы</h2>
            <p>
              5.1. Если вы не смогли использовать оплаченные Кредиты из-за технических проблем Сервиса:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Сообщите нам о проблеме на hello@room-gpt.ru с описанием ситуации</li>
              <li>Мы проведем проверку и при подтверждении технической неисправности вернем использованные Кредиты или денежные средства</li>
              <li>Компенсация не предоставляется за кратковременные сбои (менее 1 часа)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Отказ в возврате</h2>
            <p><strong>Мы имеем право отказать в возврате средств если:</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Прошло более 7 календарных дней с момента покупки</li>
              <li>Все приобретенные Кредиты были использованы</li>
              <li>Причина возврата — субъективная неудовлетворенность результатом генерации</li>
              <li>Пользователь нарушил условия Публичной оферты</li>
              <li>Обнаружены признаки мошенничества или злоупотребления</li>
            </ul>
            <p className="mt-4">
              В случае отказа в возврате мы направим вам письменное обоснование решения.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Сроки возврата</h2>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Рассмотрение заявки</p>
                    <p className="text-gray-600">До 3 рабочих дней</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Возврат денежных средств</p>
                    <p className="text-gray-600">До 10 рабочих дней с момента одобрения</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Поступление на карту</p>
                    <p className="text-gray-600">Зависит от банка-эмитента (обычно 3-5 рабочих дней)</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. Обратная связь</h2>
            <p>
              Если у вас возникли вопросы по возврату средств или вы хотите оформить возврат, свяжитесь с нами:
            </p>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mt-4">
              <p><strong>ИП Степыгин Александр Александрович</strong></p>
              <p className="mt-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:hello@room-gpt.ru" className="text-blue-600 hover:underline">
                  hello@room-gpt.ru
                </a>
              </p>
              <p className="mt-1"><strong>Тема письма:</strong> «Возврат средств»</p>
              <p className="mt-3 text-sm text-gray-600">
                Адрес: 140074, Россия, Московская область, г. Люберцы, ул. Преображенская, д. 3, кв. 111
              </p>
              <p className="mt-1 text-sm text-gray-600">ИНН: 860221500587</p>
              <p className="mt-1 text-sm text-gray-600">ОГРНИП: 325508100363022</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Разрешение споров</h2>
            <p>
              9.1. Все споры, связанные с возвратом денежных средств, решаются путем переговоров.
            </p>
            <p>
              9.2. В случае невозможности достижения согласия, спор подлежит рассмотрению 
              в соответствии с законодательством Российской Федерации.
            </p>
            <p>
              9.3. Вы имеете право обратиться с жалобой в Роспотребнадзор или в суд по месту вашего жительства.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Изменения в Политике</h2>
            <p>
              10.1. Мы оставляем за собой право вносить изменения в настоящую Политику.
            </p>
            <p>
              10.2. Актуальная версия Политики всегда доступна по адресу:{' '}
              <a href="https://room-gpt.ru/refund" className="text-blue-600 hover:underline">
                room-gpt.ru/refund
              </a>
            </p>
          </section>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm space-y-2">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-gray-900">Публичная оферта</Link>
            <Link href="/privacy" className="hover:text-gray-900">Политика конфиденциальности</Link>
            <Link href="/refund" className="hover:text-gray-900">Возврат средств</Link>
            <Link href="/referral" className="hover:text-gray-900">Партнерская программа</Link>
          </div>
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

