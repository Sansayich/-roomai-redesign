'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

type RoomStyle = {
  id: string
  name: string
  prompt: string
  imageUrl: string
}

type RoomType = {
  id: string
  name: string
}

type Quality = {
  id: string
  name: string
  credits: number
}

const roomTypes: RoomType[] = [
  { id: 'living_room', name: 'Гостиная' },
  { id: 'bedroom', name: 'Спальня' },
  { id: 'kitchen', name: 'Кухня' },
  { id: 'bathroom', name: 'Ванная' },
  { id: 'office', name: 'Офис' },
  { id: 'dining_room', name: 'Столовая' },
]

const qualities: Quality[] = [
  { id: 'best', name: 'Лучшее (Высокое качество)', credits: 2 },
  { id: 'good', name: 'Хорошее (Среднее качество)', credits: 1 },
]

const roomStyles: RoomStyle[] = [
  { id: 'modern', name: 'Modern', prompt: 'modern', imageUrl: '/themes/modern.jpg' },
  { id: 'summer', name: 'Summer', prompt: 'summer', imageUrl: '/themes/summer.jpg' },
  { id: 'professional', name: 'Professional', prompt: 'professional', imageUrl: '/themes/professional.jpg' },
  { id: 'tropical', name: 'Tropical', prompt: 'tropical', imageUrl: '/themes/tropical.jpg' },
  { id: 'coastal', name: 'Coastal', prompt: 'coastal', imageUrl: '/themes/coastal.jpg' },
  { id: 'vintage', name: 'Vintage', prompt: 'vintage', imageUrl: '/themes/vintage.jpg' },
  { id: 'industrial', name: 'Industrial', prompt: 'industrial', imageUrl: '/themes/industrial.jpg' },
  { id: 'neoclassic', name: 'Neoclassic', prompt: 'neoclassic', imageUrl: '/themes/neoclassic.jpg' },
  { id: 'tribal', name: 'Tribal', prompt: 'tribal', imageUrl: '/themes/tribal.jpg' },
]

export default function GeneratePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [selectedStyles, setSelectedStyles] = useState<string[]>([])
  const [selectedRoomType, setSelectedRoomType] = useState<string>('living_room')
  const [selectedQuality, setSelectedQuality] = useState<string>('best')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [credits, setCredits] = useState<number>(session?.user?.credits || 0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.credits !== undefined) {
      setCredits(session.user.credits)
    }
  }, [session])

  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter(id => id !== styleId))
    } else {
      if (selectedStyles.length < 4) {
        setSelectedStyles([...selectedStyles, styleId])
      }
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        setGeneratedImages([])
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  })

  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Пожалуйста, загрузите изображение')
      return
    }

    if (selectedStyles.length === 0) {
      setError('Пожалуйста, выберите хотя бы одну тему')
      return
    }

    const quality = qualities.find(q => q.id === selectedQuality)
    if (!quality) return

    if (credits < quality.credits * selectedStyles.length) {
      setError(`Недостаточно кредитов. Требуется ${quality.credits * selectedStyles.length} кредитов.`)
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: uploadedImage,
          styles: selectedStyles,
          roomType: selectedRoomType,
          quality: selectedQuality,
        }),
      })

      if (!response.ok) {
        throw new Error('Ошибка при генерации изображения')
      }

      const data = await response.json()
      setGeneratedImages(data.outputs || [])
      
      // Обновляем кредиты из ответа API
      if (data.credits !== undefined) {
        setCredits(data.credits)
      }
    } catch (err) {
      setError('Произошла ошибка при генерации. Попробуйте еще раз.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  const selectedQualityObj = qualities.find(q => q.id === selectedQuality)
  const totalCost = selectedQualityObj ? selectedQualityObj.credits * selectedStyles.length : 0

  if (status === 'loading') {
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
      <nav className="w-full px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-blue-600">
            roomGPT
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/generate" className="text-sm sm:text-base text-gray-900 font-medium">
              Генерация
            </Link>
            <Link href="/pricing" className="hidden sm:inline text-gray-700 hover:text-gray-900">
              Тарифы
            </Link>
            <UserMenu />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Редизайн вашей <span className="text-blue-600">комнаты</span> за секунды
          </h1>
          <p className="text-lg text-gray-600">
            Загрузите фото комнаты, выберите тип и стиль для редизайна
          </p>
        </div>

        <div className="grid md:grid-cols-[320px_1fr] gap-6 mb-12">
          {/* Левая панель - Форма */}
          <div className="space-y-4">
            {/* Уведомление о кредитах */}
            {credits === 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-gray-700 font-medium mb-2">
                  У вас не осталось кредитов.
                </p>
                <Link href="/pricing" className="text-blue-600 font-semibold hover:underline">
                  Купите ещё здесь
                </Link>
                <span className="text-gray-700"> чтобы сгенерировать вашу комнату.</span>
              </div>
            )}

            {/* Загрузка фото */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Загрузите фото вашей комнаты</h3>
              {!uploadedImage ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <button className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mb-3">
                    Загрузить изображение
                  </button>
                  <p className="text-sm text-gray-600">
                    ...или перетащите изображение
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {/* Выбор типа комнаты */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Выберите тип комнаты</h3>
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roomTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Выбор качества */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Выберите качество</h3>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {qualities.map(quality => (
                  <option key={quality.id} value={quality.id}>
                    {quality.name} – {quality.credits} credits
                  </option>
                ))}
              </select>
            </div>

            {/* Выбор тем */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                Выберите темы комнаты (до 4)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {roomStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`
                      relative rounded-lg overflow-hidden border-2 transition-all
                      ${selectedStyles.includes(style.id)
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-500">
                        {style.name}
                      </span>
                    </div>
                    {selectedStyles.includes(style.id) && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Кнопка генерации */}
            <button
              onClick={handleGenerate}
              disabled={!uploadedImage || selectedStyles.length === 0 || isGenerating || credits === 0}
              className={`
                w-full py-3 rounded-lg font-semibold text-base transition-all
                ${!uploadedImage || selectedStyles.length === 0 || isGenerating || credits === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Генерация...
                </span>
              ) : (
                `Создать дизайны`
              )}
            </button>

            <div className="text-center text-sm text-gray-600">
              Стоимость: <span className="font-bold">{totalCost} {totalCost === 1 ? 'кредит' : totalCost < 5 ? 'кредита' : 'кредитов'}</span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Правая панель - Оригинал и результаты */}
          <div className="space-y-6">
            {/* Оригинальное изображение */}
            {uploadedImage && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Оригинал</h3>
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                  <img
                    src={uploadedImage}
                    alt="Original"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Сгенерированные изображения */}
            {generatedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Результаты ({generatedImages.length})</h3>
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((image, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                      <img
                        src={image}
                        alt={`Result ${index + 1}`}
                        className="w-full rounded-lg mb-3"
                      />
                      <button
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = image
                          link.download = `room-design-${index + 1}.png`
                          link.click()
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Скачать
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Плейсхолдер когда нет изображений */}
            {!uploadedImage && generatedImages.length === 0 && (
              <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Загрузите изображение для начала</p>
                </div>
              </div>
            )}
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

