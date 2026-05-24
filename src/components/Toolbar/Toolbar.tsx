import { motion } from 'framer-motion'
import {
  Search,
  Sun,
  Moon,
  Plus,
  Minus,
  PanelLeftOpen,
  PenLine,
  Columns2,
  Eye,
  Save,
} from 'lucide-react'
import { useSettingsStore, type ViewMode } from '../../stores/settings'
import { useSearchUIStore } from '../../stores/searchUI'
import { useReaderStore } from '../../stores/reader'
import { saveFile } from '../../utils/file'

const viewModes: { mode: ViewMode; label: string; icon: typeof Eye }[] = [
  { mode: 'edit', label: '编辑', icon: PenLine },
  { mode: 'split', label: '并列', icon: Columns2 },
  { mode: 'preview', label: '预览', icon: Eye },
]

export function Toolbar() {
  const {
    fontSize,
    setFontSize,
    theme,
    toggleTheme,
    sidebarOpen,
    toggleSidebar,
    viewMode,
    setViewMode,
  } = useSettingsStore()
  const toggleSearch = useSearchUIStore((s) => s.toggle)
  const fileName = useReaderStore((s) => s.fileName)
  const filePath = useReaderStore((s) => s.filePath)
  const rawMarkdown = useReaderStore((s) => s.rawMarkdown)

  const handleSave = async () => {
    if (!fileName) return
    const savedPath = await saveFile(rawMarkdown, fileName)
    if (savedPath) {
      useReaderStore.setState({ filePath: savedPath })
    }
  }

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 select-none"
      style={{
        background: 'var(--island-content-bg)',
        borderBottom: '2px solid var(--island-border)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          onClick={toggleSidebar}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'var(--muted)' }}
          title="展开侧边栏"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </motion.button>
      )}

      {fileName && (
        <span
          className="text-xs font-semibold truncate max-w-[200px]"
          style={{ color: 'var(--island-header)' }}
        >
          {fileName}
        </span>
      )}

      <div className="flex-1" />

      {fileName && (
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-xl"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          {viewModes.map(({ mode, label, icon: Icon }) => (
            <motion.button
              key={mode}
              whileTap={{ y: 1 }}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: viewMode === mode ? 'var(--card)' : 'transparent',
                color: viewMode === mode ? 'var(--island-accent)' : 'var(--muted)',
                boxShadow: viewMode === mode ? '0 2px 4px var(--shadow)' : 'none',
              }}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </motion.button>
          ))}
        </div>
      )}

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
        onClick={toggleSearch}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: 'var(--muted)' }}
        title="搜索"
      >
        <Search className="w-4 h-4" />
      </motion.button>

      {fileName && (
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          onClick={handleSave}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: 'var(--muted)' }}
          title={filePath ? '另存为' : '保存'}
        >
          <Save className="w-4 h-4" />
        </motion.button>
      )}

      <div
        className="flex items-center gap-0.5 px-1 py-0.5 rounded-xl"
        style={{ background: 'rgba(0,0,0,0.04)' }}
      >
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          onClick={() => setFontSize(fontSize - 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--muted)' }}
          title="缩小字号"
        >
          <Minus className="w-3.5 h-3.5" />
        </motion.button>
        <span
          className="text-xs font-bold w-8 text-center tabular-nums"
          style={{ color: 'var(--text)' }}
        >
          {fontSize}
        </span>
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ y: 1 }}
          onClick={() => setFontSize(fontSize + 1)}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: 'var(--muted)' }}
          title="放大字号"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
        onClick={toggleTheme}
        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: 'var(--muted)' }}
        title={theme === 'light' ? '切换深色模式' : '切换浅色模式'}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </motion.button>
    </div>
  )
}
