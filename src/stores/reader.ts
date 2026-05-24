import { create } from 'zustand'
import type { Block } from '../core/markdown'
import { parseMarkdown } from '../core/markdown'
import type { FileResult } from '../utils/file'
import { useSettingsStore } from './settings'

interface ReaderState {
  filePath: string | null
  fileName: string | null
  blocks: Block[]
  rawMarkdown: string
  scrollTop: number
  progress: number
  isLoading: boolean
  error: string | null
  fileLoaded: boolean // 标记是否已加载文件（区分空文件和未加载）

  loadFile: (file: FileResult) => Promise<void>
  createNewFile: () => void
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
  fileLoaded: false,

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
        fileLoaded: true,
      })
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : '解析失败',
      })
    }
  },

  createNewFile: () => {
    useSettingsStore.getState().setViewMode('edit')
    set({
      filePath: null,
      fileName: '未命名.md',
      blocks: [],
      rawMarkdown: '',
      scrollTop: 0,
      progress: 0,
      isLoading: false,
      error: null,
      fileLoaded: true,
    })
  },

  setRawMarkdown: (md: string) => {
    try {
      const blocks = parseMarkdown(md)
      set({ rawMarkdown: md, blocks, error: null })
    } catch {
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
      fileLoaded: false,
    }),
}))
