import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RecentFile {
  path: string
  name: string
  lastOpened: number
  scrollProgress: number
  content?: string // 缓存文件内容，浏览器环境下用于重新打开
}

interface HistoryState {
  recentFiles: RecentFile[]
  addRecent: (file: RecentFile) => void
  updateProgress: (path: string, progress: number) => void
  removeRecent: (path: string) => void
  clearHistory: () => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      recentFiles: [],

      addRecent: (file) =>
        set((state) => {
          const filtered = state.recentFiles.filter((f) => f.path !== file.path)
          return {
            recentFiles: [{ ...file, lastOpened: Date.now() }, ...filtered].slice(0, 20),
          }
        }),

      updateProgress: (path, progress) =>
        set((state) => ({
          recentFiles: state.recentFiles.map((f) =>
            f.path === path ? { ...f, scrollProgress: progress } : f
          ),
        })),

      removeRecent: (path) =>
        set((state) => ({
          recentFiles: state.recentFiles.filter((f) => f.path !== path),
        })),

      clearHistory: () => set({ recentFiles: [] }),
    }),
    {
      name: 'pretext-history',
    }
  )
)
