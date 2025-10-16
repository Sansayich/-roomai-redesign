import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PaymentFailPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Платеж не был завершен
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              По какой-то причине платеж не был обработан. Это может быть временная проблема или отмена операции.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Возможные причины:
            </h2>
            <ul className="text-left text-red-700 space-y-2">
              <li>• Недостаточно средств на карте</li>
              <li>• Карта заблокирована или истек срок действия</li>
              <li>• Банк отклонил операцию по соображениям безопасности</li>
              <li>• Временные технические проблемы</li>
              <li>• Операция была отменена пользователем</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">
              Что делать?
            </h2>
            <ul className="text-left text-blue-700 space-y-2">
              <li>• Проверьте баланс карты и попробуйте еще раз</li>
              <li>• Убедитесь, что карта не заблокирована</li>
              <li>• Попробуйте другую карту</li>
              <li>• Обратитесь в банк, если проблема повторяется</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/pricing"
              className="inline-block w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Попробовать еще раз
            </Link>
            <br />
            <Link
              href="/generate"
              className="inline-block w-full sm:w-auto bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Продолжить с бесплатными кредитами
            </Link>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>
              Нужна помощь? Напишите нам на{' '}
              <a href="mailto:hello@room-gpt.ru" className="text-blue-600 hover:underline">
                hello@room-gpt.ru
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
