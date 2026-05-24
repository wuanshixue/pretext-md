import { motion } from 'framer-motion'
import { BookOpen, FileText, ArrowRight } from 'lucide-react'
import { useFileImport } from '../../hooks/useFileImport'
import { useHistoryStore } from '../../stores/history'
import { useReaderStore } from '../../stores/reader'

export function Welcome() {
  const { importViaDialog, importFromPath, importFromDrop } = useFileImport()
  const recentFiles = useHistoryStore((s) => s.recentFiles)
  const isLoading = useReaderStore((s) => s.isLoading)

  return (
    <div
      className="flex flex-col items-center justify-center w-screen h-screen overflow-auto px-8"
      style={{ background: 'var(--bg)' }}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDrop={importFromDrop}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="text-center max-w-lg"
      >
        {/* 岛屿图标 */}
        <motion.div
          className="mx-auto mb-8 w-32 h-32 rounded-[40px] flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #7fa36b 0%, #5a8a47 100%)',
            boxShadow: '0 8px 0 0 #4a7a3a, 0 12px 24px rgba(90,138,71,0.3)',
          }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <BookOpen className="w-16 h-16 text-white" strokeWidth={1.5} />
        </motion.div>

        <h1
          className="text-4xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-ui)', color: 'var(--island-header)' }}
        >
          Pretext
        </h1>
        <p
          className="text-lg mb-10"
          style={{ fontFamily: 'var(--font-ui)', color: 'var(--muted)' }}
        >
          一座安静阅读的小岛
        </p>

        {/* 打开文件按钮 */}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ y: 2 }}
          onClick={() => importViaDialog()}
          disabled={isLoading}
          className="px-10 py-4 rounded-full text-lg font-bold transition-all disabled:opacity-50"
          style={{
            fontFamily: 'var(--font-ui)',
            background: '#19c8b9',
            color: '#fff',
            boxShadow: '0 5px 0 0 #11a89b',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.02em',
          }}
        >
          {isLoading ? '加载中...' : '打开 Markdown 文件'}
        </motion.button>

        {/* 拖拽提示 */}
        <p className="mt-4 text-sm" style={{ color: 'var(--muted)' }}>
          或将 .md 文件拖拽到此处
        </p>
      </motion.div>

      {/* 最近文件 */}
      {recentFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 w-full max-w-md"
        >
          <h2
            className="text-sm font-semibold mb-3 px-2"
            style={{
              fontFamily: 'var(--font-ui)',
              color: 'var(--muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            最近阅读
          </h2>
          <div className="space-y-2">
            {recentFiles.slice(0, 5).map((file) => (
              <motion.button
                key={file.path}
                whileHover={{ x: 4 }}
                onClick={() => importFromPath(file.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors"
                style={{
                  fontFamily: 'var(--font-ui)',
                  background: 'var(--card)',
                  boxShadow: '0 2px 8px var(--shadow)',
                  cursor: 'pointer',
                }}
              >
                <FileText className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--green)' }} />
                <span className="flex-1 truncate text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {file.name}
                </span>
                <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted)' }} />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
