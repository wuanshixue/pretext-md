import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewMode = 'edit' | 'split' | 'preview'

interface SettingsState {
  fontSize: number
  lineHeight: number
  maxWidth: number
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  viewMode: ViewMode

  setFontSize: (size: number) => void
  setLineHeight: (lh: number) => void
  setMaxWidth: (w: number) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setViewMode: (mode: ViewMode) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      fontSize: 18,
      lineHeight: 1.9,
      maxWidth: 72,
      theme: 'light',
      sidebarOpen: true,
      viewMode: 'preview' as ViewMode,

      setFontSize: (size) => set({ fontSize: Math.max(12, Math.min(28, size)) }),
      setLineHeight: (lh) => set({ lineHeight: Math.max(1.2, Math.min(2.8, lh)) }),
      setMaxWidth: (w) => set({ maxWidth: Math.max(40, Math.min(100, w)) }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'pretext-settings',
    }
  )
)
