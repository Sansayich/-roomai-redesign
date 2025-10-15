import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получаем данные пользователя с реферальным кодом
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        referralCode: true,
        referralBalance: true,
        referrals: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          }
        },
        earnings: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 20,
          select: {
            id: true,
            amount: true,
            orderAmount: true,
            percentage: true,
            createdAt: true,
          }
        },
        payoutRequests: {
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            processedAt: true,
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Если у пользователя нет реферального кода, создаем его
    if (!user.referralCode) {
      const referralCode = await generateReferralCode()
      
      await prisma.user.update({
        where: { id: session.user.id },
        data: { referralCode }
      })

      user.referralCode = referralCode
    }

    // Подсчитываем общую статистику
    const totalEarnings = user.earnings.reduce((sum, earning) => sum + earning.amount, 0)
    const totalReferrals = user.referrals.length

    return NextResponse.json({
      referralCode: user.referralCode,
      referralBalance: user.referralBalance,
      totalEarnings,
      totalReferrals,
      referrals: user.referrals,
      earnings: user.earnings,
      payoutRequests: user.payoutRequests,
    })
  } catch (error) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Генерация уникального реферального кода
async function generateReferralCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  // Генерируем код до тех пор, пока не найдем уникальный
  let isUnique = false
  
  while (!isUnique) {
    code = ''
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    const existing = await prisma.user.findUnique({
      where: { referralCode: code }
    })
    
    if (!existing) {
      isUnique = true
    }
  }
  
  return code
}

