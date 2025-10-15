'use client'

export default function StagingNotice() {
  // Показываем баннер только на staging окружении
  if (process.env.NODE_ENV !== 'staging' && typeof window !== 'undefined' && !window.location.hostname.includes('staging')) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black py-2 px-4 text-center text-sm font-bold z-50">
      🚧 ТЕСТОВЫЙ СЕРВЕР - НЕ ДЛЯ ПРОДАКШЕНА 🚧
    </div>
  )
}

