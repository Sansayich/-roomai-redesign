'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type User = {
  id: string
  email: string
  name: string | null
  credits: number
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  createdAt: string
  _count: {
    generations: number
  }
}

type Stats = {
  totalUsers: number
  totalGenerations: number
  newUsersToday: number
  newUsersWeek: number
  newUsersMonth: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [creditsToAdd, setCreditsToAdd] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

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
      const response = await fetch('/api/admin/check')
      if (!response.ok) {
        router.push('/')
        return
      }
      fetchData()
    } catch (error) {
      router.push('/')
    }
  }

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ])
      
      if (usersRes.ok && statsRes.ok) {
        const usersData = await usersRes.json()
        const statsData = await statsRes.json()
        setUsers(usersData.users)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addCredits = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/admin/add-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          credits: creditsToAdd
        })
      })

      if (response.ok) {
        fetchData()
        setSelectedUser(null)
        setCreditsToAdd(10)
      }
    } catch (error) {
      console.error('Error adding credits:', error)
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

  if (!session) {
    return null
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Навигация */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold text-gray-900">🔧 Админ-панель</h1>
              <div className="flex gap-4">
                <Link href="/admin" className="text-purple-600 font-medium">Пользователи</Link>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Всего пользователей</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Всего генераций</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalGenerations}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Новых за сутки</div>
              <div className="text-3xl font-bold text-green-600">{stats.newUsersToday}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Новых за неделю</div>
              <div className="text-3xl font-bold text-blue-600">{stats.newUsersWeek}</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Новых за месяц</div>
              <div className="text-3xl font-bold text-purple-600">{stats.newUsersMonth}</div>
            </div>
          </div>
        )}

        {/* Поиск */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <input
            type="text"
            placeholder="🔍 Поиск по email или имени..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Таблица пользователей */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Имя</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Кредиты</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Генераций</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Регистрация</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.utmSource ? (
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">Source:</span> {user.utmSource}
                        </div>
                        {user.utmMedium && (
                          <div className="text-xs">
                            <span className="font-medium">Medium:</span> {user.utmMedium}
                          </div>
                        )}
                        {user.utmCampaign && (
                          <div className="text-xs">
                            <span className="font-medium">Campaign:</span> {user.utmCampaign}
                          </div>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full">
                      {user.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user._count.generations}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUser(user.id)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      Добавить кредиты
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно добавления кредитов */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Добавить кредиты</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество кредитов
              </label>
              <input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={addCredits}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Добавить
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setCreditsToAdd(10)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

