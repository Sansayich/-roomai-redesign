import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, message: 'Необходима авторизация' }, { status: 401 })
    }

    // Находим последний платеж пользователя (любой статус)
    const payment = await prisma.payment.findFirst({
      where: { 
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!payment) {
      return NextResponse.json({ 
        success: false, 
        message: 'Платежей не найдено' 
      }, { status: 404 })
    }

    console.log('Checking last payment:', payment.id, 'status:', payment.status, 'operationId:', payment.paymentId)

    // ВАЖНО: Если платеж уже обработан, сразу возвращаем успех (идемпотентность)
    if (payment.status === 'succeeded') {
      console.log('✅ Payment already processed:', payment.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Кредиты уже начислены', 
        credits: payment.credits,
        alreadyProcessed: true
      })
    }

    // Если платеж не pending, значит он отменен или отклонен
    if (payment.status !== 'pending') {
      return NextResponse.json({ 
        success: false, 
        message: `Платеж в статусе: ${payment.status}` 
      })
    }

    // Проверяем статус платежа через API Точка Банка
    if (!payment.paymentId) {
      return NextResponse.json({ 
        success: false, 
        message: 'У платежа нет operationId' 
      }, { status: 400 })
    }

    const jwtToken = process.env.TOCHKA_JWT_TOKEN
    if (!jwtToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'Не настроен JWT токен' 
      }, { status: 500 })
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
      console.error('Tochka API error:', tochkaResponse.status, errorText)
      return NextResponse.json({ 
        success: false,
        message: 'Ошибка проверки статуса платежа' 
      }, { status: 500 })
    }

    const tochkaData = await tochkaResponse.json()
    console.log('Tochka API response:', JSON.stringify(tochkaData))
    
    // Статус находится в Data.Operation[0].status
    if (!tochkaData.Data?.Operation?.[0]) {
      console.error('Invalid Tochka response structure:', tochkaData)
      return NextResponse.json({ 
        success: false,
        message: 'Неверная структура ответа от Точка Банка'
      }, { status: 500 })
    }
    
    const operationStatus = tochkaData.Data.Operation[0].status
    console.log('Payment status from Tochka:', operationStatus, 'for payment:', payment.id)

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
        select: { referredById: true, email: true }
      })

      if (user?.referredById) {
        // Рассчитываем комиссию реферала (40%)
        const referralEarning = Math.floor(payment.amount * 0.4)
        const availableAt = new Date()
        availableAt.setDate(availableAt.getDate() + 7) // 7 дней холд

        await prisma.referralEarning.create({
          data: {
            userId: user.referredById,
            referralId: payment.userId,
            referralEmail: user.email,
            amount: referralEarning,
            orderAmount: payment.amount,
            percentage: 40,
            availableAt: availableAt
          }
        })

        // Обновляем баланс реферера
        await prisma.user.update({
          where: { id: user.referredById },
          data: {
            referralBalance: {
              increment: referralEarning
            }
          }
        })
      }

      console.log(`✅ Payment ${payment.id} confirmed. ${payment.credits} credits added to user ${payment.userId}`)
      
      return NextResponse.json({
        success: true,
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
        message: 'Платеж отклонен'
      }, { status: 400 })
    } else {
      // Статус еще обрабатывается
      return NextResponse.json({
        success: false,
        message: 'Платеж в обработке'
      })
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Ошибка подтверждения платежа' 
    }, { status: 500 })
  }
}

