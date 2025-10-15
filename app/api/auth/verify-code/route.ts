import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Код не указан' },
        { status: 400 }
      )
    }

    // Ищем короткий код в таблице VerificationToken
    const identifier = `short:${code.toUpperCase()}`
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { identifier }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Код не найден' },
        { status: 404 }
      )
    }

    // Проверяем срок действия
    if (new Date() > verificationToken.expires) {
      // Удаляем истекший код
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token
          }
        }
      })
      
      return NextResponse.json(
        { success: false, error: 'Срок действия кода истек' },
        { status: 410 }
      )
    }

    // Получаем полный URL
    const fullUrl = verificationToken.token

    // Удаляем использованный код
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token
        }
      }
    })

    // Возвращаем полный URL для редиректа
    return NextResponse.json({
      success: true,
      redirectUrl: fullUrl
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

