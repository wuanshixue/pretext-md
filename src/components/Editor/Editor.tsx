import { useRef, useCallback, useEffect } from 'react'
import { useReaderStore } from '../../stores/reader'
import { useSettingsStore } from '../../stores/settings'

export function Editor() {
  const rawMarkdown = useReaderStore((s) => s.rawMarkdown)
  const setRawMarkdown = useReaderStore((s) => s.setRawMarkdown)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const lineHeight = useSettingsStore((s) => s.lineHeight)
  const maxWidth = useSettingsStore((s) => s.maxWidth)
  const theme = useSettingsStore((s) => s.theme)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // 防抖更新
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setRawMarkdown(value)
      }, 300)
    },
    [setRawMarkdown]
  )

  // Tab 缩进
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        const textarea = textareaRef.current
        if (!textarea) return
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const value = textarea.value
        const newValue = value.substring(0, start) + '  ' + value.substring(end)
        textarea.value = newValue
        textarea.selectionStart = textarea.selectionEnd = start + 2
        setRawMarkdown(newValue)
      }
    },
    [setRawMarkdown]
  )

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      className="h-full flex flex-col items-center overflow-y-auto"
      style={{
        background: 'var(--card)',
        fontFamily: 'var(--font-reading)',
      }}
    >
      <textarea
        ref={textareaRef}
        key="editor-textarea"
        defaultValue={rawMarkdown}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className="w-full resize-none outline-none border-none"
        style={{
          maxWidth: `${maxWidth}ch`,
          minHeight: '100%',
          padding: '24px 32px',
          fontSize: `${fontSize}px`,
          lineHeight,
          fontFamily: 'var(--font-mono)',
          color: 'var(--text)',
          background: 'transparent',
          letterSpacing: '0.01em',
          tabSize: 2,
        }}
        placeholder="在此输入 Markdown..."
      />
    </div>
  )
}
