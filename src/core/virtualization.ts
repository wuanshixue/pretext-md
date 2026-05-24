import type { Block } from './markdown'
import { measureBlockHeight } from './pretext'

export interface BlockMeta {
  id: string
  index: number
  offset: number
  height: number
  measured: boolean
}

export interface VirtualState {
  blockMetas: BlockMeta[]
  totalHeight: number
  visibleStart: number
  visibleEnd: number
  overscan: number
}

const DEFAULT_OVERSCAN = 5
const DEFAULT_ESTIMATED_HEIGHT = 40

export function computeBlockMetas(
  blocks: Block[],
  fontSize: number,
  maxWidth: number,
  lineHeight: number
): BlockMeta[] {
  const metas: BlockMeta[] = new Array(blocks.length)
  let offset = 0

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const height = measureBlockHeight(block, fontSize, maxWidth, lineHeight)
    metas[i] = {
      id: block.id,
      index: i,
      offset,
      height,
      measured: true,
    }
    offset += height
  }

  return metas
}

export function computeTotalHeight(blockMetas: BlockMeta[]): number {
  if (blockMetas.length === 0) return 0
  const last = blockMetas[blockMetas.length - 1]
  return last.offset + last.height
}

// 二分查找：找到第一个 offset + height > scrollTop 的 block
function findBlockIndex(blockMetas: BlockMeta[], scrollTop: number): number {
  let lo = 0
  let hi = blockMetas.length - 1

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    const meta = blockMetas[mid]
    if (meta.offset + meta.height <= scrollTop) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  return Math.min(lo, blockMetas.length - 1)
}

export function computeVisibleRange(
  blockMetas: BlockMeta[],
  scrollTop: number,
  viewportHeight: number,
  overscan = DEFAULT_OVERSCAN
): { start: number; end: number } {
  if (blockMetas.length === 0) return { start: 0, end: 0 }

  const start = findBlockIndex(blockMetas, scrollTop)
  let end = start

  const bottomEdge = scrollTop + viewportHeight
  while (end < blockMetas.length && blockMetas[end].offset < bottomEdge) {
    end++
  }

  return {
    start: Math.max(0, start - overscan),
    end: Math.min(blockMetas.length, end + overscan),
  }
}

export function updateBlockHeight(
  blockMetas: BlockMeta[],
  index: number,
  newHeight: number
): BlockMeta[] {
  const meta = blockMetas[index]
  if (!meta || Math.abs(meta.height - newHeight) < 1) return blockMetas

  const updated = [...blockMetas]
  const diff = newHeight - meta.height
  updated[index] = { ...meta, height: newHeight, measured: true }

  // 重新计算后续 block 的 offset
  for (let i = index + 1; i < updated.length; i++) {
    updated[i] = { ...updated[i], offset: updated[i].offset + diff }
  }

  return updated
}

export function createInitialMetas(blocks: Block[]): BlockMeta[] {
  let offset = 0
  return blocks.map((block, i) => {
    const height = estimateBlockHeight(block)
    const meta: BlockMeta = {
      id: block.id,
      index: i,
      offset,
      height,
      measured: false,
    }
    offset += height
    return meta
  })
}

function estimateBlockHeight(block: Block): number {
  switch (block.type) {
    case 'heading':
      return 48
    case 'code': {
      const lines = block.content.split('\n').length
      return lines * 22 + 40
    }
    case 'table': {
      return 36 + (block.rows?.length || 0) * 36 + 16
    }
    case 'image':
      return 200
    case 'hr':
      return 24
    case 'list': {
      const count = block.items?.length || 1
      return count * 28 + 16
    }
    default: {
      const len = block.content.length
      return Math.max(DEFAULT_ESTIMATED_HEIGHT, Math.ceil(len / 30) * 34)
    }
  }
}
