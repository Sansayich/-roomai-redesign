import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Функция для проверки подписи уведомления
function verifyNotificationSignature(data: any, signature: string, secretKey: string): boolean {
  const signatureString = [
    data.login,
    data.orderId,
    data.amount,
    data.status,
    data.transactionId || '',
    data.paymentMethod || '',
    data.paymentSystem || ''
  ].join('|')
  
  const expectedSignature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('hex')
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Получаем данные из формы
    const notificationData = {
      login: formData.get('login') as string,
      orderId: formData.get('orderId') as string,
      amount: formData.get('amount') as string,
      status: formData.get('status') as string,
      transactionId: formData.get('transactionId') as string,
      paymentMethod: formData.get('paymentMethod') as string,
      paymentSystem: formData.get('paymentSystem') as string,
      signature: formData.get('signature') as string
    }

    console.log('Webhook notification:', notificationData)

    // Проверяем подпись
    const secretKey = process.env.TOCHKA_SECRET_KEY
    if (!secretKey) {
      console.error('TOCHKA_SECRET_KEY not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    if (!verifyNotificationSignature(notificationData, notificationData.signature, secretKey)) {
      console.error('Invalid notification signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Находим платеж в базе данных
    const payment = await prisma.payment.findFirst({
      where: { paymentId: notificationData.orderId },
      include: { user: true }
    })

    if (!payment) {
      console.error('Payment not found:', notificationData.orderId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Обновляем статус платежа
    const newStatus = notificationData.status.toLowerCase()
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'success' ? new Date() : null,
        paymentMethod: notificationData.paymentMethod || null
      }
    })

    // Если платеж успешен, начисляем кредиты
    if (newStatus === 'success') {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: payment.credits
          }
        }
      })

      // Обрабатываем реферальную программу
      if (payment.user.referredById) {
        const referralAmount = payment.amount * 0.4 // 40% от суммы платежа
        
        // Создаем начисление для реферера
        await prisma.referralEarning.create({
          data: {
            userId: payment.user.referredById,
            referralId: payment.userId,
            referralEmail: payment.user.email,
            amount: referralAmount,
            orderAmount: payment.amount,
            percentage: 40,
            availableAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Через 7 дней
          }
        })

        // Обновляем баланс реферера
        await prisma.user.update({
          where: { id: payment.user.referredById },
          data: {
            referralBalance: {
              increment: referralAmount
            }
          }
        })
      }

      console.log(`Payment ${notificationData.orderId} completed successfully. Credits added: ${payment.credits}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
