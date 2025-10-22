import { Bot } from 'lucide-react'

export default function Loading() {
  return (
    <div className='grid h-dvh place-items-center'>
      <Bot className='duration-1000 size-16 animate-pulse text-primary' />
    </div>
  )
}
