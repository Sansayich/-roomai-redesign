import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"
import { emailTemplate, textTemplate } from "@/lib/email"

// Генерация уникального реферального кода
async function generateReferralCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  
  // Генерируем код до тех пор, пока не найдем уникальный
  let isUnique = false
  
  while (!isUnique) {
    code = ''
    for (let i = 0; i < 8; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    
    const existing = await prisma.user.findUnique({
      where: { referralCode: code }
    })
    
    if (!existing) {
      isUnique = true
    }
  }
  
  return code
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { server, from } = provider
        
        // Генерируем короткий код (8 символов)
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
        let code = ''
        for (let i = 0; i < 8; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        
        // Сохраняем короткий код в существующей таблице VerificationToken
        // identifier = короткий код, token = полный URL
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 часа
        await prisma.verificationToken.create({
          data: {
            identifier: `short:${code}`,
            token: url,
            expires,
          }
        })
        
        // Создаем короткую ссылку
        const baseUrl = process.env.NEXTAUTH_URL || 'https://room-gpt.ru'
        const shortUrl = `${baseUrl}/verify?code=${code}`
        const host = new URL(baseUrl).host
        
        const nodemailer = await import('nodemailer')
        const transport = nodemailer.createTransport(server)
        
        await transport.sendMail({
          to: email,
          from: from,
          subject: `roomGPT Ссылка для входа`,
          text: textTemplate({ url: shortUrl, host }),
          html: emailTemplate({ url: shortUrl, host }),
        })
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session?.user) {
        session.user.id = user.id;
        session.user.credits = user.credits || 0;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }: any) {
      console.log('🎉 Creating new user:', user.email)
      
      // Генерируем уникальный реферальный код
      const referralCode = await generateReferralCode()
      
      // Проверяем есть ли сохраненные UTM данные
      let utmData: any = {}
      try {
        const utmToken = await prisma.verificationToken.findFirst({
          where: {
            identifier: `utm:${user.email}`
          }
        })
        
        if (utmToken) {
          utmData = JSON.parse(utmToken.token)
          console.log('✅ UTM data found for user:', user.email, utmData)
          // Удаляем токен после использования
          await prisma.verificationToken.deleteMany({
            where: {
              identifier: `utm:${user.email}`
            }
          }).catch(() => {})
        } else {
          console.log('⚠️ No UTM token found for user:', user.email)
        }
      } catch (e) {
        console.log('❌ Error fetching UTM data for user:', user.email, e)
      }
      
      console.log('💾 Updating user with data:', {
        credits: 4,
        referralCode,
        referredById: utmData.referrerId || null
      })
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          credits: 4,
          referralCode,
          utmSource: utmData.utmSource || null,
          utmMedium: utmData.utmMedium || null,
          utmCampaign: utmData.utmCampaign || null,
          utmContent: utmData.utmContent || null,
          utmTerm: utmData.utmTerm || null,
          referredById: utmData.referrerId || null,
        },
      });
      
      console.log('✅ User created successfully:', user.email)
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
}
