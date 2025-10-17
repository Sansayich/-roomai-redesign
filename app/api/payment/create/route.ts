import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Создаем платеж в базе данных
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: finalPrice,
        credits: plan.credits,
        status: 'pending',
        description: `Покупка ${plan.credits} кредитов`,
        promoCode: promoCode || null,
        discountAmount: discountAmount > 0 ? discountAmount : null
      }
    })

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    // Проверяем наличие необходимых переменных окружения
    const customerCode = process.env.TOCHKA_CUSTOMER_CODE
    const jwtToken = process.env.TOCHKA_JWT_TOKEN

    if (!customerCode || !jwtToken) {
      return NextResponse.json({ 
        error: 'Не настроены учетные данные Точка Банка' 
      }, { status: 500 })
    }

    // Создаем запрос к API Точка Банка для создания платежа
    const tochkaApiUrl = 'https://enter.tochka.com/uapi/acquiring/v1.0/payments'
    
    const paymentData = {
      Data: {
        customerCode: customerCode,
        amount: finalPrice.toString(),
        purpose: `Покупка ${plan.credits} кредитов для RoomGPT`,
        paymentMode: ['card', 'sbp'],
        redirectUrl: `${process.env.NEXTAUTH_URL}/payment/success?paymentId=${payment.id}`
      }
    }

    // Отправляем запрос к API Точка Банка
    const tochkaResponse = await fetch(tochkaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      },
      body: JSON.stringify(paymentData)
    })

    if (!tochkaResponse.ok) {
      const errorText = await tochkaResponse.text()
      console.error('Tochka API error:', errorText)
      return NextResponse.json({ 
        error: 'Ошибка создания платежа в Точка Банке' 
      }, { status: 500 })
    }

    const tochkaData = await tochkaResponse.json()

    // Обновляем платеж с данными от Точка Банка
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        paymentId: tochkaData.Data.operationId,
        paymentUrl: tochkaData.Data.paymentLink
      }
    })

    // Возвращаем данные для перенаправления пользователя
    const responseData = {
      paymentId: payment.id,
      operationId: tochkaData.Data.operationId,
      paymentUrl: tochkaData.Data.paymentLink,
      amount: finalPrice,
      credits: plan.credits,
      description: payment.description
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
  }
}
