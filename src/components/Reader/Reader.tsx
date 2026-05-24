import { useCallback } from 'react'
import { useReaderStore } from '../../stores/reader'
import { useSettingsStore } from '../../stores/settings'
import { useSearchUIStore } from '../../stores/searchUI'
import { useSearch } from '../../hooks/useSearch'
import { VirtualViewport } from '../VirtualViewport/VirtualViewport'
import { Editor } from '../Editor/Editor'
import { SearchPanel } from '../Search/SearchPanel'
import { Toolbar } from '../Toolbar/Toolbar'
import { Sidebar } from '../Sidebar/Sidebar'
import { SettingsPanel } from '../Settings/SettingsPanel'
import { Welcome } from '../Welcome/Welcome'
import { useState } from 'react'

export function Reader() {
  const blocks = useReaderStore((s) => s.blocks)
  const isLoading = useReaderStore((s) => s.isLoading)
  const error = useReaderStore((s) => s.error)
  const maxWidth = useSettingsStore((s) => s.maxWidth)
  const viewMode = useSettingsStore((s) => s.viewMode)
  const searchVisible = useSearchUIStore((s) => s.visible)
  const toggleSearch = useSearchUIStore((s) => s.toggle)
  const closeSearch = useSearchUIStore((s) => s.close)

  const [settingsVisible, setSettingsVisible] = useState(false)
  const [scrollToBlockIndex, setScrollToBlockIndex] = useState<number | null>(null)

  const search = useSearch({ blocks })

  const handleGoToSearchResult = useCallback(
    (index: number) => {
      search.goToResult(index)
      const result = search.results[index]
      if (result) {
        setScrollToBlockIndex(result.blockIndex)
      }
    },
    [search]
  )

  const handleScrollToBlockDone = useCallback(() => {
    setScrollToBlockIndex(null)
  }, [])

  const handleSearchClose = useCallback(() => {
    closeSearch()
    search.clear()
  }, [closeSearch, search])

  if (blocks.length === 0 && !isLoading) {
    return <Welcome />
  }

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center w-screen h-screen"
        style={{ background: 'var(--bg)', fontFamily: 'var(--font-ui)' }}
      >
        <p className="text-lg" style={{ color: 'var(--muted)' }}>加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center w-screen h-screen"
        style={{ background: 'var(--bg)', fontFamily: 'var(--font-ui)' }}
      >
        <p className="text-lg" style={{ color: '#e05a5a' }}>{error}</p>
      </div>
    )
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Sidebar onOpenSettings={() => setSettingsVisible(true)} />

      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Toolbar />

        <div className="flex-1 min-h-0 relative overflow-hidden flex">
          {viewMode === 'edit' && (
            <div className="h-full w-full flex justify-center overflow-hidden">
              <div className="h-full w-full" style={{ maxWidth: `${maxWidth}ch` }}>
                <Editor />
              </div>
            </div>
          )}

          {viewMode === 'split' && (
            <div className="h-full w-full flex overflow-hidden">
              <div
                className="h-full flex-1 overflow-hidden"
                style={{
                  borderRight: '1px solid var(--island-border)',
                  background: 'var(--card)',
                }}
              >
                <Editor />
              </div>
              <div className="h-full flex-1 overflow-hidden" style={{ background: 'var(--bg)' }}>
                <div
                  className="h-full mx-auto flex flex-col"
                  style={{ maxWidth: `${maxWidth}ch`, padding: '24px 32px' }}
                >
                  <VirtualViewport
                    blocks={blocks}
                    scrollToBlockIndex={scrollToBlockIndex}
                    onScrollToBlockDone={handleScrollToBlockDone}
                  />
                </div>
              </div>
            </div>
          )}

          {viewMode === 'preview' && (
            <div className="h-full w-full overflow-hidden">
              <div
                className="h-full mx-auto flex flex-col"
                style={{ maxWidth: `${maxWidth}ch`, padding: '24px 32px' }}
              >
                <VirtualViewport
                  blocks={blocks}
                  scrollToBlockIndex={scrollToBlockIndex}
                  onScrollToBlockDone={handleScrollToBlockDone}
                />
              </div>
            </div>
          )}

          <SearchPanel
            visible={searchVisible}
            query={search.query}
            onQueryChange={search.setQuery}
            results={search.results}
            currentIndex={search.currentIndex}
            resultCount={search.resultCount}
            onNext={search.nextResult}
            onPrev={search.prevResult}
            onGoTo={handleGoToSearchResult}
            onClose={handleSearchClose}
          />
        </div>
      </div>

      <SettingsPanel
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </div>
  )
}
