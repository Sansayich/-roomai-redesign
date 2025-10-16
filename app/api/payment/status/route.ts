import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

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

    // Если есть paymentId от Точка Банка, проверяем статус
    if (payment.paymentId) {
      try {
        const tochkaResponse = await fetch(
          `https://enter.tochka.com/uapi/pay/v1.0/sites/${process.env.TOCHKA_SITE_UID}/payments/${payment.paymentId}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${process.env.TOCHKA_JWT_TOKEN}`
            }
          }
        )

        if (tochkaResponse.ok) {
          const tochkaData = await tochkaResponse.json()
          
          // Обновляем статус в базе данных если изменился
          const newStatus = tochkaData.Data.status.value.toLowerCase()
          if (newStatus !== payment.status) {
            await prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: newStatus,
                paidAt: newStatus === 'completed' ? new Date() : null
              }
            })

            // Если платеж успешен, начисляем кредиты
            if (newStatus === 'completed' && payment.status !== 'completed') {
              await prisma.user.update({
                where: { id: payment.userId },
                data: {
                  credits: {
                    increment: payment.credits
                  }
                }
              })
            }
          }

          return NextResponse.json({
            paymentId: payment.id,
            status: newStatus,
            amount: payment.amount,
            credits: payment.credits,
            description: payment.description,
            createdAt: payment.createdAt,
            paidAt: payment.paidAt
          })
        }
      } catch (error) {
        console.error('Error checking payment status with Точка Банк:', error)
      }
    }

    // Возвращаем данные из базы данных
    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      credits: payment.credits,
      description: payment.description,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt
    })

  } catch (error) {
    console.error('Payment status check error:', error)
    return NextResponse.json({ error: 'Ошибка проверки статуса платежа' }, { status: 500 })
  }
}
