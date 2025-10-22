import { SYSTEM_INSTRUCTION } from '@/app/constant'
import { createBedrockAgent, prepareAgent, createAgentAlias } from './bedrock'

async function setupAgent() {
  console.log('🚀 Starting Bedrock Agent Setup...\n')

  try {
    // STEP 1: Set your values here
    const AGENT_NAME = 'MyBedrockAgentttttt'
    const ROLE_ARN = process.env.BEDROCK_AGENT_ROLE_ARN || 'YOUR_ROLE_ARN_HERE'

    if (ROLE_ARN === 'YOUR_ROLE_ARN_HERE') {
      throw new Error(
        'Please set BEDROCK_AGENT_ROLE_ARN in .env.local or replace it in this script'
      )
    }

    console.log('📋 Configuration:')
    console.log('  Agent Name:', AGENT_NAME)
    console.log('  Role ARN:', ROLE_ARN)
    console.log('')

    // STEP 2: Create the agent
    console.log('1️⃣  Creating agent...')
    const agent = await createBedrockAgent(
      AGENT_NAME,
      SYSTEM_INSTRUCTION,
      ROLE_ARN
    )

    if (!agent?.agentId) {
      throw new Error('Failed to create agent - no agentId returned')
    }

    console.log('   ✅ Agent created:', agent.agentId)
    console.log('')

    // STEP 3: Prepare the agent
    console.log('2️⃣  Preparing agent (this may take 30-60 seconds)...')
    await prepareAgent(agent.agentId)
    console.log('   ✅ Agent prepared and ready')
    console.log('')

    // STEP 4: Create alias
    console.log('3️⃣  Creating agent alias...')
    const alias = await createAgentAlias(agent.agentId, 'production')

    if (!alias?.agentAliasId) {
      throw new Error('Failed to create alias - no agentAliasId returned')
    }

    console.log('   ✅ Alias created:', alias.agentAliasId)
    console.log('')

    // STEP 5: Show results
    console.log('🎉 Setup Complete!\n')
    console.log('📝 Add these to your .env.local file:\n')
    console.log('BEDROCK_AGENT_ID=' + agent.agentId)
    console.log('BEDROCK_AGENT_ALIAS_ID=' + alias.agentAliasId)
    console.log('')
    console.log('Then restart your Next.js server:')
    console.log('  npm run dev')
    console.log('')

    return {
      agentId: agent.agentId,
      agentAliasId: alias.agentAliasId,
    }
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message)
    console.error('\nFull error:', error)
    throw error
  }
}

// Run the setup
setupAgent()
  .then(() => {
    console.log('✨ All done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
