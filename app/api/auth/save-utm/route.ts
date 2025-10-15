import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, referralCode } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Проверяем существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Находим реферера по коду
    let referrerId = null
    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
        select: { id: true }
      })
      if (referrer) {
        referrerId = referrer.id
      }
    }

    // Сохраняем UTM и реферальный код только для новых пользователей (или если они еще не установлены)
    if (user && !user.utmSource) {
      await prisma.user.update({
        where: { email },
        data: {
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmContent: utmContent || null,
          utmTerm: utmTerm || null,
          ...(referrerId && !user.referredById ? { referredById: referrerId } : {}),
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Save UTM error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

