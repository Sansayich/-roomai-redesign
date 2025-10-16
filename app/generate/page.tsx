'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

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
  { id: 'best', name: 'Генерация - 2 кредита', credits: 2 },
]

const roomStyles: RoomStyle[] = [
  { id: 'scandinavian', name: 'Скандинавский', prompt: 'scandinavian', imageUrl: '/images/styles/scandinavian.jpg' },
  { id: 'minimalism', name: 'Минимализм', prompt: 'minimalism', imageUrl: '/images/styles/minimalism.jpg' },
  { id: 'neoclassic', name: 'Неоклассика', prompt: 'neoclassic', imageUrl: '/images/styles/neoclassic.jpg' },
  { id: 'loft', name: 'Лофт', prompt: 'loft', imageUrl: '/images/styles/loft.jpg' },
  { id: 'classic', name: 'Классика', prompt: 'classic', imageUrl: '/images/styles/classic.jpg' },
  { id: 'eclectic', name: 'Эклектика', prompt: 'eclectic', imageUrl: '/images/styles/eclectic.jpg' },
  { id: 'japandi', name: 'Japandi', prompt: 'japandi', imageUrl: '/images/styles/japandi.jpg' },
  { id: 'contemporary', name: 'Контемпорари', prompt: 'contemporary', imageUrl: '/images/styles/contemporary.jpg' },
  { id: 'vintage', name: 'Бабушкин вариант', prompt: 'vintage', imageUrl: '/images/styles/vintage.jpg' },
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
  const [generationHistory, setGenerationHistory] = useState<Array<{
    id: string
    originalImage: string
    style: string
    quality: string
    roomType: string
    generatedImage: string
    timestamp: Date
  }>>([])
  const [error, setError] = useState<string>('')
  const [credits, setCredits] = useState<number>(session?.user?.credits || 0)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedImageForZoom, setSelectedImageForZoom] = useState<string | null>(null)

  // Функция для скачивания изображения
  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Ошибка при скачивании:', error)
    }
  }

  // Функция для увеличения изображения
  const zoomImage = (imageUrl: string) => {
    setSelectedImageForZoom(imageUrl)
  }

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
    // Проверка авторизации
    if (!session) {
      setShowAuthModal(true)
      return
    }

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
      const newOutputs = data.outputs || []
      setGeneratedImages(newOutputs)
      
      // Добавляем в историю генераций
      const newHistoryItems = selectedStyles.map((style, index) => ({
        id: `${Date.now()}-${index}`,
        originalImage: uploadedImage,
        style: roomStyles.find(s => s.id === style)?.name || style,
        quality: quality.name,
        roomType: roomTypes.find(r => r.id === selectedRoomType)?.name || selectedRoomType,
        generatedImage: newOutputs[index] || '',
        timestamp: new Date()
      }))
      
      setGenerationHistory(prev => [...newHistoryItems, ...prev])
      
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

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

        <div className="grid md:grid-cols-[400px_1fr] gap-6 mb-12">
          {/* Левая панель - Форма */}
          <div className="space-y-4">
            {/* Уведомление о кредитах или призыв к регистрации */}
            {!session ? (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="mb-2">
                  <span className="text-2xl">🎁</span>
                </div>
                <p className="text-gray-900 font-bold mb-2">
                  Получите 3 бесплатных кредита!
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  Зарегистрируйтесь и начните создавать дизайны прямо сейчас
                </p>
                <Link 
                  href="/auth/signin" 
                  className="inline-block px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Зарегистрироваться бесплатно
                </Link>
              </div>
            ) : credits === 0 && (
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

            {/* Информация о стоимости */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Стоимость генерации</h3>
              <p className="text-sm text-gray-700">
                Каждый выбранный стиль: <span className="font-semibold text-blue-600">2 кредита</span>
              </p>
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
                    <div className="aspect-[4/3] relative">
                      <img
                        src={style.imageUrl}
                        alt={style.name}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                        <span className="text-xs font-medium">
                          {style.name}
                        </span>
                      </div>
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
              disabled={!uploadedImage || selectedStyles.length === 0 || isGenerating || (session !== null && credits === 0)}
              className={`
                w-full py-3 rounded-lg font-semibold text-base transition-all
                ${!uploadedImage || selectedStyles.length === 0 || isGenerating || (session !== null && credits === 0)
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

            {/* История генераций */}
            {generationHistory.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">История генераций ({generationHistory.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generationHistory.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl border border-gray-200 p-4">
                      <div className="mb-3">
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {item.style}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.quality} • {item.roomType}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {item.timestamp.toLocaleString('ru-RU', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="relative group">
                        <img
                          src={item.generatedImage}
                          alt={`Generated ${item.style}`}
                          className="w-full rounded-lg mb-3 cursor-pointer"
                          onClick={() => zoomImage(item.generatedImage)}
                        />
                        {/* Иконка лупы с плюсиком */}
                        <div 
                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => zoomImage(item.generatedImage)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadImage(item.generatedImage, `roomgpt-${item.style}-${Date.now()}.jpg`)}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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

      <Footer />

      {/* Модальное окно для увеличения изображения */}
      {selectedImageForZoom && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageForZoom(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImageForZoom}
              alt="Увеличенное изображение"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImageForZoom(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно для неавторизованных пользователей */}
      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuthModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-8 max-w-md w-full  transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Требуется регистрация
              </h2>
              
              <p className="text-gray-600 mb-6">
                Чтобы создавать дизайны с помощью нейросети, необходимо зарегистрироваться. Это быстро и бесплатно!
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎁</span>
                  <span className="font-bold text-gray-900">3 бесплатных кредита</span>
                </div>
                <p className="text-sm text-gray-600">
                  при регистрации — попробуйте все возможности!
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Зарегистрироваться бесплатно
                </Link>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

