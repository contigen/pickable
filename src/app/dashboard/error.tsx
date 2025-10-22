'use client'

import { useState } from 'react'
import { Button, ButtonWithSpinner } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    reset()
    setIsRetrying(false)
  }

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='max-w-md w-full'>
        <CardHeader className='text-center'>
          <div className='mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4'>
            <AlertTriangle className='size-6 text-destructive' />
          </div>
          <CardTitle className='text-xl'>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-muted-foreground text-sm'>
            We encountered an error while loading your dashboard UI. Please try
            again.
          </p>

          <div className='flex flex-col gap-3'>
            <ButtonWithSpinner
              onClick={handleRetry}
              pending={isRetrying}
              className='w-full'
            >
              Try Again
            </ButtonWithSpinner>

            <Button asChild variant='outline' className='w-full'>
              <Link href='/'>Go Home</Link>
            </Button>
          </div>

          {error.digest && (
            <p className='text-xs text-muted-foreground mt-4'>
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
