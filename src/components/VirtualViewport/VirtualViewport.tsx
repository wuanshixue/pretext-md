import { useCallback } from 'react'
import type { Block } from '../../core/markdown'
import { BlockRenderer } from '../Reader/BlockRenderer'
import { useVirtualScroll } from '../../hooks/useVirtualScroll'
import { useSettingsStore } from '../../stores/settings'
import { useReaderStore } from '../../stores/reader'
import { useHistoryStore } from '../../stores/history'

export function VirtualViewport() {
  const blocks = useReaderStore((s) => s.blocks)
  const { fontSize, maxWidth, lineHeight } = useSettingsStore()
  const setProgress = useReaderStore((s) => s.setProgress)
  const setScrollTop = useReaderStore((s) => s.setScrollTop)
  const filePath = useReaderStore((s) => s.filePath)
  const updateProgress = useHistoryStore((s) => s.updateProgress)

  const {
    blockMetas,
    totalHeight,
    visibleStart,
    visibleEnd,
    containerRef,
    onBlockMeasured,
  } = useVirtualScroll({ blocks })

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || totalHeight <= 0) return

    const scrollTop = container.scrollTop
    const maxScroll = Math.max(1, totalHeight - container.clientHeight)
    const progress = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100))

    setScrollTop(scrollTop)
    setProgress(Math.round(progress * 10) / 10)

    if (filePath) {
      updateProgress(filePath, progress)
    }
  }, [containerRef, totalHeight, setScrollTop, setProgress, filePath, updateProgress])

  const visibleBlocks = blocks.slice(visibleStart, visibleEnd)
  const offsetY = blockMetas[visibleStart]?.offset || 0

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div style={{ minHeight: totalHeight || '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform',
          }}
        >
          {visibleBlocks.map((block, i) => {
            const absoluteIndex = visibleStart + i
            return (
              <BlockRenderer
                key={block.id}
                block={block}
                onHeightMeasured={(h) => onBlockMeasured(absoluteIndex, h)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
