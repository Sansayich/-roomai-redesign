'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type PayoutRequest = {
  id: string
  amount: number
  status: string
  createdAt: string
  processedAt: string | null
  user: {
    id: string
    email: string
    name: string | null
    referralCode: string | null
    referralBalance: number
  }
}

export default function AdminPayoutsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payouts, setPayouts] = useState<PayoutRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      checkAdminAccess()
    }
  }, [session])

  const checkAdminAccess = async () => {
    try {
      const res = await fetch('/api/admin/check')
      if (!res.ok) {
        router.push('/')
        return
      }
      fetchPayouts()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/admin/payouts')
      if (res.ok) {
        const data = await res.json()
        setPayouts(data.payouts)
      }
    } catch (error) {
      console.error('Error fetching payouts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcessPayout = async (id: string, action: 'paid' | 'rejected') => {
    if (!confirm(`Вы уверены, что хотите ${action === 'paid' ? 'одобрить' : 'отклонить'} этот запрос?`)) {
      return
    }

    setProcessingId(id)
    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action })
      })

      if (res.ok) {
        // Обновляем список
        fetchPayouts()
      } else {
        alert('Ошибка при обработке запроса')
      }
    } catch (error) {
      console.error('Error processing payout:', error)
      alert('Ошибка при обработке запроса')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает'
      case 'paid':
        return 'Выплачено'
      case 'rejected':
        return 'Отклонено'
      default:
        return status
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  const pendingPayouts = payouts.filter(p => p.status === 'pending')
  const processedPayouts = payouts.filter(p => p.status !== 'pending')

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
                <Link href="/admin/promo" className="text-gray-600 hover:text-gray-900">Промокоды</Link>
                <Link href="/admin/payouts" className="text-purple-600 font-medium">Выплаты</Link>
              </div>
            </div>
            <Link href="/" className="text-purple-600 hover:text-purple-700">
              ← На главную
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Ожидают обработки</div>
            <div className="text-3xl font-bold text-yellow-600">{pendingPayouts.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Сумма к выплате</div>
            <div className="text-3xl font-bold text-purple-600">
              {pendingPayouts.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}₽
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Всего обработано</div>
            <div className="text-3xl font-bold text-gray-900">{processedPayouts.length}</div>
          </div>
        </div>

        {/* Ожидающие выплаты */}
        {pendingPayouts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">⏳ Ожидают обработки</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Реф. код</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Баланс</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payout.createdAt).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{payout.user.email}</div>
                        {payout.user.name && (
                          <div className="text-gray-500">{payout.user.name}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                          {payout.user.referralCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {payout.amount.toFixed(2)}₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payout.user.referralBalance.toFixed(2)}₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleProcessPayout(payout.id, 'paid')}
                          disabled={processingId === payout.id}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          ✓ Выплачено
                        </button>
                        <button
                          onClick={() => handleProcessPayout(payout.id, 'rejected')}
                          disabled={processingId === payout.id}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          ✗ Отклонить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* История выплат */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">📋 История выплат</h2>
          </div>
          {processedPayouts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Запрошено</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Обработано</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payout.createdAt).toLocaleString('ru-RU')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payout.processedAt 
                          ? new Date(payout.processedAt).toLocaleString('ru-RU')
                          : '—'
                        }
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">{payout.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {payout.amount.toFixed(2)}₽
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                          {getStatusText(payout.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">
              Нет обработанных выплат
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

