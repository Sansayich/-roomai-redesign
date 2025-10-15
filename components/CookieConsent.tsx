'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Проверяем, дал ли пользователь согласие ранее
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-sm text-gray-700">
            <p className="mb-2">
              <strong>🍪 Мы используем cookies</strong>
            </p>
            <p className="text-gray-600">
              Мы используем файлы cookie для улучшения работы сайта, аналитики и персонализации. 
              Продолжая использовать сайт, вы соглашаетесь с{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline font-medium">
                Политикой конфиденциальности
              </Link>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={acceptCookies}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Принять
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

