import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export function AccountCompletion() {
  return (
    <Card>
      <CardHeader className='text-center'>
        <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10'>
          <CheckCircle className='size-8 text-primary' />
        </div>
        <CardTitle>You&apos;re All Set!</CardTitle>
        <CardDescription>
          Your account is ready. Let&apos;s start exploring your business data
          with AI.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='bg-muted/50 p-4 rounded-lg'>
          <h4 className='font-semibold mb-2'>What&apos;s Next?</h4>
          <ul className='space-y-2 text-sm text-muted-foreground list-disc list-inside pl-2'>
            <li>
              Ask questions like &quot;What are my top selling products?&quot;
            </li>
            <li>Get inventory alerts for products at risk</li>
            <li>Receive smart recommendations for restocking</li>
          </ul>
        </div>

        <div className='space-y-3'>
          <Button asChild className='w-full' variant='outline' size='lg'>
            <Link href='/dashboard'>
              Go to Dashboard
              <ArrowRight className='ml-2 size-4' />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
