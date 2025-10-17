'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('paymentId')
  const [isChecking, setIsChecking] = useState(true)
  const [credits, setCredits] = useState<number | null>(null)
  const [alreadyProcessed, setAlreadyProcessed] = useState(false)

  useEffect(() => {
    // Даем webhook 2 секунды, чтобы успеть обработать платеж
    // Затем проверяем статус и начисляем кредиты если webhook не сработал
    const timer = setTimeout(async () => {
      if (!paymentId) {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch('/api/payment/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId })
        })

        const data = await response.json()

        if (data.success) {
          setCredits(data.credits)
          if (data.message?.includes('Already processed')) {
            setAlreadyProcessed(true)
          }
        }
      } catch (err) {
        console.error('Error confirming payment:', err)
      } finally {
        setIsChecking(false)
      }
    }, 2000) // Ждем 2 секунды

    return () => clearTimeout(timer)
  }, [paymentId])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Обрабатываем платеж...
              </h1>
              <p className="text-lg text-gray-600">
                Пожалуйста, подождите несколько секунд
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

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
            {credits && (
              <p className="text-lg text-gray-600 mb-4">
                <strong>{credits} кредитов</strong> добавлено на ваш счет!
              </p>
            )}
            {alreadyProcessed && (
              <p className="text-sm text-gray-500 mb-4">
                (Кредиты были начислены автоматически через webhook)
              </p>
            )}
            <p className="text-md text-gray-500 mb-8">
              Теперь вы можете использовать их для генерации изображений.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Что дальше?
            </h2>
            <ul className="text-left text-green-700 space-y-2">
              <li>• Кредиты уже на вашем счету</li>
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
