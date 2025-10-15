'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

export default function UserMenu() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  if (!session) {
    return (
      <Link
        href="/auth/signin"
        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
      >
        Войти
      </Link>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-gray-900">
              {session.user?.name || session.user?.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-500">
              {session.user?.credits || 0} кредитов
            </div>
          </div>
        </div>
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">
              {session.user?.email}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Кредитов: {session.user?.credits || 0}
            </div>
          </div>
          
          <Link
            href="/history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setIsOpen(false)}
          >
            📜 История генераций
          </Link>
          
          <Link
            href="/referral"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setIsOpen(false)}
          >
            💰 Партнерская программа
          </Link>
          
          <Link
            href="/pricing"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            onClick={() => setIsOpen(false)}
          >
            💳 Купить кредиты
          </Link>
          
          <hr className="my-2 border-gray-100" />
          
          <button
            onClick={() => {
              setIsOpen(false)
              signOut({ callbackUrl: '/' })
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
          >
            🚪 Выйти
          </button>
        </div>
      )}
    </div>
  )
}

