import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Получить все запросы на выплату
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payouts = await prisma.payoutRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            referralCode: true,
            referralBalance: true,
          }
        }
      }
    })

    return NextResponse.json({ payouts })
  } catch (error) {
    console.error('Error fetching payouts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Обновить статус выплаты (одобрить или отклонить)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, status } = await request.json()

    if (!id || !status || !['paid', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Получаем запрос на выплату
    const payoutRequest = await prisma.payoutRequest.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!payoutRequest) {
      return NextResponse.json(
        { error: 'Payout request not found' },
        { status: 404 }
      )
    }

    if (payoutRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Payout request already processed' },
        { status: 400 }
      )
    }

    // Обновляем в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем статус запроса
      await tx.payoutRequest.update({
        where: { id },
        data: {
          status,
          processedAt: new Date(),
        }
      })

      // Если выплата одобрена, вычитаем сумму из баланса пользователя
      if (status === 'paid') {
        await tx.user.update({
          where: { id: payoutRequest.userId },
          data: {
            referralBalance: {
              decrement: payoutRequest.amount
            }
          }
        })
      }
      // Если отклонено, баланс остается без изменений
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing payout:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

