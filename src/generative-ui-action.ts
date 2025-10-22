'use server'

import { generateQueryResult, getUserId } from './actions'
import { invokeAgent, ActionSchemas } from './lib/bedrock'
import crypto from 'crypto'

export async function generateQueryResultUI(query: string) {
  const data = await generateQueryResult(query)
  if (!data) return null
  console.log('data from generateQueryResult', data)
  return await generateUI(query, data.join('\n'))
}

export async function generateUI(query: string, data: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'generateUI',
      query,
      data,
    },
    ActionSchemas.generateUI,
    userId
  )
  if (!result?.ui?.trim()) {
    const repairedResult = await invokeAgent(
      agentId,
      agentAliasId,
      sessionId,
      {
        action: 'repairUI',
        text: result.ui,
        error: 'Invalid or empty UI',
      },
      ActionSchemas.repairUI,
      userId
    )

    return repairedResult
  }

  return result
}
