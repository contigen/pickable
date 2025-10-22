import { ButtonWithSpinner } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import { loginUser, RegisterActionState } from '@/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function Account({ handleNext }: { handleNext: () => void }) {
  const initialState: RegisterActionState = {
    message: '',
  }
  const [state, formAction, pending] = useActionState(loginUser, initialState)
  const router = useRouter()

  useEffect(() => {
    if (state.message === `invalid data`) {
      toast.warning(`Invalid form data`)
    } else if (state.message === `user created`) {
      toast.info(`Your account has been created and you will be logged in`)
      router.refresh()
    } else if (state.message === `user logged in`) {
      toast.success(`You are logged in`)
      console.log('refresh')
      router.refresh()
    } else if (state.message === `failed to create user`) {
      toast.error(`Failed to create account`)
    }
  }, [router, state])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          Tell us about your business to get started
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <form action={formAction}>
          <fieldset className='space-y-2'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email Address</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='you@yourbusiness.com'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='business_name'>Business Name</Label>
              <Input
                id='business_name'
                placeholder='Your Business Name'
                name='business_name'
                required
              />
            </div>
          </fieldset>
          <ButtonWithSpinner
            type='submit'
            onClick={() => {
              if (state.message === 'user created') handleNext()
            }}
            className='w-full mt-4'
            pending={pending}
          >
            Continue
            <ArrowRight className='ml-2 size-4' />
          </ButtonWithSpinner>
        </form>
      </CardContent>
    </Card>
  )
}
