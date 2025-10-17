import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function checkAndConfirmPayment(userId: string) {
  // Находим последний pending платеж
  const payment = await prisma.payment.findFirst({
    where: { 
      userId: userId,
      status: 'pending'
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (!payment || !payment.paymentId) {
    return { success: false, message: 'Платежей в обработке не найдено' }
  }

  // Проверяем статус через API Точка Банка
  try {
    const tochkaApiUrl = `https://enter.tochka.com/uapi/acquiring/v1.0/payments/${payment.paymentId}`
    const tochkaResponse = await fetch(tochkaApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TOCHKA_JWT_TOKEN}`
      }
    })

    if (!tochkaResponse.ok) {
      return { success: false, message: 'Ошибка проверки статуса' }
    }

    const tochkaData = await tochkaResponse.json()
    const operationStatus = tochkaData.Data?.Operation?.[0]?.status

    if (operationStatus === 'APPROVED') {
      // Начисляем кредиты
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: { increment: payment.credits }
        }
      })

      // Обновляем статус платежа
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'succeeded',
          paidAt: new Date()
        }
      })

      return { success: true, credits: payment.credits }
    }

    return { success: false, message: `Статус платежа: ${operationStatus}` }
  } catch (error) {
    console.error('Payment check error:', error)
    return { success: false, message: 'Ошибка проверки платежа' }
  }
}

export default async function PaymentSuccessPage() {
  const session = await getServerSession(authOptions)
  
  let credits = null
  let error = null

  if (session?.user?.id) {
    const result = await checkAndConfirmPayment(session.user.id)
    if (result.success) {
      credits = result.credits
    } else {
      error = result.message
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center">
          <div className="mb-8">
            <div className={`w-16 h-16 ${credits ? 'bg-green-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${credits ? 'text-green-600' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={credits ? "M5 13l4 4L19 7" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {credits ? 'Платеж успешно завершен!' : 'Оплата получена!'}
            </h1>
            {credits && (
              <p className="text-lg text-gray-600 mb-4">
                <strong>{credits} кредитов</strong> добавлено на ваш счет!
              </p>
            )}
            {error && (
              <p className="text-md text-yellow-600 mb-4">
                {error}
              </p>
            )}
            <p className="text-md text-gray-500 mb-8">
              {credits 
                ? 'Теперь вы можете использовать их для генерации изображений.'
                : 'Обновите страницу через несколько секунд, если кредиты еще не отображаются.'}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-green-800 mb-2">
              Что дальше?
            </h2>
            <ul className="text-left text-green-700 space-y-2">
              <li>• Кредиты {credits ? 'уже' : 'автоматически добавятся'} на вашем счету</li>
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
