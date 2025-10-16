'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
          roomGPT
        </Link>
        <div className="flex gap-3 sm:gap-6 items-center">
          <Link 
            href="/generate" 
            className="hidden sm:inline text-gray-700 hover:text-gray-900 transition-colors"
          >
            Генерация
          </Link>
          <Link 
            href="/pricing" 
            className="text-sm sm:text-base text-gray-700 hover:text-gray-900 transition-colors"
          >
            Тарифы
          </Link>
          {session && (
            <Link 
              href="/history" 
              className="hidden sm:inline text-gray-700 hover:text-gray-900 transition-colors"
            >
              История
            </Link>
          )}
          {session ? (
            <UserMenu />
          ) : (
            <Link 
              href="/auth/signin"
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 transition-colors"
            >
              Войти
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
