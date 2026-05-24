import { BookOpen, FileText, X, Settings, ChevronLeft, FilePlus, Save, SaveAll } from 'lucide-react'
import { useReaderStore } from '../../stores/reader'
import { useHistoryStore } from '../../stores/history'
import { useSettingsStore } from '../../stores/settings'
import { useFileImport } from '../../hooks/useFileImport'
import { saveFile, saveFileToPath } from '../../utils/file'

interface SidebarProps {
  onOpenSettings?: () => void
}

const SIDEBAR_WIDTH = 220

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const { sidebarOpen, toggleSidebar } = useSettingsStore()
  const fileName = useReaderStore((s) => s.fileName)
  const filePath = useReaderStore((s) => s.filePath)
  const rawMarkdown = useReaderStore((s) => s.rawMarkdown)
  const blocks = useReaderStore((s) => s.blocks)
  const recentFiles = useHistoryStore((s) => s.recentFiles)
  const { importViaDialog, importFromPath } = useFileImport()
  const clear = useReaderStore((s) => s.clear)
  const createNewFile = useReaderStore((s) => s.createNewFile)

  const headings = blocks
    .filter((b) => b.type === 'heading')
    .map((b) => ({ id: b.id, text: b.content, level: b.level || 1 }))

  return (
    <aside
      className="flex flex-col h-full overflow-hidden select-none shrink-0"
      style={{
        width: sidebarOpen ? SIDEBAR_WIDTH : 0,
        minWidth: sidebarOpen ? SIDEBAR_WIDTH : 0,
        background: 'var(--island-content-bg)',
        borderRight: sidebarOpen ? '2px solid var(--island-border)' : 'none',
        transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.35s cubic-bezier(0.4, 0, 0.2, 1), border 0.35s ease',
      }}
    >
      <div
        className="flex flex-col h-full"
        style={{
          width: SIDEBAR_WIDTH,
          minWidth: SIDEBAR_WIDTH,
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7fa36b, #5a8a47)',
                boxShadow: '0 3px 0 0 #4a7a3a',
              }}
            >
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span
              className="font-bold text-sm"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--island-header)' }}
            >
              Pretext
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-70 transition-opacity"
            style={{ color: 'var(--muted)' }}
            title="收起侧边栏"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 当前文件 */}
        {fileName && (
          <div className="px-4 pb-3">
            <div
              className="px-3 py-2 rounded-xl text-xs font-medium truncate"
              style={{
                fontFamily: 'var(--font-ui)',
                background: 'rgba(127,163,107,0.15)',
                color: 'var(--green)',
              }}
            >
              {fileName}
            </div>
          </div>
        )}

        {/* 目录 */}
        {headings.length > 0 && (
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <h3
              className="text-[10px] font-semibold px-2 py-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)' }}
            >
              目录
            </h3>
            <div className="space-y-0.5">
              {headings.map((h) => (
                <button
                  key={h.id}
                  className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium truncate hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: 'var(--font-ui)',
                    color: 'var(--text)',
                    paddingLeft: `${8 + (h.level - 1) * 12}px`,
                  }}
                >
                  {h.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 最近文件 */}
        {!fileName && recentFiles.length > 0 && (
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <h3
              className="text-[10px] font-semibold px-2 py-2 uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)' }}
            >
              最近阅读
            </h3>
            <div className="space-y-1">
              {recentFiles.map((file) => (
                <button
                  key={file.path}
                  onClick={() => importFromPath(file.path)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-left hover:opacity-80 transition-opacity"
                  style={{ fontFamily: 'var(--font-ui)' }}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--green)' }} />
                  <span className="truncate text-xs font-medium" style={{ color: 'var(--text)' }}>
                    {file.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 底部操作 */}
        <div
          className="px-3 py-3 space-y-1.5"
          style={{ borderTop: '1px solid var(--island-border)' }}
        >
          <button
            onClick={() => importViaDialog()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{
              fontFamily: 'var(--font-ui)',
              color: 'var(--text)',
              background: 'rgba(25,200,185,0.1)',
            }}
          >
            <FileText className="w-4 h-4" style={{ color: 'var(--island-accent)' }} />
            打开文件
          </button>
          <button
            onClick={createNewFile}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{
              fontFamily: 'var(--font-ui)',
              color: 'var(--text)',
              background: 'rgba(127,163,107,0.1)',
            }}
          >
            <FilePlus className="w-4 h-4" style={{ color: 'var(--green)' }} />
            新建文件
          </button>
          {fileName && (
            <button
              onClick={async () => {
                if (filePath) {
                  await saveFileToPath(filePath, rawMarkdown)
                } else {
                  const savedPath = await saveFile(rawMarkdown, fileName)
                  if (savedPath) {
                    useReaderStore.setState({ filePath: savedPath })
                  }
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--text)',
                background: 'rgba(216,185,138,0.15)',
              }}
            >
              <Save className="w-4 h-4" style={{ color: 'var(--wood)' }} />
              保存
            </button>
          )}
          {fileName && (
            <button
              onClick={async () => {
                const savedPath = await saveFile(rawMarkdown, fileName)
                if (savedPath) {
                  useReaderStore.setState({ filePath: savedPath })
                }
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--muted)',
              }}
            >
              <SaveAll className="w-4 h-4" />
              另存为
            </button>
          )}
          {fileName && (
            <button
              onClick={clear}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--muted)',
              }}
            >
              <X className="w-4 h-4" />
              关闭文件
            </button>
          )}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
              style={{
                fontFamily: 'var(--font-ui)',
                color: 'var(--muted)',
              }}
            >
              <Settings className="w-4 h-4" />
              设置
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
