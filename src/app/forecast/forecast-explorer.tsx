'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Mic, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { generateQueryResultUI } from '@/generative-ui-action'
import { GenerativeUI } from '@/components/generative-ui'
import { ChatIndicator } from '@/components/chat-indicator'
import { useSpeechRecognition } from '@/hooks/use-speech-recognition'

type ChatMessage = {
  id: string
  type: 'user' | 'ai'
  content?: string
  timestamp: Date
  generatedUI?: string
  isLoading?: boolean
}

const suggestedQueries = [
  'Show me sales forecast for next 30 days',
  'Which products will need restocking soon?',
  "What's my revenue trend this quarter?",
  'Show top 5 products at risk',
  'Predict demand for holiday season',
]

export function ForecastExplorer() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content:
        "Hi! I'm your AI forecasting assistant. Ask me anything about your business data, sales predictions, or inventory needs.",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, startTransition] = useTransition()

  const {
    Recognition,
    transcript,
    setTranscript,
    speechErrMessage,
    startSpeechRec,
    stopSpeechRec,
  } = useSpeechRecognition()

  function handleSendMessage() {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      timestamp: new Date(),
      isLoading: true,
    }

    setMessages(prev => [...prev, userMessage, loadingMessage])
    const query = inputValue
    setInputValue('')

    startTransition(async () => {
      try {
        const result = await generateQueryResultUI(query)
        if (!result) {
          toast.error('Failed to generate response')
          setMessages(prev =>
            prev.map(msg =>
              msg.id === loadingMessage.id
                ? {
                    ...msg,
                    content:
                      'Sorry, I encountered an error processing your request. Please try again.',
                    isLoading: false,
                  }
                : msg
            )
          )
          return
        }

        const { ui } = result
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  generatedUI: ui,
                  isLoading: false,
                }
              : msg
          )
        )
      } catch (error) {
        console.error('Error generating UI:', error)
        toast.error('Failed to generate response')
        setMessages(prev =>
          prev.map(msg =>
            msg.id === loadingMessage.id
              ? {
                  ...msg,
                  content:
                    'Sorry, I encountered an error processing your request. Please try again.',
                  isLoading: false,
                }
              : msg
          )
        )
      }
    })
  }

  function handleSuggestedQuery(query: string) {
    setInputValue(query)
    setTimeout(handleSendMessage, 100)
  }

  // Handle speech recognition toggle
  const handleMicClick = useCallback(() => {
    if (!Recognition) {
      toast.error('Speech recognition is not supported in your browser')
      return
    }

    if (transcript.listening) {
      stopSpeechRec()
      // Use the final transcript result and auto-send
      if (transcript.note.trim()) {
        const finalText = transcript.note.trim()
        setInputValue(finalText)
        setTranscript(prev => ({ ...prev, note: '', preview: '' }))

        // Auto-send the message after a short delay
        setTimeout(() => {
          if (finalText.trim()) {
            // Create message with the transcribed text
            const userMessage: ChatMessage = {
              id: Date.now().toString(),
              type: 'user',
              content: finalText,
              timestamp: new Date(),
            }

            const loadingMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              timestamp: new Date(),
              isLoading: true,
            }

            setMessages(prev => [...prev, userMessage, loadingMessage])
            setInputValue('')

            // Generate AI response
            startTransition(async () => {
              try {
                const result = await generateQueryResultUI(finalText)
                if (!result) {
                  toast.error('Failed to generate response')
                  setMessages(prev =>
                    prev.map(msg =>
                      msg.id === loadingMessage.id
                        ? {
                            ...msg,
                            content:
                              'Sorry, I encountered an error processing your request. Please try again.',
                            isLoading: false,
                          }
                        : msg
                    )
                  )
                  return
                }

                const { ui } = result
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === loadingMessage.id
                      ? {
                          ...msg,
                          generatedUI: ui,
                          isLoading: false,
                        }
                      : msg
                  )
                )
              } catch (error) {
                console.error('Error generating UI:', error)
                toast.error('Failed to generate response')
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === loadingMessage.id
                      ? {
                          ...msg,
                          content:
                            'Sorry, I encountered an error processing your request. Please try again.',
                          isLoading: false,
                        }
                      : msg
                  )
                )
              }
            })
          }
        }, 500)
      }
    } else {
      // Clear any previous transcript
      setTranscript(prev => ({ ...prev, note: '', preview: '' }))
      startSpeechRec()
      toast.success('🎤 Voice recording started. Speak your question!')
    }
  }, [
    Recognition,
    transcript.listening,
    transcript.note,
    startSpeechRec,
    stopSpeechRec,
    setTranscript,
    setInputValue,
    setMessages,
    startTransition,
  ])

  // Handle speech errors
  React.useEffect(() => {
    if (speechErrMessage) {
      toast.error(`Speech recognition error: ${speechErrMessage}`)
    }
  }, [speechErrMessage])

  // Keyboard shortcut for voice input (Ctrl/Cmd + M)
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && !isLoading) {
        e.preventDefault()
        handleMicClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLoading, transcript.listening, handleMicClick])

  // Display current speech preview in the input
  const displayValue =
    transcript.listening && transcript.preview ? transcript.preview : inputValue

  return (
    <div className='container max-w-4xl mx-auto px-4 py-4 sm:py-8 h-screen flex flex-col'>
      <div className='mb-4 sm:mb-8 flex-shrink-0'>
        <h1 className='text-2xl sm:text-3xl font-bold mb-2 text-balance'>
          Forecast Explorer
        </h1>
        <p className='text-muted-foreground text-pretty text-sm sm:text-base'>
          Ask questions about your business data and get AI-powered insights
          with interactive visualisations
        </p>
        {Recognition && (
          <p className='text-xs text-muted-foreground mt-2'>
            💡 Pro tip: Use the microphone button or press{' '}
            <kbd className='px-1 py-0.5 text-xs bg-muted rounded'>Ctrl+M</kbd>{' '}
            for voice input
          </p>
        )}
      </div>

      <div className='flex-1 flex flex-col gap-4 sm:gap-6 min-h-0'>
        <Card className='flex-1 flex flex-col min-h-[400px]'>
          <CardHeader className='pb-4 flex-shrink-0'>
            <CardTitle className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <div className='size-2 bg-green-500 rounded-full animate-pulse'></div>
                AI Assistant
              </div>
              {transcript.listening && (
                <div className='flex items-center gap-2 text-sm font-normal'>
                  <div className='size-2 bg-red-500 rounded-full animate-pulse'></div>
                  <span className='text-muted-foreground'>🎤 Listening</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className='flex-1 flex flex-col min-h-0'>
            <ScrollArea className='flex-1 pr-4 min-h-0'>
              <div className='space-y-4 pb-4'>
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.isLoading ? (
                      <ChatIndicator />
                    ) : (
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] rounded-lg break-words ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground p-3 sm:p-4'
                            : message.generatedUI
                            ? 'bg-transparent p-0'
                            : 'bg-muted p-3 sm:p-4'
                        }`}
                      >
                        {message.generatedUI ? (
                          <div className='w-full'>
                            <GenerativeUI ui={message.generatedUI} />
                            <span className='text-xs opacity-70 mt-2 block text-muted-foreground'>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        ) : message.content ? (
                          <>
                            <p className='text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere'>
                              {message.content}
                            </p>
                            <span className='text-xs opacity-70 mt-2 block'>
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className='mt-4 space-y-3 flex-shrink-0'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Input
                    placeholder={
                      transcript.listening
                        ? '🎤 Listening... Speak your question'
                        : 'Ask about your sales, inventory, or forecasts...'
                    }
                    value={displayValue}
                    onChange={evt =>
                      !transcript.listening && setInputValue(evt.target.value)
                    }
                    onKeyUp={evt =>
                      evt.key === 'Enter' &&
                      !isLoading &&
                      !transcript.listening &&
                      handleSendMessage()
                    }
                    disabled={isLoading}
                    className={`flex-1 min-w-0 ${
                      transcript.listening
                        ? 'border-primary ring-2 ring-primary/20'
                        : ''
                    }`}
                    readOnly={transcript.listening}
                  />
                  {transcript.listening && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      <div className='flex items-center gap-1'>
                        <div className='w-2 h-2 bg-red-500 rounded-full animate-pulse' />
                        <span className='text-xs text-muted-foreground'>
                          Recording
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  size='icon'
                  className='flex-shrink-0'
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <Send className='size-4' />
                  )}
                </Button>
                <Button
                  variant={transcript.listening ? 'default' : 'outline'}
                  size='icon'
                  className={`flex-shrink-0 ${
                    transcript.listening
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : Recognition
                      ? ''
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={handleMicClick}
                  disabled={isLoading || !Recognition}
                  title={
                    !Recognition
                      ? 'Speech recognition not supported'
                      : transcript.listening
                      ? 'Stop recording'
                      : 'Start voice input'
                  }
                >
                  <Mic
                    className={`size-4 ${
                      transcript.listening ? 'animate-pulse' : ''
                    }`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='hidden lg:block space-y-4 flex-shrink-0'>
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg'>Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {suggestedQueries.map((query, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className={`text-xs transition-colors ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:bg-primary hover:text-primary-foreground'
                    }`}
                    onClick={() => !isLoading && handleSuggestedQuery(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
