'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/Footer'

interface Payment {
  id: string
  userId: string
  amount: number
  credits: number
  status: string
  paymentMethod: string | null
  paymentId: string | null
  description: string | null
  promoCode: string | null
  discountAmount: number | null
  createdAt: string
  updatedAt: string
  paidAt: string | null
  user: {
    email: string | null
    name: string | null
    credits: number
  }
}

interface Stats {
  status: string
  _count: number
  _sum: {
    amount: number | null
  }
}

export default function AdminPaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Stats[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user?.email) {
      router.push('/')
      return
    }

    loadPayments()
  }, [session, status, page, router])

  const loadPayments = async () => {
    try {
      const response = await fetch(`/api/admin/payments?page=${page}&limit=50`)
      if (!response.ok) throw new Error('Failed to load')
      
      const data = await response.json()
      setPayments(data.payments)
      setStats(data.stats)
      setTotal(data.pagination.total)
      setPages(data.pagination.pages)
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl text-gray-600">Загрузка...</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'Успешно'
      case 'pending':
        return 'В обработке'
      case 'failed':
        return 'Ошибка'
      case 'canceled':
        return 'Отменен'
      default:
        return status
    }
  }

  const totalAmount = stats.reduce((sum, s) => sum + (s._sum.amount || 0), 0)
  const succeededAmount = stats.find(s => s.status === 'succeeded')?._sum.amount || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">🔧 Админ-панель</h1>
              <div className="flex gap-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">Пользователи</Link>
                <Link href="/admin/payments" className="text-purple-600 font-medium">Платежи</Link>
                <Link href="/admin/promo" className="text-gray-600 hover:text-gray-900">Промокоды</Link>
                <Link href="/admin/payouts" className="text-gray-600 hover:text-gray-900">Выплаты</Link>
              </div>
            </div>
            <Link href="/" className="text-purple-600 hover:text-purple-700">
              ← На главную
            </Link>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Платежи
          </h2>
          <p className="text-gray-600">
            Всего платежей: {total}
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium">Всего платежей</div>
            <div className="text-2xl font-bold text-blue-900">{total}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Успешных</div>
            <div className="text-2xl font-bold text-green-900">
              {stats.find(s => s.status === 'succeeded')?._count || 0}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-medium">В обработке</div>
            <div className="text-2xl font-bold text-yellow-900">
              {stats.find(s => s.status === 'pending')?._count || 0}
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium">Успешных платежей</div>
            <div className="text-2xl font-bold text-purple-900">
              {succeededAmount.toFixed(0)} ₽
            </div>
          </div>
        </div>

        {/* Таблица платежей */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Кредиты</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Метод</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Промокод</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID операции</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {payment.user.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.amount} ₽
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {payment.credits}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentMethod || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {payment.promoCode || '-'}
                      {payment.discountAmount && (
                        <span className="text-green-600 ml-1">
                          (-{payment.discountAmount}₽)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                      {payment.paymentId ? payment.paymentId.substring(0, 20) + '...' : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Пагинация */}
        {pages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Назад
            </button>
            <span className="px-4 py-2 text-gray-700">
              Страница {page} из {pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50"
            >
              Вперед
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

