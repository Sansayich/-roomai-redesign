import { prisma } from './prisma'

/**
 * Начислить реферальное вознаграждение
 * Средства станут доступны через 14 дней (период возврата)
 */
export async function addReferralEarning(
  userId: string,
  referralId: string,
  referralEmail: string,
  orderAmount: number,
  percentage: number = 40
) {
  const earnAmount = orderAmount * (percentage / 100)
  
  // Дата доступности = текущая дата + 14 дней
  const availableAt = new Date()
  availableAt.setDate(availableAt.getDate() + 14)
  
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
 * Может привести к отрицательному балансу
 */
export async function reverseReferralEarning(
  referralEmail: string,
  refundAmount: number
) {
  // Находим все начисления по этому рефералу
  const earnings = await prisma.referralEarning.findMany({
    where: {
      referralEmail,
      isReversed: false, // Только те, что еще не были отменены
    },
    orderBy: {
      createdAt: 'desc' // Сначала новые
    }
  })
  
  let remainingRefund = refundAmount
  const reversedEarnings: string[] = []
  
  for (const earning of earnings) {
    if (remainingRefund <= 0) break
    
    // Сколько нужно вычесть из этого начисления
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
 * Учитывает только начисления старше 14 дней
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
  
  const availableEarnings = result._sum.amount || 0
  
  // Получаем текущий баланс пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralBalance: true }
  })
  
  // Если баланс отрицательный, доступно 0
  // Если баланс положительный, но меньше доступных начислений, показываем баланс
  const currentBalance = user?.referralBalance || 0
  
  if (currentBalance < 0) return 0
  
  return Math.min(currentBalance, availableEarnings)
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

