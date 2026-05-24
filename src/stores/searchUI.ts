import { create } from 'zustand'

interface SearchUIState {
  visible: boolean
  toggle: () => void
  open: () => void
  close: () => void
}

export const useSearchUIStore = create<SearchUIState>((set) => ({
  visible: false,
  toggle: () => set((s) => ({ visible: !s.visible })),
  open: () => set({ visible: true }),
  close: () => set({ visible: false }),
}))
