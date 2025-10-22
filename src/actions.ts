'use server'

import { embedMany, embed } from 'ai'
import { bedrock } from '@ai-sdk/amazon-bedrock'
import { ZodError } from 'zod'
import { ContextualSummaries, loginSchema } from './lib/schema'
import { DATASET_TAG, FORECAST_TAG } from './app/constant'
import { invokeAgent, ActionSchemas } from './lib/bedrock'
import { auth, signIn } from '@/auth'
import {
  createBusinessDataset,
  createUser,
  getLatestDataset,
  getUser,
} from './lib/db-queries'
import { redirect } from 'next/navigation'
import prisma from './lib/prisma'
import { EmbeddingModelV2Embedding } from '@ai-sdk/provider'
import { toEmbeddingText } from './lib/utils'
import { Prisma } from '@prisma/client'
import { revalidateTag, unstable_cache } from 'next/cache'

export type SimilarEmbeddingResult = {
  embeddingId: string
  recordId: string
  content: string
  timeframe: string | null
  metadata: Prisma.JsonValue
  distance: number
}

export type RegisterActionState = {
  message:
    | `failed to create user`
    | `user created`
    | `invalid data`
    | `user logged in`
    | ``
}

const agentId = process.env.BEDROCK_AGENT_ID!
const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!

export async function loginUser(
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> {
  try {
    const email = formData.get(`email`)
    const businessName = formData.get(`business_name`)
    const validatedFormData = await loginSchema.parseAsync({
      businessName,
      email,
    })
    const user = await getUser(validatedFormData.email)
    if (user) {
      await signIn(`credentials`, {
        email: validatedFormData.email,
        businessName: validatedFormData.businessName,
        redirect: false,
      })
      return { message: `user logged in` }
    }
    const newUser = await createUser({
      email: validatedFormData.email,
      businessName: validatedFormData.businessName,
    })
    if (!newUser) {
      return { message: `failed to create user` }
    } else {
      await signIn(`credentials`, {
        email: validatedFormData.email,
        businessName: validatedFormData.businessName,
        redirect: false,
      })
      return {
        message: `user created`,
      }
    }
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        message: `invalid data`,
      }
    }
    return { message: `failed to create user` }
  }
}

export async function getUserSession() {
  const session = await auth()
  if (!session?.user) redirect('/onboarding')
  return session?.user
}

export async function getUserId() {
  return (await getUserSession()).id
}

export async function getUserEmail() {
  return (await getUserSession()).email
}

export async function processCSV(
  data: string[][],
  datasetName = 'business_data'
) {
  await getUserId()
  try {
    const dataSlices = await generateDataSlices(data.join('\n'))

    const embeddings = await generateEmbeddings(
      dataSlices.map(c =>
        toEmbeddingText({
          ...c,
          timeframe: c.timeframe || '',
          metadata: c.metadata
            ? Object.entries(c.metadata).map(([key, value]) => ({
                key,
                value: String(value),
              }))
            : undefined,
        })
      )
    )

    console.log(dataSlices, embeddings.length, dataSlices.length)
    const sliceTypes = dataSlices.map(s => s.sliceType).join()
    const dataset = await storeBusinessData(data, datasetName, sliceTypes)

    if (!dataset) {
      return { message: 'failed to store business data' }
    }

    const records = await storeBusinessRecordWithEmbedding(
      dataset.id,
      embeddings,
      dataSlices.map(slice => ({
        ...slice,
        timeframe: slice.timeframe || '',
        metadata: slice.metadata
          ? Object.entries(slice.metadata).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : undefined,
      }))
    )

    revalidateTag(FORECAST_TAG)
    revalidateTag(DATASET_TAG)
    return { records }
  } catch (error) {
    console.error(error)
    return { message: 'Server error: could not process CSV' }
  }
}

export async function generateUserInputEmbedding(input: string) {
  const model = bedrock.embedding('amazon.titan-embed-text-v2:0')

  const { embedding } = await embed({
    model,
    value: input,
  })
  return embedding
}

export async function generateEmbeddings(queries: string[]) {
  const model = bedrock.embedding('amazon.titan-embed-text-v2:0')

  const { embeddings } = await embedMany({
    model,
    values: queries,
  })

  return embeddings
}

export async function storeBusinessData(
  data: string[][],
  name: string,
  sliceTypes: string
) {
  const userId = (await getUserId())!
  const dataset = await createBusinessDataset({
    name,
    userId,
    data: data.join(),
    sliceTypes,
  })

  return dataset
}

