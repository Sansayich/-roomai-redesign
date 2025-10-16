import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import '../globals.css'
import SessionProvider from '@/components/SessionProvider'
import CookieConsent from '@/components/CookieConsent'
import StagingNotice from '@/components/StagingNotice'
import Script from 'next/script'

const jost = Jost({ 
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: '🚧 STAGING - RoomGPT',
  description: 'Staging environment for RoomGPT',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function StagingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={jost.className}>
        {/* Staging Notice - всегда показываем на staging */}
        <StagingNotice />
        
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
