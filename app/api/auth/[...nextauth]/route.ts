import NextAuth, { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
    // Yandex OAuth будет добавлен позже
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-ignore
        session.user.credits = user.credits
      }
      return session
    },
  },
  events: {
    async createUser({ user }) {
      // Даем 1 бесплатный кредит при регистрации
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: 1 },
      })
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

