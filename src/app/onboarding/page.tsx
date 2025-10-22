import { Onboarding } from './onboarding'
import { auth } from '@/auth'

export default async function OnboardingPage() {
  const session = await auth()
  const isLoggedIn = !!session?.user
  return (
    <Onboarding
      isLoggedIn={isLoggedIn}
      key={isLoggedIn ? 'logged-in' : 'logged-out'}
    />
  )
}
