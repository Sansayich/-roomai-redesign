import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import EmailProvider from "next-auth/providers/email"
import { emailTemplate, textTemplate } from "@/lib/email"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)
        const { server, from } = provider
        
        const nodemailer = await import('nodemailer')
        const transport = nodemailer.createTransport(server)
        
        await transport.sendMail({
          to: email,
          from: from,
          subject: `roomGPT Ссылка для входа`,
          text: textTemplate({ url, host }),
          html: emailTemplate({ url, host }),
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
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: 3 },
      });
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
}
