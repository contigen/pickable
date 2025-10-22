import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { ContextualSummaries } from './schema'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function withTryCatch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch (err) {
    console.error(err)
    return null
  }
}

export function toEmbeddingText(c: ContextualSummaries['items'][number]) {
  const lines: string[] = []
  lines.push(`Content: ${c.content}`)
  lines.push(`Slice Type: ${c.sliceType}`)
  lines.push(`Timeframe: ${c.timeframe}`)

  if (c.metadata && c.metadata.length > 0) {
    lines.push('Metadata:')
    for (const { key, value } of c.metadata) {
      lines.push(`- ${key}: ${value}`)
    }
  }
  return lines.join('\n')
}
