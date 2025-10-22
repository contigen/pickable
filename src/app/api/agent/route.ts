import { NextRequest, NextResponse } from 'next/server'
import { invokeAgent } from '@/lib/bedrock'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const agentId = process.env.BEDROCK_AGENT_ID!
    const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
    const activeSessionId = sessionId || uuidv4()
    console.log('activeSessionId', activeSessionId)

    const response = await invokeAgent(
      agentId,
      agentAliasId,
      activeSessionId,
      message
    )

    return NextResponse.json({
      response,
      sessionId: activeSessionId,
    })
  } catch (error: any) {
    console.error('API Error:', error.message)
    console.error('Error name:', error.name)
    console.error('Error code:', error.$metadata?.httpStatusCode)
    return NextResponse.json(
      { error: error.message || 'Failed to invoke agent' },
      { status: 500 }
    )
  }
}
