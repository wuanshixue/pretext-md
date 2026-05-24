import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Block } from '../core/markdown'
import {
  buildSearchIndex,
  search,
  clearSearchIndex,
  type SearchResult,
} from '../core/search'

interface UseSearchOptions {
  blocks: Block[]
}

interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  currentIndex: number
  resultCount: number
  nextResult: () => void
  prevResult: () => void
  goToResult: (index: number) => void
  clear: () => void
}

export function useSearch({ blocks }: UseSearchOptions): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // 构建索引
  useEffect(() => {
    if (blocks.length > 0) {
      buildSearchIndex(blocks)
    }
    return () => clearSearchIndex()
  }, [blocks])

  // 搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setCurrentIndex(0)
      return
    }
    const r = search(query, 100)
    setResults(r)
    setCurrentIndex(r.length > 0 ? 0 : -1)
  }, [query])

  const resultCount = results.length

  const nextResult = useCallback(() => {
    if (resultCount === 0) return
    setCurrentIndex((i) => (i + 1) % resultCount)
  }, [resultCount])

  const prevResult = useCallback(() => {
    if (resultCount === 0) return
    setCurrentIndex((i) => (i - 1 + resultCount) % resultCount)
  }, [resultCount])

  const goToResult = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const clear = useCallback(() => {
    setQuery('')
    setResults([])
    setCurrentIndex(0)
  }, [])

  return {
    query,
    setQuery,
    results,
    currentIndex,
    resultCount,
    nextResult,
    prevResult,
    goToResult,
    clear,
  }
}
