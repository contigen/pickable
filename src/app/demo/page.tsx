'use client'

import { Button } from '@/components/ui/button'
import { callBedrockAgent, demoAction } from './demo-action'
import { BedrockAgentChat } from './bedrock-agent-chat'

export default function DemoPage() {
  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold'>Demo</h1>
      <p className='text-sm text-gray-500'>
        This is a demo page for the AI Forecasting app.
      </p>

      <div className='flex gap-2 flex-col w-fit mt-4'>
        <Button onClick={demoAction}>Demo</Button>
        <Button onClick={callBedrockAgent} variant='outline'>
          Call Bedrock Agent
        </Button>
      </div>
      <BedrockAgentChat />
    </div>
  )
}
