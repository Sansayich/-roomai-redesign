import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Получить все промокоды
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const promos = await prisma.promo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ promos })
  } catch (error) {
    console.error('Error fetching promos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Создать новый промокод
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code, discountPercent, discountAmount, usageLimit, expiresAt } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    if (!discountPercent && !discountAmount) {
      return NextResponse.json(
        { error: 'Either discountPercent or discountAmount is required' },
        { status: 400 }
      )
    }

    const promo = await prisma.promo.create({
      data: {
        code: code.toUpperCase(),
        discountPercent,
        discountAmount,
        usageLimit,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      }
    })

    return NextResponse.json({ promo })
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      )
    }
    console.error('Error creating promo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Обновить промокод (активность)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id, isActive } = await request.json()

    const promo = await prisma.promo.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ promo })
  } catch (error) {
    console.error('Error updating promo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

