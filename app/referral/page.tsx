'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

type ReferralStats = {
  referralCode: string
  referralBalance: number
  availableBalance: number
  pendingBalance: number
  totalEarnings: number
  totalReferrals: number
  referrals: Array<{
    id: string
    email: string
    createdAt: string
  }>
  earnings: Array<{
    id: string
    amount: number
    orderAmount: number
    percentage: number
    createdAt: string
  }>
  payoutRequests: Array<{
    id: string
    amount: number
    status: string
    createdAt: string
    processedAt: string | null
  }>
}

export default function ReferralPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [isRequestingPayout, setIsRequestingPayout] = useState(false)
  const [payoutMessage, setPayoutMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStats()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/referral/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyReferralLink = () => {
    if (stats?.referralCode) {
      const link = `${window.location.origin}?ref=${stats.referralCode}`
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const requestPayout = async () => {
    setIsRequestingPayout(true)
    setPayoutMessage('')

    try {
      const res = await fetch('/api/referral/payout', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setPayoutMessage(data.message)
        // Обновляем статистику
        fetchStats()
      } else {
        setPayoutMessage(data.error || 'Ошибка при отправке запроса')
      }
    } catch (error) {
      setPayoutMessage('Ошибка при отправке запроса')
    } finally {
      setIsRequestingPayout(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'paid':
        return 'text-green-600 bg-green-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'В обработке'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const referralLink = stats?.referralCode 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${stats.referralCode}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Навигация */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              roomGPT
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/generate" className="text-gray-700 hover:text-blue-600 transition-colors">
                Генерация
              </Link>
              <Link href="/history" className="text-gray-700 hover:text-blue-600 transition-colors">
                История
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                Тарифы
              </Link>
              <Link href="/referral" className="text-blue-600 font-medium">
                Партнерам
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Партнерская программа
          </h1>
          <p className="text-xl text-gray-600">
            Приглашайте друзей и получайте <span className="font-bold text-blue-600">40% с каждого платежа</span>
          </p>
        </div>

        {/* Баланс и реферальная ссылка */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Баланс */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Реферальный баланс</h2>
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Общий баланс */}
            <div className="text-5xl font-bold text-gray-900 mb-4">
              {stats?.referralBalance.toFixed(2)}₽
            </div>
            
            {/* Разбивка */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">✅ Доступно к выводу:</span>
                <span className="font-semibold text-green-600">
                  {stats?.availableBalance.toFixed(2)}₽
                </span>
              </div>
              {(stats?.pendingBalance ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">⏳ На холде (14 дней):</span>
                  <span className="font-semibold text-orange-600">
                    {stats?.pendingBalance.toFixed(2)}₽
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={requestPayout}
              disabled={isRequestingPayout || (stats?.availableBalance || 0) < 100}
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isRequestingPayout ? 'Отправка...' : 'Запросить выплату'}
            </button>
            {payoutMessage && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${
                payoutMessage.includes('Ошибка') || payoutMessage.includes('Минимальная')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {payoutMessage}
              </div>
            )}
            <div className="mt-3 text-sm text-gray-500 space-y-1">
              <p>• Минимум для вывода: 100₽</p>
              <p>• Средства доступны через 14 дней после платежа реферала</p>
              {(stats?.referralBalance ?? 0) < 0 && (
                <p className="text-red-600 font-medium">
                  ⚠️ Отрицательный баланс из-за возвратов средств рефералами
                </p>
              )}
            </div>
          </div>

          {/* Реферальная ссылка */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Ваша реферальная ссылка</h2>
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 break-all text-sm text-gray-700 font-mono">
              {referralLink}
            </div>
            <button
              onClick={copyReferralLink}
              className="w-full py-3 px-6 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {copied ? '✓ Скопировано!' : 'Скопировать ссылку'}
            </button>
            <p className="mt-3 text-sm text-gray-500">
              Код: <span className="font-mono font-bold">{stats?.referralCode}</span>
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats?.totalReferrals || 0}
            </div>
            <div className="text-gray-600">Приглашено пользователей</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats?.totalEarnings.toFixed(2)}₽
            </div>
            <div className="text-gray-600">Заработано всего</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              40%
            </div>
            <div className="text-gray-600">Комиссия с покупок</div>
          </div>
        </div>

        {/* История начислений */}
        {stats?.earnings && stats.earnings.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">💸 История начислений</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Дата</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Сумма заказа</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Процент</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Начислено</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(earning.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {earning.orderAmount}₽
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {earning.percentage}%
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-green-600">
                        +{earning.amount.toFixed(2)}₽
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* История выплат */}
        {stats?.payoutRequests && stats.payoutRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Запросы на выплату</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Дата запроса</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Сумма</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Обработано</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.payoutRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {request.amount.toFixed(2)}₽
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusText(request.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {request.processedAt 
                          ? new Date(request.processedAt).toLocaleDateString('ru-RU')
                          : '—'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Как это работает */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Как это работает?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Поделитесь ссылкой</h3>
              <p className="text-gray-600 text-sm">
                Скопируйте вашу реферальную ссылку и поделитесь ей с друзьями в соцсетях или мессенджерах
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Друг покупает</h3>
              <p className="text-gray-600 text-sm">
                Когда кто-то регистрируется по вашей ссылке и совершает покупку, вам начисляется 40%
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Ждете 14 дней</h3>
              <p className="text-gray-600 text-sm">
                Средства становятся доступны для вывода через 14 дней. Это защита от мошеннических возвратов
              </p>
            </div>
            <div className="bg-white rounded-lg p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">4️⃣</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Выводите деньги</h3>
              <p className="text-gray-600 text-sm">
                При накоплении от 100₽ запрашиваете выплату на карту или СБП
              </p>
            </div>
          </div>
          
          {/* Важная информация */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">⚠️ Важно знать:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Если реферал запросит возврат средств, соответствующая сумма будет вычтена из вашего баланса</li>
              <li>• При отрицательном балансе новые начисления сначала компенсируют задолженность</li>
              <li>• Мошеннические действия (самореферы, накрутка) приведут к блокировке без выплаты</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="w-full py-8 border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm space-y-3">
          <div className="flex justify-center gap-6">
            <Link href="/terms" className="hover:text-gray-900">Публичная оферта</Link>
            <Link href="/privacy" className="hover:text-gray-900">Политика конфиденциальности</Link>
            <Link href="/refund" className="hover:text-gray-900">Возврат средств</Link>
            <Link href="/referral" className="hover:text-gray-900">Партнерская программа</Link>
          </div>
          <div className="flex justify-center items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <a href="mailto:hello@room-gpt.ru" className="hover:text-gray-900">hello@room-gpt.ru</a>
          </div>
          <p>© {new Date().getFullYear()} roomGPT. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}

