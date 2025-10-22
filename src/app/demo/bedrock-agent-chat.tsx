import { useState, KeyboardEvent } from 'react'
import { Send, Bot, User } from 'lucide-react'

export function BedrockAgentChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          sessionId: sessionId || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${error.message}`,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter' && !evt.shiftKey) {
      evt.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    setSessionId('')
    setInput('')
  }

  return (
    <div className='flex flex-col h-screen max-w-4xl mx-auto bg-gradient-to-br from-slate-900 to-slate-800'>
      <div className='bg-slate-800 border-b border-slate-700 p-4 shadow-lg'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Bot className='w-8 h-8 text-blue-400' />
            <div>
              <h1 className='text-xl font-bold text-white'>
                AWS Bedrock Agent
              </h1>
              <p className='text-sm text-slate-400'>
                {sessionId
                  ? `Session: ${sessionId.slice(0, 8)}...`
                  : 'No active session'}
              </p>
            </div>
          </div>
          <button
            onClick={clearChat}
            className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors'
          >
            Clear Chat
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 space-y-4'>
        {messages.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full text-slate-400'>
            <Bot className='w-16 h-16 mb-4 opacity-50' />
            <p className='text-lg'>
              Start a conversation with your Bedrock Agent
            </p>
            <p className='text-sm mt-2'>Ask me anything!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
                  <Bot className='w-5 h-5 text-white' />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}
              >
                <p className='whitespace-pre-wrap'>{message.content}</p>
              </div>

              {message.role === 'user' && (
                <div className='w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0'>
                  <User className='w-5 h-5 text-white' />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className='flex gap-3 justify-start'>
            <div className='w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0'>
              <Bot className='w-5 h-5 text-white' />
            </div>
            <div className='bg-slate-700 rounded-2xl px-4 py-3'>
              <div className='flex gap-1'>
                <div
                  className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'
                  style={{ animationDelay: '0ms' }}
                ></div>
                <div
                  className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'
                  style={{ animationDelay: '150ms' }}
                ></div>
                <div
                  className='w-2 h-2 bg-slate-400 rounded-full animate-bounce'
                  style={{ animationDelay: '300ms' }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='border-t border-slate-700 bg-slate-800 p-4'>
        <div className='flex gap-2'>
          <input
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Type your message...'
            disabled={loading}
            className='flex-1 bg-slate-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50'
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className='bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 transition-colors flex items-center gap-2'
          >
            <Send className='w-5 h-5' />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}
