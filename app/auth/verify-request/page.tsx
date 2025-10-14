import Link from 'next/link'

export default function VerifyRequest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Проверьте почту</h2>
        
        <p className="text-gray-600 mb-6">
          Мы отправили вам ссылку для входа. Пройдите по ней, чтобы продолжить.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 Письмо может прийти в течение нескольких минут. Не забудьте проверить папку "Спам".
          </p>
        </div>

        <Link 
          href="/" 
          className="inline-block text-purple-600 hover:text-purple-700 font-medium"
        >
          ← Вернуться на главную
        </Link>
      </div>
    </div>
  )
}

