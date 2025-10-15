'use client'

import { signIn } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Извлекаем UTM метки из URL
  const utmSource = searchParams.get('utm_source')
  const utmMedium = searchParams.get('utm_medium')
  const utmCampaign = searchParams.get('utm_campaign')
  const utmContent = searchParams.get('utm_content')
  const utmTerm = searchParams.get('utm_term')
  const referralCode = searchParams.get('ref') // Реферальный код

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Сохраняем UTM метки и реферальный код
      if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm || referralCode) {
        await fetch('/api/auth/save-utm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            utmSource,
            utmMedium,
            utmCampaign,
            utmContent,
            utmTerm,
            referralCode,
          }),
        })
      }

      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/generate',
      })
      
      if (result?.ok) {
        setIsEmailSent(true)
      }
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }


  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-50 rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Проверьте почту</h2>
          <p className="text-gray-600 mb-6">
            Мы отправили ссылку для входа на <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Письмо должно прийти в течение нескольких минут. Проверьте папку "Спам", если не видите письмо.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/pricing" className="text-sm sm:text-base text-gray-700 hover:text-gray-900">
              Тарифы
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center p-4 py-12">
        <div className="max-w-lg w-full">
        {/* Badge сверху */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 bg-white rounded-full border border-blue-200  mb-6">
            <span className="text-sm text-gray-700">
              Более <span className="font-bold text-blue-600">10,000 пользователей</span> уже используют roomGPT
            </span>
          </div>
        </div>

        {/* Заголовок */}
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-bold text-blue-600 inline-block mb-4">
            roomGPT
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Редизайн вашей <span className="text-blue-600">комнаты</span> за секунды
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-2 px-2">
            Войдите ниже, чтобы создать бесплатный аккаунт и сделать редизайн вашей комнаты прямо сейчас.
          </p>
          <p className="text-base sm:text-lg font-semibold text-gray-900">
            Вы получите <span className="text-blue-600">3 бесплатных кредита</span> 🎁
          </p>
        </div>

        {/* Форма входа */}
        <div className="bg-white rounded-2xl border border-gray-200  p-8">
          <form onSubmit={handleEmailSignIn} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email адрес
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed "
            >
              {isLoading ? 'Отправляем ссылку...' : 'Получить ссылку для входа'}
            </button>
          </form>

          {/* Преимущества */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Работает без VPN на территории РФ</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Оплата российскими картами</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Полностью на русском языке</span>
            </div>
          </div>
        </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Продолжая, вы соглашаетесь с{' '}
            <Link href="/terms" className="text-blue-600 hover:underline">
              условиями использования
            </Link>
            {' '}и{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              политикой конфиденциальности
            </Link>
          </p>
        </div>
      </div>

      {/* Футер */}
      <footer className="w-full py-6 sm:py-8 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-xs sm:text-sm space-y-3">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
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

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  )
}

