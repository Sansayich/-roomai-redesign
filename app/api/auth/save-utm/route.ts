import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, utmSource, utmMedium, utmCampaign, utmContent, utmTerm } = await req.json()

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

    // Сохраняем UTM только для новых пользователей (или если они еще не установлены)
    if (user && !user.utmSource) {
      await prisma.user.update({
        where: { email },
        data: {
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
          utmContent: utmContent || null,
          utmTerm: utmTerm || null,
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

