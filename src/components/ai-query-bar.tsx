'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Search, Mic, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateQueryResultUI } from '@/generative-ui-action'
import { GenerativeUI } from './generative-ui'

export function AIQueryBar({
  suggestedQueries,
}: {
  suggestedQueries: string[]
}) {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, startTransition] = useTransition()
  const [ui, setUI] = useState<string | null>(null)

  async function handleSubmit(evt: React.FormEvent) {
    // evt.preventDefault()
    const formData = new FormData(evt.target as HTMLFormElement)
    const query = formData.get('query')?.toString().trim()
    if (!query) return toast.info('Please enter a query')
    generateUIClientAction(query)
  }

  function generateUIClientAction(query: string) {
    startTransition(async () => {
      const result = await generateQueryResultUI(query)
      if (!result) {
        toast.error('Failed to generate UI')
        return
      }
      const { ui } = result
      setUI(ui)
    })
  }

  const handleSuggestedQuery = (suggestion: string) =>
    generateUIClientAction(suggestion)

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6'>
      <Card className='p-4 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10'>
        <form onSubmit={handleSubmit} className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              name='query'
              disabled={isLoading}
              className='pl-10 pr-12 h-12 text-base border-0 bg-background/80 focus-visible:ring-2 focus-visible:ring-primary rounded-md'
              placeholder='Ask anything about your business data...'
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 size-8 p-0 ${
                isListening ? 'text-red-500' : 'text-muted-foreground'
              }`}
              onClick={() => setIsListening(!isListening)}
              disabled={isLoading}
            >
              <Mic className='size-4' />
            </Button>
          </div>
          <Button type='submit' size='lg' className='px-6' disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className='size-4 mr-2 animate-spin' />
                Analyzing...
              </>
            ) : (
              <>
                <Send className='size-4 mr-2' />
                Ask AI
              </>
            )}
          </Button>
        </form>
      </Card>

      {!isLoading && (
        <div className='flex flex-wrap gap-2 justify-center'>
          {suggestedQueries.map((suggestion, index) => (
            <Button
              key={index}
              variant='outline'
              size='sm'
              className='text-xs bg-background/50 hover:bg-primary/10 hover:border-primary/30'
              onClick={() => handleSuggestedQuery(suggestion)}
            >
              {suggestion}
            </Button>
          ))}
        </div>
      )}

      {isLoading && (
        <Card className='p-6 border-primary/20'>
          <div className='flex items-center justify-center gap-3'>
            <Loader2 className='h-5 w-5 animate-spin text-primary' />
            <span className='text-sm text-muted-foreground'>
              AI is analysing your business data...
            </span>
          </div>
        </Card>
      )}

      {ui && <GenerativeUI ui={ui} />}
    </div>
  )
}
