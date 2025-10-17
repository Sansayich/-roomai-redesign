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

    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Не указан ID платежа' }, { status: 400 })
    }

    // Находим платеж в базе данных
    const payment = await prisma.payment.findFirst({
      where: { 
        id: paymentId,
        userId: session.user.id 
      }
    })

    if (!payment) {
      return NextResponse.json({ error: 'Платеж не найден' }, { status: 404 })
    }

    // Если платеж уже обработан, возвращаем успех
    if (payment.status === 'succeeded') {
      return NextResponse.json({
        success: true,
        status: 'succeeded',
        credits: payment.credits,
        message: 'Кредиты уже начислены'
      })
    }

    // Проверяем статус платежа через API Точка Банка
    if (!payment.paymentId) {
      return NextResponse.json({ error: 'У платежа нет operationId' }, { status: 400 })
    }

    const jwtToken = process.env.TOCHKA_JWT_TOKEN
    if (!jwtToken) {
      return NextResponse.json({ error: 'Не настроен JWT токен' }, { status: 500 })
    }

    // Получаем статус операции из Точка Банка
    const tochkaApiUrl = `https://enter.tochka.com/uapi/acquiring/v1.0/payments/${payment.paymentId}`
    
    const tochkaResponse = await fetch(tochkaApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    })

    if (!tochkaResponse.ok) {
      const errorText = await tochkaResponse.text()
      console.error('Tochka API error:', errorText)
      return NextResponse.json({ 
        error: 'Ошибка проверки статуса платежа' 
      }, { status: 500 })
    }

    const tochkaData = await tochkaResponse.json()
    
    // Статус находится в Data.Operation[0].status
    if (!tochkaData.Data?.Operation?.[0]) {
      return NextResponse.json({ 
        error: 'Неверная структура ответа от Точка Банка' 
      }, { status: 500 })
    }
    
    const operationStatus = tochkaData.Data.Operation[0].status

    // Обновляем статус платежа
    if (operationStatus === 'APPROVED') {
      // Начисляем кредиты пользователю
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          credits: {
            increment: payment.credits
          }
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

      // Обрабатываем реферальную программу если есть
      const user = await prisma.user.findUnique({
        where: { id: payment.userId },
        select: { referredBy: true }
      })

      if (user?.referredBy) {
        // Рассчитываем комиссию реферала (40%)
        const referralEarning = Math.floor(payment.amount * 0.4)
        const releaseDate = new Date()
        releaseDate.setDate(releaseDate.getDate() + 7) // 7 дней холд

        await prisma.referralEarning.create({
          data: {
            referrerId: user.referredBy,
            referredUserId: payment.userId,
            amount: referralEarning,
            status: 'pending',
            releaseDate: releaseDate,
            paymentId: payment.id
          }
        })
      }

      return NextResponse.json({
        success: true,
        status: 'succeeded',
        credits: payment.credits,
        message: 'Кредиты успешно начислены'
      })
    } else if (operationStatus === 'DECLINED' || operationStatus === 'CANCELED') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'failed'
        }
      })

      return NextResponse.json({
        success: false,
        status: 'failed',
        message: 'Платеж отклонен'
      }, { status: 400 })
    } else {
      // Статус еще обрабатывается
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Платеж в обработке'
      })
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ error: 'Ошибка подтверждения платежа' }, { status: 500 })
  }
}

