'use server'

import { bedrock } from '@ai-sdk/amazon-bedrock'
import { generateText } from 'ai'
import {
  BedrockAgentClient,
  BedrockAgentClientConfig,
  CreateAgentCommand,
} from '@aws-sdk/client-bedrock-agent'

export async function demoAction() {
  const { text } = await generateText({
    model: bedrock('amazon.nova-pro-v1:0'),
    prompt: 'Generate a demo text',
  })
  console.log(text)
  return text
}

const config: BedrockAgentClientConfig = {
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}
const client = new BedrockAgentClient(config)

export async function callBedrockAgent() {
  const command = new CreateAgentCommand({
    agentName: 'demo-agent',
    description: 'A Bedrock Agent',
    // instruction: 'You are a Bedrock Agent',
    agentCollaboration: 'SUPERVISOR',
  })
  const response = await client.send(command)
  console.log(response)
}
