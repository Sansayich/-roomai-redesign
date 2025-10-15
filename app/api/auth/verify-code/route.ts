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

    // Ищем короткий код в БД
    const verificationCode = await prisma.shortVerificationCode.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: 'Код не найден' },
        { status: 404 }
      )
    }

    // Проверяем срок действия
    if (new Date() > verificationCode.expires) {
      // Удаляем истекший код
      await prisma.shortVerificationCode.delete({
        where: { code: code.toUpperCase() }
      })
      
      return NextResponse.json(
        { success: false, error: 'Срок действия кода истек' },
        { status: 410 }
      )
    }

    // Удаляем использованный код
    await prisma.shortVerificationCode.delete({
      where: { code: code.toUpperCase() }
    })

    // Возвращаем полный URL для редиректа
    return NextResponse.json({
      success: true,
      redirectUrl: verificationCode.fullUrl
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

