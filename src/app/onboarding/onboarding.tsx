'use client'

import { useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Account } from './account'
import { DataSource } from './datasource'
import { AccountCompletion } from './account-completion'

export function Onboarding({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [currentStep, setCurrentStep] = useState(isLoggedIn ? 2 : 1)

  const progress = (currentStep / 3) * 100

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const components = {
    1: <Account handleNext={handleNext} />,
    2: <DataSource handleNext={handleNext} />,
    3: <AccountCompletion />,
  }

  return (
    <div className='container max-w-2xl mx-auto px-4 py-12'>
      <div className='text-center mb-8'>
        <h1 className='text-3xl font-semibold mb-2 text-balance tracking-tight'>
          Welcome to AI Forecasting
        </h1>
        <p className='text-muted-foreground text-pretty'>
          Let&apos;s get your business data connected in just a few steps
        </p>
      </div>

      <div className='mb-8'>
        <Progress value={progress} className='h-2' />
        <div className='flex justify-between mt-2 text-sm text-muted-foreground'>
          <span>Account Setup</span>
          <span>Data Source</span>
          <span>Complete</span>
        </div>
      </div>
      {components[currentStep as keyof typeof components]}
    </div>
  )
}
