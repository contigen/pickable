'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { MessageSquare, Bot } from 'lucide-react'
import { useSession } from 'next-auth/react'

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Bot },
  { name: 'Forecast Explorer', href: '/forecast', icon: MessageSquare },
]

export function Navbar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-16 items-center justify-between'>
        <div className='flex items-center gap-6'>
          <Link href='/'>
            <span className='text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent'>
              Pickable
            </span>
          </Link>
          <nav className='hidden md:flex gap-6'>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary flex items-center gap-2',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className='size-4' />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <Button asChild className='hidden md:inline-flex'>
            <Link href='/onboarding'>
              {isLoggedIn ? 'Onboarding' : 'Get Started'}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
