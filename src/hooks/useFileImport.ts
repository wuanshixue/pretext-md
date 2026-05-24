import { useCallback } from 'react'
import { useReaderStore } from '../stores/reader'
import { useHistoryStore } from '../stores/history'
import { openFileDialog, readFileAtPath, type FileResult } from '../utils/file'

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export function useFileImport() {
  const loadFile = useReaderStore((s) => s.loadFile)
  const addRecent = useHistoryStore((s) => s.addRecent)
  const recentFiles = useHistoryStore((s) => s.recentFiles)

  const importViaDialog = useCallback(async () => {
    const file = await openFileDialog()
    if (!file) return null

    await loadFile(file)
    addRecent({
      path: file.path,
      name: file.name,
      lastOpened: Date.now(),
      scrollProgress: 0,
      content: file.content,
    })
    return file
  }, [loadFile, addRecent])

  const importFromPath = useCallback(
    async (path: string) => {
      // Tauri 环境：直接按路径读取
      if (isTauri()) {
        const file = await readFileAtPath(path)
        await loadFile(file)
        addRecent({
          path: file.path,
          name: file.name,
          lastOpened: Date.now(),
          scrollProgress: 0,
          content: file.content,
        })
        return file
      }

      // 浏览器环境：从历史记录中找到缓存的内容直接加载
      const cached = recentFiles.find((f) => f.path === path)
      if (cached?.content) {
        const file: FileResult = {
          content: cached.content,
          path: cached.path,
          name: cached.name,
        }
        await loadFile(file)
        return file
      }

      // 无缓存内容时回退到文件对话框
      return importViaDialog()
    },
    [loadFile, addRecent, recentFiles, importViaDialog]
  )

  const importFromDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const files = Array.from(e.dataTransfer.files)
      const mdFile = files.find((f) =>
        /\.(md|markdown|txt|text)$/i.test(f.name)
      )
      if (!mdFile) return null

      const content = await mdFile.text()

      const result: FileResult = {
        content,
        path: mdFile.name,
        name: mdFile.name,
      }

      await loadFile(result)
      addRecent({
        path: result.path,
        name: result.name,
        lastOpened: Date.now(),
        scrollProgress: 0,
        content: result.content,
      })
      return result
    },
    [loadFile, addRecent]
  )

  return { importViaDialog, importFromPath, importFromDrop }
}
