import { prisma } from './prisma'

/**
 * Начислить реферальное вознаграждение
 * Средства станут доступны через 7 дней (период возврата по оферте)
 */
export async function addReferralEarning(
  userId: string,
  referralId: string,
  referralEmail: string,
  orderAmount: number,
  percentage: number = 40
) {
  const earnAmount = orderAmount * (percentage / 100)
  
  // Дата доступности = текущая дата + 7 дней (срок возврата)
  const availableAt = new Date()
  availableAt.setDate(availableAt.getDate() + 7)
  
  await prisma.$transaction([
    // Создаем запись о начислении
    prisma.referralEarning.create({
      data: {
        userId,
        referralId,
        referralEmail,
        amount: earnAmount,
        orderAmount,
        percentage,
        availableAt,
      }
    }),
    // Обновляем баланс (даже если недоступен для вывода, показываем в интерфейсе)
    prisma.user.update({
      where: { id: userId },
      data: {
        referralBalance: {
          increment: earnAmount
        }
      }
    })
  ])
  
  return earnAmount
}

/**
 * Вычесть реферальное вознаграждение при возврате средств
 * Используется только если возврат произошел в течение 7 дней (пока на холде)
 */
export async function reverseReferralEarning(
  referralEmail: string,
  refundAmount: number
) {
  const now = new Date()
  
  // Находим все начисления по этому рефералу, которые еще на холде
  const earnings = await prisma.referralEarning.findMany({
    where: {
      referralEmail,
      isReversed: false,
      availableAt: {
        gt: now // Только те, что еще не стали доступны
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  let remainingRefund = refundAmount
  const reversedEarnings: string[] = []
  
  for (const earning of earnings) {
    if (remainingRefund <= 0) break
    
    const refundRatio = Math.min(remainingRefund / earning.orderAmount, 1)
    const amountToReverse = earning.amount * refundRatio
    
    reversedEarnings.push(earning.id)
    
    // Вычитаем из баланса партнера
    await prisma.user.update({
      where: { id: earning.userId },
      data: {
        referralBalance: {
          decrement: amountToReverse
        }
      }
    })
    
    remainingRefund -= earning.orderAmount * refundRatio
  }
  
  // Помечаем начисления как отмененные
  if (reversedEarnings.length > 0) {
    await prisma.referralEarning.updateMany({
      where: {
        id: { in: reversedEarnings }
      },
      data: {
        isReversed: true
      }
    })
  }
}

/**
 * Получить доступный для вывода баланс
 * Учитывает только начисления старше 7 дней
 */
export async function getAvailableBalance(userId: string): Promise<number> {
  const now = new Date()
  
  const result = await prisma.referralEarning.aggregate({
    where: {
      userId,
      isReversed: false,
      availableAt: {
        lte: now // Только те, у которых availableAt уже прошла
      }
    },
    _sum: {
      amount: true
    }
  })
  
  return result._sum.amount || 0
}

/**
 * Получить средства на холде (еще недоступны для вывода)
 */
export async function getPendingBalance(userId: string): Promise<number> {
  const now = new Date()
  
  const result = await prisma.referralEarning.aggregate({
    where: {
      userId,
      isReversed: false,
      availableAt: {
        gt: now // Только те, у которых availableAt еще не наступила
      }
    },
    _sum: {
      amount: true
    }
  })
  
  return result._sum.amount || 0
}

