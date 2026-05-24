import { Index } from 'flexsearch'
import type { Block } from './markdown'

interface SearchEntry {
  id: number
  blockId: string
  text: string
  blockIndex: number
}

export interface SearchResult {
  blockId: string
  blockIndex: number
  text: string
  matchPositions: { start: number; end: number }[]
}

let index: InstanceType<typeof Index> | null = null
let entries: SearchEntry[] = []

export function buildSearchIndex(blocks: Block[]) {
  index = new Index({
    tokenize: 'forward',
    cache: true,
    resolution: 9,
  })

  entries = blocks.map((block, i) => ({
    id: i,
    blockId: block.id,
    text: block.content,
    blockIndex: i,
  }))

  for (const entry of entries) {
    if (entry.text.trim()) {
      index.add(entry.id, entry.text)
    }
  }
}

export function search(query: string, limit = 50): SearchResult[] {
  if (!index || !query.trim()) return []

  const rawResults = index.search(query.trim(), { limit })

  // FlexSearch 可能返回 Promise，同步模式下是数组
  if (!Array.isArray(rawResults)) return []

  return rawResults
    .map((id: number | string) => {
      const entry = entries[id as number]
      if (!entry) return null
      return {
        blockId: entry.blockId,
        blockIndex: entry.blockIndex,
        text: entry.text,
        matchPositions: findMatchPositions(entry.text, query.trim()),
      }
    })
    .filter((r): r is SearchResult => r !== null)
}

function findMatchPositions(
  text: string,
  query: string
): { start: number; end: number }[] {
  const positions: { start: number; end: number }[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = query.toLowerCase()
  let pos = 0

  while (pos < lowerText.length) {
    const idx = lowerText.indexOf(lowerQuery, pos)
    if (idx === -1) break
    positions.push({ start: idx, end: idx + query.length })
    pos = idx + 1
  }

  return positions
}

export function clearSearchIndex() {
  index = null
  entries = []
}

export function highlightMatches(
  text: string,
  positions: { start: number; end: number }[]
): { text: string; highlight: boolean }[] {
  if (positions.length === 0) return [{ text, highlight: false }]

  const segments: { text: string; highlight: boolean }[] = []
  let lastEnd = 0

  for (const { start, end } of positions) {
    if (start > lastEnd) {
      segments.push({ text: text.slice(lastEnd, start), highlight: false })
    }
    segments.push({ text: text.slice(start, end), highlight: true })
    lastEnd = end
  }

  if (lastEnd < text.length) {
    segments.push({ text: text.slice(lastEnd), highlight: false })
  }

  return segments
}
