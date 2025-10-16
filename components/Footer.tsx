import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full py-6 sm:py-8 border-t border-gray-200 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-gray-500 text-xs sm:text-sm space-y-3">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-6 text-center">
          <Link href="/terms" className="hover:text-gray-900 text-xs sm:text-sm">Публичная оферта</Link>
          <Link href="/privacy" className="hover:text-gray-900 text-xs sm:text-sm">Политика конфиденциальности</Link>
          <Link href="/refund" className="hover:text-gray-900 text-xs sm:text-sm">Возврат средств</Link>
          <Link href="/payment-info" className="hover:text-gray-900 text-xs sm:text-sm">Способы оплаты</Link>
          <Link href="/referral" className="hover:text-gray-900 text-xs sm:text-sm col-span-2 sm:col-span-1">Партнерская программа</Link>
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
  )
}

