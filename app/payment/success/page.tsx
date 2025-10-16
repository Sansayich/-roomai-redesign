import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Платеж успешно завершен!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Кредиты добавлены на ваш счет. Теперь вы можете использовать их для генерации изображений.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Что дальше?
            </h2>
            <ul className="text-left text-green-700 space-y-2">
              <li>• Кредиты автоматически добавлены на ваш счет</li>
              <li>• Вы можете сразу начать генерировать изображения</li>
              <li>• Все сгенерированные изображения сохраняются в истории</li>
              <li>• Кредиты не сгорают и остаются у вас навсегда</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/generate"
              className="inline-block w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Начать генерацию
            </Link>
            <br />
            <Link
              href="/history"
              className="inline-block w-full sm:w-auto bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Посмотреть историю
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
