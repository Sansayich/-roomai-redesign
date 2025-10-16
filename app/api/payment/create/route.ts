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

    // Создаем платеж через API Точка Банка
    const tochkaLogin = process.env.TOCHKA_LOGIN
    const tochkaSecretKey = process.env.TOCHKA_SECRET_KEY
    
    if (!tochkaLogin || !tochkaSecretKey) {
      return NextResponse.json({ error: 'Не настроены данные Точка Банка' }, { status: 500 })
    }

    // Данные для API Точка Банка
    const paymentData = {
      amount: finalPrice * 100, // Сумма в копейках
      currency: 'RUB',
      customerCode: orderId,
      purpose: `Покупка ${plan.credits} кредитов для RoomGPT`,
      redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success?paymentId=${payment.id}`,
      failRedirectUrl: `${process.env.NEXTAUTH_URL}/payment/fail?paymentId=${payment.id}`,
      client: {
        email: user.email || 'noreply@room-gpt.ru',
        name: user.name || 'Пользователь RoomGPT'
      },
      items: [{
        name: `${plan.credits} кредитов`,
        amount: finalPrice * 100,
        quantity: 1
      }]
    }

    // Создаем платеж через API
    const apiResponse = await fetch('https://enter.tochka.com/uapi/pay/v1/sites/' + tochkaLogin + '/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + tochkaSecretKey
      },
      body: JSON.stringify(paymentData)
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('Tochka API error:', errorText)
      return NextResponse.json({ error: 'Ошибка создания платежа в Точка Банке' }, { status: 500 })
    }

    const apiResult = await apiResponse.json()

    // Обновляем платеж с данными от Точка Банка
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentId: apiResult.paymentUid,
        paymentUrl: apiResult.paymentUrl
      }
    })

    // Возвращаем данные для редиректа
    const responseData = {
      paymentId: payment.id,
      orderId: orderId,
      amount: finalPrice,
      credits: plan.credits,
      description: payment.description,
      paymentUrl: apiResult.paymentUrl // URL для редиректа на оплату
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
  }
}
