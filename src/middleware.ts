import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  
  const PUBLIC_ROUTES = ['/', '/onboarding']
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
  
  // Redirect authenticated users from home to dashboard
  if (isLoggedIn && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Require authentication for all other routes
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
