import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useSettingsStore } from '../../stores/settings'

interface SettingsPanelProps {
  visible: boolean
  onClose: () => void
}

export function SettingsPanel({ visible, onClose }: SettingsPanelProps) {
  const {
    fontSize,
    setFontSize,
    lineHeight,
    setLineHeight,
    maxWidth,
    setMaxWidth,
  } = useSettingsStore()

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(0,0,0,0.2)' }}
          />
          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-40 rounded-3xl p-6"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 360,
              background: 'var(--card)',
              border: '2px solid var(--island-border)',
              boxShadow: '0 8px 32px var(--shadow)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: 'var(--island-header)' }}>
                阅读设置
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ color: 'var(--muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5">
              {/* 字号 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    字号
                  </label>
                  <span className="text-sm tabular-nums font-bold" style={{ color: 'var(--island-accent)' }}>
                    {fontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={28}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-[#19c8b9]"
                />
              </div>

              {/* 行高 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    行高
                  </label>
                  <span className="text-sm tabular-nums font-bold" style={{ color: 'var(--island-accent)' }}>
                    {lineHeight.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={28}
                  value={Math.round(lineHeight * 10)}
                  onChange={(e) => setLineHeight(Number(e.target.value) / 10)}
                  className="w-full accent-[#19c8b9]"
                />
              </div>

              {/* 最大宽度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    内容宽度
                  </label>
                  <span className="text-sm tabular-nums font-bold" style={{ color: 'var(--island-accent)' }}>
                    {maxWidth}ch
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={100}
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full accent-[#19c8b9]"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
