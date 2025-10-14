'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

type Generation = {
  id: string
  originalImageUrl: string
  generatedImages: string[]
  style: string
  roomType: string
  quality: string
  creditsUsed: number
  createdAt: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchGenerations()
    }
  }, [session])

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/generations')
      if (response.ok) {
        const data = await response.json()
        setGenerations(data.generations || [])
      }
    } catch (error) {
      console.error('Error fetching generations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `roomgpt-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-white">
      {/* Навигация */}
      <nav className="w-full px-6 py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/generate" className="text-gray-700 hover:text-gray-900">
              Генерация
            </Link>
            <Link href="/history" className="text-gray-900 font-medium">
              История
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
              Тарифы
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">История генераций</h1>
          <p className="text-gray-600">Все ваши созданные дизайны интерьеров</p>
        </div>

        {generations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              У вас пока нет генераций
            </h2>
            <p className="text-gray-600 mb-6">
              Создайте свой первый дизайн интерьера с помощью ИИ
            </p>
            <Link
              href="/generate"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
            >
              Создать дизайн
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {generations.map((generation) => (
              <div key={generation.id} className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {generation.roomType.replace('_', ' ')} - {generation.style}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(generation.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="px-3 py-1 bg-gray-100 rounded-full">
                      {generation.creditsUsed} {generation.creditsUsed === 1 ? 'кредит' : 'кредита'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Оригинал */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">Оригинал</p>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <img
                        src={generation.originalImageUrl}
                        alt="Original"
                        className="w-full rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Сгенерированные изображения */}
                  {generation.generatedImages.map((imageUrl, index) => (
                    <div key={index}>
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Результат {index + 1}
                      </p>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <img
                          src={imageUrl}
                          alt={`Generated ${index + 1}`}
                          className="w-full rounded-lg mb-2"
                        />
                        <button
                          onClick={() => downloadImage(imageUrl, index)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                          Скачать
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

