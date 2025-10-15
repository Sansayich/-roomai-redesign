import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export const dynamic = 'force-dynamic'

// Создание транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        referralBalance: true,
        referralCode: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Проверка минимальной суммы для вывода (например, 100 рублей)
    const MIN_PAYOUT_AMOUNT = 100

    if (user.referralBalance < MIN_PAYOUT_AMOUNT) {
      return NextResponse.json(
        { error: `Минимальная сумма для вывода: ${MIN_PAYOUT_AMOUNT}₽` },
        { status: 400 }
      )
    }

    // Создаем запрос на выплату
    const payoutRequest = await prisma.payoutRequest.create({
      data: {
        userId: user.id,
        amount: user.referralBalance,
        status: 'pending',
      }
    })

    // Отправляем email администратору
    const emailHtml = `
      <h2>🔔 Новый запрос на выплату реферального вознаграждения</h2>
      
      <h3>Информация о пользователе:</h3>
      <ul>
        <li><strong>ID:</strong> ${user.id}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Имя:</strong> ${user.name || 'Не указано'}</li>
        <li><strong>Реферальный код:</strong> ${user.referralCode}</li>
      </ul>
      
      <h3>Детали выплаты:</h3>
      <ul>
        <li><strong>Сумма к выплате:</strong> ${user.referralBalance.toFixed(2)}₽</li>
        <li><strong>ID запроса:</strong> ${payoutRequest.id}</li>
        <li><strong>Дата запроса:</strong> ${new Date().toLocaleString('ru-RU')}</li>
      </ul>
      
      <p>Перейдите в <a href="${process.env.NEXTAUTH_URL}/admin">админ-панель</a> для обработки запроса.</p>
    `

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: 'hello@room-gpt.ru',
        subject: `💰 Запрос на выплату от ${user.email}`,
        html: emailHtml,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Продолжаем даже если email не отправился
    }

    return NextResponse.json({ 
      success: true,
      message: 'Запрос на выплату отправлен. Мы свяжемся с вами в ближайшее время.',
      requestId: payoutRequest.id
    })
  } catch (error) {
    console.error('Error creating payout request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

