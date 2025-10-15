'use client'

export default function StagingNotice() {
  // Компонент отображается только когда передан из layout.tsx на staging окружении
  // Дополнительная проверка не нужна, так как компонент рендерится условно
  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black py-2 px-4 text-center text-sm font-bold z-50">
      🚧 ТЕСТОВЫЙ СЕРВЕР - НЕ ДЛЯ ПРОДАКШЕНА 🚧
    </div>
  )
}

