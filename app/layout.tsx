import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'
import SessionProvider from '@/components/SessionProvider'
import CookieConsent from '@/components/CookieConsent'
import StagingNotice from '@/components/StagingNotice'
import Script from 'next/script'

const jost = Jost({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
})

// Проверка staging окружения
const isStaging = process.env.NEXTAUTH_URL?.includes('staging') || false

export const metadata: Metadata = {
  title: isStaging 
    ? '🚧 STAGING - RoomGPT' 
    : 'RoomGPT на русском - нейросеть для дизайна интерьера без VPN с оплатой российскими картами',
  description: 'Нейросеть для дизайна интерьера на русском языке. RoomGPT - бесплатный онлайн сервис для создания дизайна комнаты, кухни, ванной, спальни с помощью ИИ. Без VPN, оплата российскими картами. 3 бесплатные генерации при регистрации.',
  keywords: [
    'roomgpt',
    'roomgpt нейросеть',
    'roomgpt на русском',
    'roomgpt io',
    'room gpt',
    'room gpt нейросеть',
    'room gpt дизайн',
    'нейросеть для дизайна интерьера',
    'нейросеть для дизайна интерьера бесплатно',
    'дизайн интерьера',
    'дизайн интерьера онлайн',
    'дизайн интерьера квартиры',
    'дизайн интерьера кухни',
    'дизайн интерьера комнаты',
    'дизайн интерьера 3d',
    'дизайн интерьера фото',
    'программа для дизайна интерьера',
    'дизайн проект интерьера',
    'нейросети дизайн интерьера онлайн',
    'дизайн интерьера с помощью нейросети',
    'современный дизайн интерьера',
    'стили дизайна интерьера',
    'дизайн ванной',
    'дизайн кухни',
  ],
  authors: [{ name: 'roomGPT' }],
  creator: 'roomGPT',
  publisher: 'roomGPT',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://room-gpt.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://room-gpt.ru',
    title: 'RoomGPT на русском - нейросеть для дизайна интерьера без VPN',
    description: 'Создайте дизайн интерьера с помощью нейросети. Бесплатно, на русском языке, без VPN. Дизайн комнаты, кухни, ванной, спальни онлайн за секунды.',
    siteName: 'roomGPT',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'roomGPT - Нейросеть для дизайна интерьера',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RoomGPT на русском - нейросеть для дизайна интерьера',
    description: 'Создайте дизайн интерьера с помощью ИИ. Бесплатно, на русском языке, без VPN.',
    images: ['/og-image.jpg'],
  },
  robots: isStaging ? {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  } : {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    yandex: '02e0d8beb8e2c52a',
    google: 'your-google-verification-code',
  },
  other: {
    'yandex-verification': '02e0d8beb8e2c52a',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={jost.className}>
        {/* Staging Notice - показываем только в staging окружении */}
        {isStaging && <StagingNotice />}
        
        {/* Yandex.Metrika counter */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104644843', 'ym');

              ym(104644843, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/104644843" 
              style={{ position: 'absolute', left: '-9999px' }} 
              alt="" 
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        
      <SessionProvider>
        {children}
        <CookieConsent />
      </SessionProvider>
    </body>
  </html>
)
}

