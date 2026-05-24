import { prepare, layout, type PreparedText } from '@chenglou/pretext'
import type { Block } from './markdown'
import { getBlockText } from './markdown'
import { getReadingFont, TYPOGRAPHY } from './typography'

interface CacheEntry {
  prepared: PreparedText
  height: number
}

// key: `${blockId}:${font}:${maxWidth}:${lineHeight}`
const heightCache = new Map<string, CacheEntry>()

// 估算行高常量
const HEADING_HEIGHTS: Record<number, number> = {
  1: 48,
  2: 40,
  3: 34,
  4: 30,
  5: 26,
  6: 24,
}
const HR_HEIGHT = 24
const IMAGE_DEFAULT_HEIGHT = 200
const TABLE_ROW_HEIGHT = 36
const CODE_LINE_HEIGHT = 22
const LIST_ITEM_HEIGHT = 28

function makeCacheKey(blockId: string, font: string, maxWidth: number, lineHeight: number): string {
  return `${blockId}:${font}:${maxWidth}:${lineHeight}`
}

export function measureBlockHeight(
  block: Block,
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): number {
  const font = getReadingFont(fontSize)
  const key = makeCacheKey(block.id, font, maxWidth, lineHeight)
  const cached = heightCache.get(key)
  if (cached) return cached.height

  const text = getBlockText(block)
  if (!text) {
    const emptyHeight = estimateEmptyBlockHeight(block, fontSize, lineHeight)
    return emptyHeight
  }

  try {
    const prepared = prepare(text, font, {
      whiteSpace: TYPOGRAPHY.whiteSpace,
      wordBreak: TYPOGRAPHY.wordBreak,
      letterSpacing: TYPOGRAPHY.letterSpacing,
    })
    const { height } = layout(prepared, maxWidth, lineHeight)
    const finalHeight = adjustBlockHeight(block, height, fontSize, lineHeight)
    heightCache.set(key, { prepared, height: finalHeight })
    return finalHeight
  } catch {
    return estimateFallbackHeight(block, fontSize, lineHeight, maxWidth)
  }
}

function estimateEmptyBlockHeight(block: Block, fontSize: number, lineHeight: number): number {
  switch (block.type) {
    case 'hr':
      return HR_HEIGHT
    case 'image':
      return IMAGE_DEFAULT_HEIGHT
    case 'heading':
      return (HEADING_HEIGHTS[block.level || 1] || 30) * lineHeight
    default:
      return fontSize * lineHeight
  }
}

function adjustBlockHeight(
  block: Block,
  pretextHeight: number,
  fontSize: number,
  lineHeight: number
): number {
  switch (block.type) {
    case 'heading': {
      const headingFontSize = Math.max(16, fontSize + (7 - (block.level || 1)) * 2)
      const headingLineHeight = headingFontSize * 1.3
      const lines = Math.max(1, Math.ceil(pretextHeight / lineHeight))
      return lines * headingLineHeight + fontSize * 0.6 // margin
    }
    case 'code': {
      const lines = block.content.split('\n').length
      return lines * CODE_LINE_HEIGHT + 40 // padding
    }
    case 'table': {
      const headerHeight = TABLE_ROW_HEIGHT
      const bodyHeight = (block.rows?.length || 0) * TABLE_ROW_HEIGHT
      return headerHeight + bodyHeight + 16
    }
    case 'list':
      return pretextHeight + fontSize * 0.4
    case 'image':
      return IMAGE_DEFAULT_HEIGHT
    case 'hr':
      return HR_HEIGHT
    default:
      return pretextHeight
  }
}

function estimateFallbackHeight(
  block: Block,
  fontSize: number,
  lineHeight: number,
  maxWidth: number
): number {
  const text = getBlockText(block)
  const charWidth = fontSize * 0.55
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charWidth))
  const lines = Math.max(1, Math.ceil(text.length / charsPerLine))
  return lines * fontSize * lineHeight
}

export function clearPretextCache() {
  heightCache.clear()
}

export function getPreparedText(
  block: Block,
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): PreparedText | null {
  const font = getReadingFont(fontSize)
  const key = makeCacheKey(block.id, font, maxWidth, lineHeight)
  const cached = heightCache.get(key)
  if (cached) return cached.prepared

  const text = getBlockText(block)
  if (!text) return null

  try {
    const prepared = prepare(text, font, {
      whiteSpace: TYPOGRAPHY.whiteSpace,
      wordBreak: TYPOGRAPHY.wordBreak,
      letterSpacing: TYPOGRAPHY.letterSpacing,
    })
    const { height } = layout(prepared, maxWidth, lineHeight)
    const finalHeight = adjustBlockHeight(block, height, fontSize, lineHeight)
    heightCache.set(key, { prepared, height: finalHeight })
    return prepared
  } catch {
    return null
  }
}
