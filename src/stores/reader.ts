import { create } from 'zustand'
import type { Block } from '../core/markdown'
import { parseMarkdown } from '../core/markdown'
import { readFileAtPath, type FileResult } from '../utils/file'

interface ReaderState {
  filePath: string | null
  fileName: string | null
  blocks: Block[]
  rawMarkdown: string
  scrollTop: number
  progress: number
  isLoading: boolean
  error: string | null

  loadFile: (file: FileResult) => Promise<void>
  loadFromContent: (content: string, name: string) => void
  setRawMarkdown: (md: string) => void
  setScrollTop: (top: number) => void
  setProgress: (progress: number) => void
  clear: () => void
}

export const useReaderStore = create<ReaderState>((set) => ({
  filePath: null,
  fileName: null,
  blocks: [],
  rawMarkdown: '',
  scrollTop: 0,
  progress: 0,
  isLoading: false,
  error: null,

  loadFile: async (file: FileResult) => {
    set({ isLoading: true, error: null })
    try {
      const blocks = parseMarkdown(file.content)
      set({
        filePath: file.path,
        fileName: file.name,
        blocks,
        rawMarkdown: file.content,
        isLoading: false,
        scrollTop: 0,
        progress: 0,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : '解析失败',
      })
    }
  },

  loadFromContent: (content: string, name: string) => {
    try {
      const blocks = parseMarkdown(content)
      set({
        filePath: null,
        fileName: name,
        blocks,
        rawMarkdown: content,
        isLoading: false,
        error: null,
        scrollTop: 0,
        progress: 0,
      })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '解析失败',
      })
    }
  },

  setRawMarkdown: (md: string) => {
    try {
      const blocks = parseMarkdown(md)
      set({ rawMarkdown: md, blocks, error: null })
    } catch {
      // 解析失败时只更新文本，保留旧 blocks
      set({ rawMarkdown: md })
    }
  },

  setScrollTop: (top: number) => set({ scrollTop: top }),
  setProgress: (progress: number) => set({ progress }),

  clear: () =>
    set({
      filePath: null,
      fileName: null,
      blocks: [],
      rawMarkdown: '',
      scrollTop: 0,
      progress: 0,
      isLoading: false,
      error: null,
    }),
}))
