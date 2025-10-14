import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'

const jost = Jost({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'roomGPT - Редизайн вашей комнаты за секунды',
  description: 'Используйте искусственный интеллект для создания нового дизайна вашей комнаты',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={jost.className}>{children}</body>
    </html>
  )
}

