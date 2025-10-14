import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем email админа
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalUsers, totalGenerations, newUsersToday, newUsersWeek, newUsersMonth] = await Promise.all([
      prisma.user.count(),
      prisma.generation.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneDayAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneWeekAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: oneMonthAgo
          }
        }
      })
    ])

    return NextResponse.json({
      totalUsers,
      totalGenerations,
      newUsersToday,
      newUsersWeek,
      newUsersMonth
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

