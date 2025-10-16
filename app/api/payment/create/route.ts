import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Функция для генерации уникального ID
function generatePaymentUid(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { planId, promoCode } = await request.json()

    // Определяем тарифные планы
    const plans = {
      'mini': { credits: 10, price: 99 },
      'basic': { credits: 40, price: 299 },
      'pro': { credits: 100, price: 699 }
    }

    const plan = plans[planId as keyof typeof plans]
    if (!plan) {
      return NextResponse.json({ error: 'Неверный план' }, { status: 400 })
    }

    let discountAmount = 0
    let finalPrice = plan.price

    // Проверяем промокод если указан
    if (promoCode) {
      const promo = await prisma.promo.findUnique({
        where: { code: promoCode }
      })

      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date())) {
        if (promo.discountPercent) {
          discountAmount = Math.round(plan.price * promo.discountPercent / 100)
        } else if (promo.discountAmount) {
          discountAmount = promo.discountAmount
        }
        finalPrice = Math.max(0, plan.price - discountAmount)
      }
    }

    // Генерируем уникальный ID заказа
    const orderId = generatePaymentUid()

    // Создаем платеж в базе данных
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: finalPrice,
        credits: plan.credits,
        status: 'pending',
        description: `Покупка ${plan.credits} кредитов`,
        promoCode: promoCode || null,
        discountAmount: discountAmount > 0 ? discountAmount : null,
        paymentId: orderId
      }
    })

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Подготавливаем данные для стандартной формы Точка Банка
    const orderData = {
      login: process.env.TOCHKA_LOGIN,
      orderId: orderId,
      amount: finalPrice.toFixed(2),
      description: `Покупка ${plan.credits} кредитов для RoomGPT`,
      returnUrl: `${process.env.NEXTAUTH_URL}/payment/success?paymentId=${payment.id}`,
      failUrl: `${process.env.NEXTAUTH_URL}/payment/fail?paymentId=${payment.id}`,
      notifyUrl: `${process.env.NEXTAUTH_URL}/api/payment/webhook`,
      customerEmail: user.email || '',
      customerPhone: user.name || '',
      customerName: user.name || 'Пользователь RoomGPT'
    }

    // Создаем подпись заказа
    const secretKey = process.env.TOCHKA_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ error: 'Не настроен секретный ключ Точка Банка' }, { status: 500 })
    }

    // Формируем строку для подписи (все поля кроме signature)
    const signatureString = [
      orderData.login,
      orderData.orderId,
      orderData.amount,
      orderData.description,
      orderData.returnUrl,
      orderData.failUrl,
      orderData.notifyUrl,
      orderData.customerEmail,
      orderData.customerPhone,
      orderData.customerName
    ].join('|')

    const signature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('hex')

    // Возвращаем данные для создания формы
    const responseData = {
      paymentId: payment.id,
      orderId: orderId,
      amount: finalPrice,
      credits: plan.credits,
      description: payment.description,
      formData: {
        ...orderData,
        signature: signature
      },
      formUrl: 'https://enter.tochka.com/payment' // URL стандартной формы Точка Банка
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
  }
}
