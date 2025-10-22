import { setupCompleteAgent } from '../src/lib/bedrock'

async function setupAgent() {
  if (!process.env.BEDROCK_AGENT_ROLE_ARN) {
    throw new Error('BEDROCK_AGENT_ROLE_ARN environment variable is required')
  }

  try {
    console.log('Setting up Bedrock agent...')
    const { agentId, agentAliasId } = await setupCompleteAgent(
      'business-data-agent',
      `You are a specialized business data analysis agent. Your capabilities include:
      1. Analyzing and slicing business data into meaningful contextual segments
      2. Understanding and serializing user queries for semantic search
      3. Filtering data based on timeframes and business context
      4. Generating business forecasts and insights
      5. Providing actionable recommendations based on data analysis

      You understand various business metrics, KPIs, and can identify patterns in:
      - Sales and revenue data
      - Customer acquisition and retention
      - Inventory management
      - Financial performance
      - Market trends and seasonality

      You follow these principles:
      1. Maintain data confidentiality and isolation between different users' data
      2. Provide accurate and actionable insights specific to each user's context
      3. Consider business context in all analyses while respecting data boundaries
      4. Highlight significant patterns and anomalies in user-specific datasets
      5. Suggest data-driven recommendations based on individual user data

      Important: You will receive a userId in each request. Only analyze and operate on
      data belonging to that specific user. Never mix or expose data between different users.`
    )

    console.log('\nAgent setup completed successfully!')
    console.log('Agent ID:', agentId)
    console.log('Agent Alias ID:', agentAliasId)
    console.log('\nAdd these values to your .env file:')
    console.log(`BEDROCK_AGENT_ID=${agentId}`)
    console.log(`BEDROCK_AGENT_ALIAS_ID=${agentAliasId}`)
  } catch (error) {
    console.error('Failed to setup agent:', error)
    process.exit(1)
  }
}

setupAgent()
