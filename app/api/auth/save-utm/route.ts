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
      console.log('🔍 Looking for referrer with code:', referralCode.toUpperCase())
      const referrer = await prisma.user.findUnique({
        where: { referralCode: referralCode.toUpperCase() },
        select: { id: true, email: true }
      })
      if (referrer) {
        referrerId = referrer.id
        console.log('✅ Referrer found:', referrer.email, 'ID:', referrer.id)
      } else {
        console.log('⚠️ Referrer not found for code:', referralCode.toUpperCase())
      }
    }

    // Сохраняем UTM и реферальный код во временной таблице для новых пользователей
    // Это будет применено при создании пользователя в lib/auth.ts
    const utmDataToSave = {
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      referrerId
    }
    console.log('💾 Saving UTM data for email:', email, utmDataToSave)
    
    await prisma.verificationToken.upsert({
      where: {
        identifier_token: {
          identifier: `utm:${email}`,
          token: 'utm-data'
        }
      },
      create: {
        identifier: `utm:${email}`,
        token: JSON.stringify(utmDataToSave),
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
      },
      update: {
        token: JSON.stringify(utmDataToSave),
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

