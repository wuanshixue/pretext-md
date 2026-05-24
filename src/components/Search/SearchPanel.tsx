import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import type { SearchResult } from '../../core/search'

interface SearchPanelProps {
  visible: boolean
  query: string
  onQueryChange: (q: string) => void
  results: SearchResult[]
  currentIndex: number
  resultCount: number
  onNext: () => void
  onPrev: () => void
  onGoTo: (index: number) => void
  onClose: () => void
}

export function SearchPanel({
  visible,
  query,
  onQueryChange,
  results,
  currentIndex,
  resultCount,
  onNext,
  onPrev,
  onGoTo,
  onClose,
}: SearchPanelProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute right-0 top-0 bottom-0 z-20 flex flex-col"
          style={{
            width: 320,
            background: 'var(--card)',
            borderLeft: '2px solid var(--island-border)',
            fontFamily: 'var(--font-ui)',
            boxShadow: '-4px 0 24px var(--shadow)',
          }}
        >
          {/* 搜索头部 */}
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--island-border)' }}>
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="搜索全文..."
              autoFocus
              className="flex-1 text-sm outline-none bg-transparent"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--text)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.shiftKey ? onPrev() : onNext()
                }
                if (e.key === 'Escape') onClose()
              }}
            />
            {resultCount > 0 && (
              <span className="text-xs tabular-nums" style={{ color: 'var(--muted)' }}>
                {currentIndex + 1}/{resultCount}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <button
                onClick={onPrev}
                disabled={resultCount === 0}
                className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-30"
                style={{ color: 'var(--muted)' }}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNext}
                disabled={resultCount === 0}
                className="w-6 h-6 rounded flex items-center justify-center disabled:opacity-30"
                style={{ color: 'var(--muted)' }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ color: 'var(--muted)' }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 搜索结果列表 */}
          <div className="flex-1 overflow-y-auto">
            {query && resultCount === 0 && (
              <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                未找到匹配结果
              </div>
            )}
            {results.map((result, i) => (
              <button
                key={result.blockId}
                onClick={() => onGoTo(i)}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{
                  background: i === currentIndex ? 'rgba(25,200,185,0.1)' : 'transparent',
                  borderBottom: '1px solid var(--island-border)',
                }}
              >
                <p
                  className="text-xs truncate"
                  style={{
                    color: i === currentIndex ? 'var(--island-accent)' : 'var(--text)',
                    fontWeight: i === currentIndex ? 600 : 400,
                    fontFamily: 'var(--font-reading)',
                  }}
                >
                  {result.text.slice(0, 100)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>
                  第 {result.blockIndex + 1} 段 · {result.matchPositions.length} 处匹配
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
