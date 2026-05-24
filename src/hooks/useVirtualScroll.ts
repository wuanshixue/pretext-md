import { useState, useEffect, useCallback, useRef } from 'react'
import type { Block } from '../core/markdown'
import type { BlockMeta } from '../core/virtualization'
import {
  createInitialMetas,
  computeBlockMetas,
  computeTotalHeight,
  computeVisibleRange,
  updateBlockHeight,
} from '../core/virtualization'
import { useSettingsStore } from '../stores/settings'

interface UseVirtualScrollOptions {
  blocks: Block[]
  overscan?: number
}

interface UseVirtualScrollReturn {
  blockMetas: BlockMeta[]
  totalHeight: number
  visibleStart: number
  visibleEnd: number
  containerRef: React.RefObject<HTMLDivElement | null>
  onBlockMeasured: (index: number, height: number) => void
  scrollToBlock: (index: number) => void
  scrollToProgress: (progress: number) => void
}

export function useVirtualScroll({
  blocks,
  overscan = 5,
}: UseVirtualScrollOptions): UseVirtualScrollReturn {
  const { fontSize, maxWidth, lineHeight } = useSettingsStore()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rafRef = useRef<number>(0)
  const fullMeasureRef = useRef(false)

  const [blockMetas, setBlockMetas] = useState<BlockMeta[]>([])
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 })
  const [totalHeight, setTotalHeight] = useState(0)

  // blocks 变化时：先用估算值快速初始化
  useEffect(() => {
    if (blocks.length === 0) {
      setBlockMetas([])
      setTotalHeight(0)
      setVisibleRange({ start: 0, end: 0 })
      fullMeasureRef.current = false
      return
    }

    const initial = createInitialMetas(blocks)
    setBlockMetas(initial)
    setTotalHeight(computeTotalHeight(initial))

    // 初始可视范围
    const container = containerRef.current
    if (container) {
      const range = computeVisibleRange(initial, container.scrollTop, container.clientHeight, overscan)
      setVisibleRange(range)
    }

    // 延迟精确测量（只测量可视区域附近的 block）
    fullMeasureRef.current = false
    requestAnimationFrame(() => {
      if (fullMeasureRef.current) return
      const measured = computeBlockMetas(blocks, fontSize, maxWidth, lineHeight)
      setBlockMetas(measured)
      setTotalHeight(computeTotalHeight(measured))
      fullMeasureRef.current = true
    })
  }, [blocks, fontSize, maxWidth, lineHeight, overscan])

  // 滚动事件处理
  const handleScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const container = containerRef.current
      if (!container) return

      const scrollTop = container.scrollTop
      const viewportHeight = container.clientHeight
      const range = computeVisibleRange(blockMetas, scrollTop, viewportHeight, overscan)
      setVisibleRange(range)
    })
  }, [blockMetas, overscan])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleScroll])

  // DOM 测量回写
  const onBlockMeasured = useCallback(
    (index: number, height: number) => {
      setBlockMetas((prev) => {
        if (index >= prev.length) return prev
        const updated = updateBlockHeight(prev, index, height)
        if (updated !== prev) {
          setTotalHeight(computeTotalHeight(updated))
        }
        return updated
      })
    },
    []
  )

  // 滚动到指定 block
  const scrollToBlock = useCallback(
    (index: number) => {
      const container = containerRef.current
      if (!container || index >= blockMetas.length) return
      container.scrollTop = blockMetas[index].offset
    },
    [blockMetas]
  )

  // 滚动到百分比位置
  const scrollToProgress = useCallback(
    (progress: number) => {
      const container = containerRef.current
      if (!container) return
      container.scrollTop = (progress / 100) * (totalHeight - container.clientHeight)
    },
    [totalHeight]
  )

  return {
    blockMetas,
    totalHeight,
    visibleStart: visibleRange.start,
    visibleEnd: visibleRange.end,
    containerRef,
    onBlockMeasured,
    scrollToBlock,
    scrollToProgress,
  }
}
