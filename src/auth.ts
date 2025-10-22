import { loginSchema } from '@/lib/schema'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getUser } from '@/lib/db-queries'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        businessName: {},
      },
      async authorize(credentials) {
        const { email } = await loginSchema.parseAsync(credentials)
        try {
          const user = await getUser(email)
          if (!user) return null
          return {
            id: user.id,
            name: user.businessName,
            email: user.email,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...token,
        },
      }
    },
  },
  pages: {
    signIn: `/onboarding`,
    newUser: `/dashboard`,
    signOut: `/`,
    error: `/onboarding`,
  },
})
