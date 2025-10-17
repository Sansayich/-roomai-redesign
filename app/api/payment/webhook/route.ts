import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Получаем JSON данные от Точка Банка
    const webhookData = await request.json()
    
    console.log('Webhook received from Tochka Bank:', JSON.stringify(webhookData))

    // Структура webhook от Точка Банка Open API:
    // {
    //   "Data": {
    //     "operationId": "uuid",
    //     "status": "APPROVED" | "DECLINED" | "CANCELED",
    //     "amount": 99.0,
    //     "paymentType": "card" | "sbp",
    //     ...
    //   }
    // }

    const { Data } = webhookData
    
    if (!Data || !Data.operationId) {
      console.error('Invalid webhook data structure')
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Находим платеж в базе данных по operationId
    const payment = await prisma.payment.findFirst({
      where: { paymentId: Data.operationId },
      include: { user: true }
    })

    if (!payment) {
      console.error('Payment not found:', Data.operationId)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Проверяем, не обработан ли уже этот платеж
    if (payment.status === 'succeeded') {
      console.log('Payment already processed:', Data.operationId)
      return NextResponse.json({ success: true, message: 'Already processed' })
    }

    // Маппим статусы Точка Банка на наши
    let newStatus = 'pending'
    if (Data.status === 'APPROVED') {
      newStatus = 'succeeded'
    } else if (Data.status === 'DECLINED') {
      newStatus = 'failed'
    } else if (Data.status === 'CANCELED') {
      newStatus = 'canceled'
    }

    // Обновляем статус платежа
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: newStatus === 'succeeded' ? new Date() : null,
        paymentMethod: Data.paymentType || null
      }
    })

    // Если платеж успешен, начисляем кредиты
    if (newStatus === 'succeeded') {
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

      console.log(`Payment ${Data.operationId} completed successfully. Credits added: ${payment.credits}`)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
