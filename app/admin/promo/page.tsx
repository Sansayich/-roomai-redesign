'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Promo = {
  id: string
  code: string
  discountPercent: number | null
  discountAmount: number | null
  usageLimit: number | null
  usageCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export default function AdminPromoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [promos, setPromos] = useState<Promo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Форма создания промокода
  const [newPromo, setNewPromo] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    discountValue: '',
    usageLimit: '',
    expiresAt: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    checkAdminAccess()
  }, [session])

  const checkAdminAccess = async () => {
    try {
      const response = await fetch('/api/admin/check')
      if (!response.ok) {
        router.push('/')
      } else {
        fetchPromos()
      }
    } catch (error) {
      router.push('/')
    }
  }

  const fetchPromos = async () => {
    try {
      const response = await fetch('/api/admin/promo')
      if (response.ok) {
        const data = await response.json()
        setPromos(data.promos || [])
      }
    } catch (error) {
      console.error('Error fetching promos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createPromo = async () => {
    try {
      const response = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromo.code.toUpperCase(),
          discountPercent: newPromo.discountType === 'percent' ? parseInt(newPromo.discountValue) : null,
          discountAmount: newPromo.discountType === 'amount' ? parseInt(newPromo.discountValue) : null,
          usageLimit: newPromo.usageLimit ? parseInt(newPromo.usageLimit) : null,
          expiresAt: newPromo.expiresAt ? new Date(newPromo.expiresAt).toISOString() : null,
        }),
      })

      if (response.ok) {
        setNewPromo({ code: '', discountType: 'percent', discountValue: '', usageLimit: '', expiresAt: '' })
        setShowCreateForm(false)
        fetchPromos()
      }
    } catch (error) {
      console.error('Error creating promo:', error)
    }
  }

  const togglePromoStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch('/api/admin/promo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      })
      fetchPromos()
    } catch (error) {
      console.error('Error toggling promo status:', error)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="text-xl font-bold text-purple-600">
                Админ-панель
              </Link>
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/admin" className="text-gray-600 hover:text-gray-900">Пользователи</Link>
                <Link href="/admin/promo" className="text-gray-900 font-medium">Промокоды</Link>
                <Link href="/admin/payouts" className="text-gray-600 hover:text-gray-900">Выплаты</Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900">← На сайт</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Промокоды</h1>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {showCreateForm ? 'Отмена' : '+ Создать промокод'}
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Новый промокод</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Код</label>
                  <input
                    type="text"
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    placeholder="PROMO2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Тип скидки</label>
                  <select
                    value={newPromo.discountType}
                    onChange={(e) => setNewPromo({ ...newPromo, discountType: e.target.value as 'percent' | 'amount' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="percent">Процент</option>
                    <option value="amount">Фикс. сумма (₽)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Размер скидки ({newPromo.discountType === 'percent' ? '%' : '₽'})
                  </label>
                  <input
                    type="number"
                    value={newPromo.discountValue}
                    onChange={(e) => setNewPromo({ ...newPromo, discountValue: e.target.value })}
                    placeholder={newPromo.discountType === 'percent' ? '20' : '100'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Лимит использований (пусто = неограниченно)
                  </label>
                  <input
                    type="number"
                    value={newPromo.usageLimit}
                    onChange={(e) => setNewPromo({ ...newPromo, usageLimit: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Действителен до (пусто = бессрочно)
                  </label>
                  <input
                    type="datetime-local"
                    value={newPromo.expiresAt}
                    onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <button
                onClick={createPromo}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Создать
              </button>
            </div>
          )}

          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Код</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Скидка</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Использовано</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Срок действия</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promos.map((promo) => (
                  <tr key={promo.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-purple-600">
                      {promo.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promo.discountPercent ? `${promo.discountPercent}%` : `${promo.discountAmount}₽`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promo.usageCount} / {promo.usageLimit || '∞'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {promo.expiresAt 
                        ? new Date(promo.expiresAt).toLocaleDateString('ru-RU')
                        : 'Бессрочно'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promo.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => togglePromoStatus(promo.id, promo.isActive)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {promo.isActive ? 'Деактивировать' : 'Активировать'}
                      </button>
                    </td>
                  </tr>
                ))}
                {promos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Промокоды еще не созданы
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

