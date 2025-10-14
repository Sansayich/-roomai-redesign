import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
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

    const { userId, credits } = await req.json()

    if (!userId || typeof credits !== 'number' || credits <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: credits
        }
      }
    })

    return NextResponse.json({ 
      success: true,
      newCredits: user.credits 
    })
  } catch (error) {
    console.error('Admin add credits error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

