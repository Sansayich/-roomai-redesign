import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      )
    }

    // Ищем промокод
    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Промокод не найден' },
        { status: 404 }
      )
    }

    // Проверяем активность
    if (!promo.isActive) {
      return NextResponse.json(
        { error: 'Промокод неактивен' },
        { status: 400 }
      )
    }

    // Проверяем срок действия
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Срок действия промокода истек' },
        { status: 400 }
      )
    }

    // Проверяем лимит использований
    if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
      return NextResponse.json(
        { error: 'Промокод исчерпан' },
        { status: 400 }
      )
    }

    // Возвращаем информацию о скидке
    return NextResponse.json({
      valid: true,
      discountPercent: promo.discountPercent,
      discountAmount: promo.discountAmount,
      code: promo.code
    })

  } catch (error) {
    console.error('Error validating promo code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

