import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/sonner'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/auth'

export const metadata: Metadata = {
  title: 'Pickable | AI Smart Forecaster',
  description: 'AI-powered business forecasting for small businesses',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className='min-h-screen bg-background font-sans antialiased'
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute='class'
            enableSystem
            disableTransitionOnChange
          >
            <div className='flex min-h-screen flex-col'>
              <Navbar />
              <main className='flex-1'>{children}</main>
            </div>
            <Toaster duration={2000} closeButton richColors />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