export async function storeBusinessRecordWithEmbedding(
  datasetId: string,
  vectors: EmbeddingModelV2Embedding[],
  slices: ContextualSummaries['items']
) {
  const records = await prisma.$transaction(async tx => {
    await tx.businessRecord.createMany({
      data: slices.map(s => ({
        datasetId,
        content: s.content,
        timeframe: s.timeframe,
        metadata: s.metadata || {},
      })),
    })

    return await tx.businessRecord.findMany({
      where: { datasetId },
      orderBy: { createdAt: 'asc' },
      take: slices.length,
    })
  })
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const vector = vectors[i]
    const embeddingId = `clp${crypto.randomUUID()}`
    const vectorString = `[${vector.join(',')}]`
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO BusinessEmbedding (id, recordId, vector) VALUES (?, ?, ?)`,
        embeddingId,
        record.id,
        vectorString
      )
    } catch (error) {
      console.error(`Failed to insert vector ${i}:`, error)
      throw error
    }
  }
  return records
}

export async function serialiseUserQuery(query: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'serialiseQuery',
      query: query,
    },
    ActionSchemas.serialiseQuery,
    userId
  )

  return {
    count: result.count,
    serialisedQuery: result.serialisedQuery,
    timeframe: result.timeframe,
  }
}

export async function semanticSearch(
  query: string,
  datasetId: string,
  count: number
): Promise<SimilarEmbeddingResult[]> {
  const queryEmbedding = await generateUserInputEmbedding(query)
  return await searchSimilarEmbeddings(queryEmbedding, datasetId, count ?? 10)
}

export async function searchSimilarEmbeddings(
  queryVector: number[],
  datasetId: string,
  limit: number,
  threshold: number = 0.3
) {
  const vectorStr = `[${queryVector.join(',')}]`

  console.log('Vector search params:', {
    datasetId,
    limit,
    threshold,
    vectorDimension: queryVector.length,
    distanceThreshold: 1 - threshold,
  })
  const count = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*) as count 
     FROM BusinessEmbedding e 
     JOIN BusinessRecord r ON e.recordId = r.id 
     WHERE r.datasetId = ?`,
    datasetId
  )
  console.log('Total embeddings for dataset:', count[0]?.count)
  let results = await prisma.$queryRawUnsafe(
    `
    SELECT 
      e.id AS embeddingId,
      e.recordId,
      r.content,
      r.timeframe,
      r.metadata,
      VEC_COSINE_DISTANCE(e.vector, ?) AS distance
    FROM BusinessEmbedding e
    JOIN BusinessRecord r ON e.recordId = r.id
    WHERE r.datasetId = ?
      AND VEC_COSINE_DISTANCE(e.vector, ?) < ?
    ORDER BY distance ASC
    LIMIT ?
  `,
    vectorStr,
    datasetId,
    vectorStr,
    1 - threshold,
    limit
  )

  const resultsArray = results as SimilarEmbeddingResult[]
  if (resultsArray.length === 0) {
    console.log(
      'No results with threshold, fetching closest matches without threshold'
    )
    results = await prisma.$queryRawUnsafe(
      `
      SELECT 
        e.id AS embeddingId,
        e.recordId,
        r.content,
        r.timeframe,
        r.metadata,
        VEC_COSINE_DISTANCE(e.vector, ?) AS distance
      FROM BusinessEmbedding e
      JOIN BusinessRecord r ON e.recordId = r.id
      WHERE r.datasetId = ?
      ORDER BY distance ASC
      LIMIT ?
    `,
      vectorStr,
      datasetId,
      limit
    )
  }

  const finalResults = results as SimilarEmbeddingResult[]
  console.log('Similarity search results:', {
    resultCount: finalResults.length,
    results: finalResults,
  })
  return finalResults
}

export async function generateQueryResult(query: string) {
  const userId = (await getUserId())!
  const dataset = await getLatestDataset(userId)
  if (!dataset) return null

  const { serialisedQuery, count, timeframe } = await serialiseUserQuery(query)

  console.log(
    'serialisedQuery, count, timeframe',
    serialisedQuery,
    count,
    timeframe
  )
  const results = await semanticSearch(serialisedQuery, dataset.id, count)
  if (timeframe) {
    const filteredResults = await filterByTimeframeWithLLM(results, timeframe)
    return filteredResults
  }
  return results
}

export async function generateDataSlices(data: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'generateDataSlices',
      data: data,
    },
    ActionSchemas.generateDataSlices,
    userId
  )

  return result.items
}

export async function generateSQLCode(input: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'generateSQL',
      usecase: input,
    },
    ActionSchemas.generateSQL,
    userId
  )

  return result
}

export async function validateSQLCode(input: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'validateSQL',
      sql: input,
    },
    ActionSchemas.validateSQL,
    userId
  )

  return result
}

export async function filterByTimeframeWithLLM(
  data: SimilarEmbeddingResult[],
  timeframe?: string
) {
  if (!timeframe) return

  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()
  const userId = await getUserId()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'filterByTimeframe',
      data: JSON.stringify(data),
      timeframe: timeframe,
    },
    ActionSchemas.filterByTimeframe,
    userId
  )

  return result.items
}

export async function computeForecast(data: string, userId: string) {
  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!
  const sessionId = crypto.randomUUID()

  const result = await invokeAgent(
    agentId,
    agentAliasId,
    sessionId,
    {
      action: 'computeForecast',
      data: data,
    },
    ActionSchemas.computeForecast,
    userId
  )

  return result
}

export async function getForecast(data: string, userId: string) {
  return unstable_cache(
    async () => computeForecast(data, userId),
    [FORECAST_TAG],
    {
      tags: [FORECAST_TAG],
    }
  )()
}

export async function emailReport(_data: string) {}

export async function getCachedDataset(userId: string) {
  return unstable_cache(async () => getLatestDataset(userId), [DATASET_TAG], {
    tags: [DATASET_TAG],
  })()
}
