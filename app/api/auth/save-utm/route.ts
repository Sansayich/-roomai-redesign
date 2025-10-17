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

    // Сохраняем UTM и реферальный код во временной таблице для новых пользователей
    // Это будет применено при создании пользователя в lib/auth.ts
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: `utm:${email}`,
          token: 'utm-data'
        }
      },
      create: {
        identifier: `utm:${email}`,
        token: JSON.stringify({
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          referrerId
        }),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
      },
      update: {
        token: JSON.stringify({
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm,
          referrerId
        }),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    // Если пользователь уже существует, обновляем его данные
    const user = await prisma.user.findUnique({
      where: { email }
    })

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

