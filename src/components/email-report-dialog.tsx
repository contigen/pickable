'use client'

import { useState } from 'react'
import { Button, ButtonWithSpinner } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail } from 'lucide-react'
import { toast } from 'sonner'

export function EmailReportDialog({ reportName }: { reportName: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call to send email
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.info('Report sent successfully', {
      description: `The forecast report has been sent`,
    })

    setIsSubmitting(false)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>
          <Mail className='size-4 mr-2' />
          Email Report
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Email Forecast Report</DialogTitle>
          <DialogDescription>
            Send the current forecast report to your email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='report-name'>Report</Label>
              <Input id='report-name' value={reportName} disabled />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email address</Label>
              <Input
                id='email'
                type='email'
                placeholder='your@email.com'
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose>
              <ButtonWithSpinner type='submit' pending={isSubmitting}>
                Send Report
              </ButtonWithSpinner>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
