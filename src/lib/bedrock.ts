import {
  BedrockAgentClient,
  CreateAgentCommand,
  PrepareAgentCommand,
  CreateAgentAliasCommand,
  CreateAgentActionGroupCommand,
  GetAgentCommand,
} from '@aws-sdk/client-bedrock-agent'
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'
import { generateObject } from 'ai'
import { z } from 'zod'
import { bedrock } from '@ai-sdk/amazon-bedrock'

const client = new BedrockAgentClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const runtimeClient = new BedrockAgentRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const ActionSchemas = {
  generateDataSlices: z.object({
    items: z.array(
      z.object({
        content: z.string(),
        timeframe: z.string().optional(),
        sliceType: z.string(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    ),
  }),
  serialiseQuery: z.object({
    serialisedQuery: z.string(),
    timeframe: z.string(),
    count: z.number(),
  }),
  filterByTimeframe: z.object({
    items: z.array(
      z.object({
        content: z.string(),
        timeframe: z.string(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    ),
  }),
  computeForecast: z.object({
    reportName: z.string(),
    suggestedQueries: z.array(z.string()),
    forecastSummary: z.object({
      period: z.string(),
      confidence: z.number().min(0).max(100),
      trend: z.enum(['upward', 'downward', 'stable']),
      keyMetrics: z.object({
        revenue: z.object({
          current: z.number(),
          predicted: z.number(),
          change: z.number(),
        }),
        inventory: z.object({
          current: z.number(),
          predicted: z.number(),
          change: z.number(),
        }),
        customers: z.object({
          current: z.number(),
          predicted: z.number(),
          change: z.number(),
        }),
      }),
      overview: z.string(),
      summary: z.string(),
      description: z.string(),
    }),
    smartInsights: z.array(
      z.object({
        title: z.string(),
        value: z.string(),
        change: z.string().optional(),
        changeType: z.enum(['positive', 'negative', 'neutral']),
        icon: z.string(),
        trend: z.enum(['up', 'down', 'stable']),
        description: z.string().optional(),
        confidence: z.number().min(0).max(100),
        aiInsight: z.string(),
      })
    ),
    insights: z.array(
      z.object({
        type: z.union([
          z.enum(['opportunity', 'warning', 'insight']),
          z.string(),
        ]),
        title: z.string(),
        description: z.string(),
        impact: z.enum(['high', 'medium', 'low']),
        confidence: z.number().min(0).max(100),
      })
    ),
    recommendations: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(['high', 'medium', 'low']),
        timeframe: z.string(),
        impact: z.string(),
        icon: z.string(),
        actions: z.array(z.string()),
      })
    ),
    chartData: z.object({
      forecast: z.array(
        z.object({
          month: z.string(),
          actual: z.number(),
          predicted: z.boolean().nullable(),
        })
      ),
      revenueBreakdown: z.array(
        z.object({
          month: z.string(),
          products: z.number(),
          services: z.number(),
          subscriptions: z.number(),
        })
      ),
      seasonalPatterns: z.array(
        z.object({
          month: z.string(),
          thisYear: z.number(),
          lastYear: z.string(),
          average: z.number(),
        })
      ),
      customerAcquisition: z.array(
        z.object({
          month: z.string(),
          newCustomers: z.number(),
          totalCustomers: z.number(),
          churnRate: z.number(),
        })
      ),
      inventoryTurnover: z.array(
        z.object({
          month: z.string(),
          inventory: z.number(),
          turnover: z.number(),
          daysOnHand: z.number(),
        })
      ),
      profitMargin: z.array(
        z.object({
          month: z.string(),
          revenue: z.number(),
          costs: z.number(),
          grossMargin: z.number(),
          netMargin: z.number(),
        })
      ),
    }),
  }),
  generateSQL: z.object({
    sqlCode: z.string(),
  }),
  validateSQL: z.object({
    isValid: z.boolean(),
    sqlCode: z.string(),
  }),
  generateUI: z.object({
    ui: z.string(),
  }),
  repairUI: z.object({
    ui: z.string(),
  }),
} as const

type AgentAction = {
  action: keyof typeof ActionSchemas
  data?: string | Record<string, unknown>
  query?: string
  timeframe?: string
  sql?: string
  usecase?: string
  text?: string
  error?: string
  userId?: string
}

export async function invokeAgent<T extends keyof typeof ActionSchemas>(
  agentId: string,
  agentAliasId: string,
  sessionId: string,
  inputText: string,
  schema?: (typeof ActionSchemas)[T]
): Promise<string>
export async function invokeAgent<T extends keyof typeof ActionSchemas>(
  agentId: string,
  agentAliasId: string,
  sessionId: string,
  inputText: AgentAction & { action: T },
  schema: (typeof ActionSchemas)[T],
  userId?: string
): Promise<z.infer<(typeof ActionSchemas)[T]>>
export async function invokeAgent<T extends keyof typeof ActionSchemas>(
  agentId: string,
  agentAliasId: string,
  sessionId: string,
  inputText: string | (AgentAction & { action: T }),
  schema?: (typeof ActionSchemas)[T],
  userId?: string
) {
  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId,
    inputText:
      typeof inputText === 'string'
        ? inputText
        : JSON.stringify({
            ...(inputText as AgentAction),
            userId,
          }),
  })

  try {
    const response = await runtimeClient.send(command)
    let agentResponse = ''
    if (response.completion) {
      for await (const event of response.completion) {
        if (event.chunk?.bytes) {
          const text = new TextDecoder().decode(event.chunk.bytes)
          agentResponse += text
        }
      }
    }
    if (!schema) {
      return agentResponse
    }

    // Use generateObject to structure the agent's text response
    // Use Claude Haiku for UI generation actions, Nova Pro for others
    const isUIAction =
      typeof inputText === 'object' &&
      (inputText.action === 'generateUI' || inputText.action === 'repairUI')

    const getSystemPrompt = () => {
      if (typeof inputText === 'object') {
        const action = inputText.action
        if (action === 'generateUI') {
          return `You are a UI/UX expert specializing in business analytics dashboards. Your task is to generate React JSX code that visualises business data in creative, query-specific ways.

IMPORTANT: You MUST return a valid "ui" field containing the JSX string.

DESIGN PRINCIPLES:
- Use emojis for icons where appropriate
- Create layouts that match the query type and data
- Make it responsive and visually appealing
- Include interactive elements when appropriate
- Use Tailwind CSS for styling

QUERY TYPES & UI PATTERNS:
1. REVENUE/SALES queries → Revenue cards, growth charts, trend indicators
2. INVENTORY queries → Stock level bars, critical alerts, reorder widgets
3. CUSTOMER queries → User metrics, retention rates, satisfaction scores
4. FORECAST queries → Timeline views, prediction confidence, scenario cards
5. COMPARISON queries → Side-by-side comparisons, percentage differences
6. GENERAL queries → Mixed dashboard-style layout

STYLING GUIDELINES:
- Border radius: rounded-md, rounded-lg, rounded-xl
- Use proper Tailwind classes (no dynamic classes)
- Include proper className attributes
- Use semantic HTML elements
- The design system are defined in the :root & .dark section below. Use them to set the background colour of the components.
root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 217 91% 60%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
  }

  .dark {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;
    --popover: 224 71% 4%;
    --popover-foreground: 213 31% 91%;
    --primary: 217 91% 60%;
    --primary-foreground: 222 84% 5%;
    --secondary: 222 84% 5%;
    --secondary-foreground: 213 31% 91%;
    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 216 34% 17%;
  }

IMPORTANT RULES:
- NO JSX comments {/* */}
- NO regular comments /* */
- Use clean, semantic JSX only
- Ensure all JSX is properly formatted
- Return ONLY the JSX code as a string in the "ui" field
- Make sure the UI is responsive, and does't contrast with the overall app UI, per the tw design system provided

Example output structure:
{
  "ui": "<div className='p-4 bg-background rounded-lg'>...</div>"
}`
        }

        if (action === 'repairUI') {
          return `You are a UI/UX expert specializing in fixing malformed React JSX code.

Your task is to repair the provided JSX code and return valid, working JSX.

REPAIR GUIDELINES:
- Fix syntax errors
- Ensure all tags are properly closed
- Fix className issues
- Ensure valid JSX structure
- Remove any comments
- Use proper Tailwind CSS classes

Return the repaired JSX code as a string in the "ui" field.`
        }
      }

      return `Extract and structure the information from the input text according to the required schema. Return valid JSON that matches the schema exactly.`
    }

    const getPrompt = () => {
      if (typeof inputText === 'object') {
        if (inputText.action === 'generateUI') {
          const { query, data } = inputText as {
            query?: string
            data?: string
            action: string
          }
          return `Generate a creative and visually appealing React JSX UI component for this business analytics query.

QUERY: ${query || 'Business data analysis'}

DATA TO VISUALIZE:
${data || agentResponse}

Create a UI component that:
1. Displays the data in an intuitive, easy-to-understand format
2. Uses appropriate visualizations (cards, metrics, trends)
3. Matches the query context
4. Is responsive and modern
5. Uses Tailwind CSS for styling

Return the JSX code as a single string in the "ui" field.`
        }

        if (inputText.action === 'computeForecast') {
          const { data: businessData } = inputText as {
            data?: string
            action: string
          }
          return `Analyze the following business data and generate a comprehensive dashboard report with ALL chart data populated.

BUSINESS DATA:
${businessData || agentResponse}`
        }
      }

      return agentResponse
    }

    const { object } = await generateObject({
      model: bedrock(
        isUIAction
          ? 'arn:aws:bedrock:us-east-1:625590667985:inference-profile/global.anthropic.claude-haiku-4-5-20251001-v1:0'
          : 'amazon.nova-pro-v1:0'
      ),
      schema,
      prompt: getPrompt(),
      system: getSystemPrompt(),
    })

    return object
  } catch (error) {
    console.error(
      'Error invoking agent:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error instanceof Error ? error : new Error('Failed to invoke agent')
  }
}

export type ActionTypes = keyof typeof ActionSchemas
export { ActionSchemas }

export async function createBedrockAgent(
  agentName: string,
  instruction: string,
  roleArn: string
) {
  const command = new CreateAgentCommand({
    agentName,
    foundationModel:
      'arn:aws:bedrock:us-east-1:625590667985:inference-profile/us.amazon.nova-premier-v1:0',
    instruction,
    agentResourceRoleArn: roleArn,
    description: 'A Bedrock Agent',
    idleSessionTTLInSeconds: 600,
  })

  try {
    const response = await client.send(command)
    console.log('Agent created:', response.agent?.agentId)
    return response.agent
  } catch (error) {
    console.error('Error creating agent:', error)
    throw error
  }
}

export async function createActionGroup(
  agentId: string,
  agentVersion: string,
  actionGroupName: string,
  lambdaArn: string
) {
  const command = new CreateAgentActionGroupCommand({
    agentId,
    agentVersion,
    actionGroupName,
    actionGroupExecutor: {
      lambda: lambdaArn,
    },
    apiSchema: {
      payload: JSON.stringify({
        openapi: '3.0.0',
        info: {
          title: 'Business Data Analysis API',
          version: '1.0.0',
        },
        paths: {
          '/generateDataSlices': {
            post: {
              summary: 'Generate contextual data slices for business data',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Data slices generated successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          items: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                content: { type: 'string' },
                                timeframe: { type: 'string' },
                                sliceType: { type: 'string' },
                                metadata: { type: 'object' },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/serialiseQuery': {
            post: {
              summary: 'Serialise user query for semantic search',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Query serialised successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          serialisedQuery: { type: 'string' },
                          timeframe: { type: 'string' },
                          count: { type: 'number' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/filterByTimeframe': {
            post: {
              summary: 'Filter data by timeframe',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'array' },
                        timeframe: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Data filtered successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            content: { type: 'string' },
                            timeframe: { type: 'string' },
                            metadata: { type: 'object' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/computeForecast': {
            post: {
              summary: 'Generate business forecast',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'Forecast generated successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          forecast: { type: 'object' },
                          insights: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                          recommendations: {
                            type: 'array',
                            items: { type: 'string' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/generateSQL': {
            post: {
              summary: 'Generate SQL code for vector search operations',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        usecase: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'SQL code generated successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          sqlCode: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/validateSQL': {
            post: {
              summary: 'Validate SQL code for safety and correctness',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        sql: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'SQL code validated successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          isValid: { type: 'boolean' },
                          sqlCode: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/generateUI': {
            post: {
              summary: 'Generate dynamic UI for business analytics data',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                        data: { type: 'string' },
                        userId: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'UI generated successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          ui: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/repairUI': {
            post: {
              summary: 'Repair malformed UI JSX',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        text: { type: 'string' },
                        error: { type: 'string' },
                        userId: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'UI repaired successfully',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          ui: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    },
  })

  try {
    const response = await client.send(command)
    console.log(
      'Action group created:',
      response.agentActionGroup?.actionGroupId
    )
    return response.agentActionGroup
  } catch (error) {
    console.error('Error creating action group:', error)
    throw error
  }
}

export async function prepareAgent(agentId: string) {
  const command = new PrepareAgentCommand({
    agentId,
  })

  try {
    const response = await client.send(command)
    console.log('Agent prepared:', response.agentStatus)
    await waitForAgentReady(agentId)
    return response
  } catch (error) {
    console.error('Error preparing agent:', error)
    throw error
  }
}

async function waitForAgentReady(agentId: string, maxAttempts: number = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const getCommand = new GetAgentCommand({ agentId })
    const response = await client.send(getCommand)

    const status = response.agent?.agentStatus
    console.log(`Agent status: ${status} (attempt ${i + 1}/${maxAttempts})`)

    if (status === 'PREPARED' || status === 'NOT_PREPARED') {
      console.log('✅ Agent is ready!')
      return
    }

    if (status === 'FAILED') {
      throw new Error('Agent preparation failed')
    }

    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  throw new Error('Agent preparation timed out')
}

export async function createAgentAlias(agentId: string, aliasName: string) {
  const command = new CreateAgentAliasCommand({
    agentId,
    agentAliasName: aliasName,
  })

  try {
    const response = await client.send(command)
    console.log('Agent alias created:', response.agentAlias?.agentAliasId)
    return response.agentAlias
  } catch (error) {
    console.error('Error creating agent alias:', error)
    throw error
  }
}

export async function setupCompleteAgent(
  agentName: string,
  instruction: string
) {
  try {
    const ROLE_ARN = process.env.BEDROCK_AGENT_ROLE_ARN
    if (!ROLE_ARN) {
      throw new Error('BEDROCK_AGENT_ROLE_ARN is not set')
    }
    const agent = await createBedrockAgent(agentName, instruction, ROLE_ARN)
    const agentId = agent?.agentId
    if (!agentId) {
      throw new Error('Agent ID is required')
    }
    await prepareAgent(agentId)
    const alias = await createAgentAlias(agentId, 'production')

    return {
      agentId,
      agentAliasId: alias?.agentAliasId,
    }
  } catch (error) {
    console.error('Error in complete setup:', error)
    throw error
  }
}
