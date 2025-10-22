import { loginSchema } from '@/lib/schema'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { getUser } from '@/lib/db-queries'
import { NextResponse } from 'next/server'

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
    async authorized({ request: req, auth }) {
      const PUBLIC_ROUTES = [`/`, ``, `/onboarding`]
      const { pathname } = req.nextUrl
      const isLoggedIn = !!auth?.user
      const isAPublicRoute = PUBLIC_ROUTES.some(route => route === pathname)
      if (isLoggedIn && pathname === '/') {
        const searchParams = req.nextUrl.searchParams
        const callbackURL = searchParams.get('callbackUrl')
        if (callbackURL) {
          return NextResponse.redirect(new URL(callbackURL, req.url))
        }
        return NextResponse.redirect(new URL(`/dashboard`, req.url))
      }
      if (isAPublicRoute) {
        return true
      }
      return isLoggedIn
    },
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
