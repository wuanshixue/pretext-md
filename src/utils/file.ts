import { invoke } from '@tauri-apps/api/core'

export interface FileResult {
  content: string
  path: string
  name: string
}

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

function openFileBrowser(): Promise<FileResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.txt,.text'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) {
        resolve(null)
        return
      }
      const content = await file.text()
      resolve({
        content,
        path: file.name,
        name: file.name,
      })
    }
    input.oncancel = () => resolve(null)
    input.click()
  })
}

export async function openFileDialog(): Promise<FileResult | null> {
  if (!isTauri()) {
    return openFileBrowser()
  }

  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'txt', 'text'] },
        { name: '所有文件', extensions: ['*'] },
      ],
      multiple: false,
    })
    if (!selected) return null
    const path = typeof selected === 'string' ? selected : selected
    const content = await invoke<string>('read_file', { path })
    const name = path.split(/[/\\]/).pop() || path
    return { content, path, name }
  } catch {
    return openFileBrowser()
  }
}

export async function readFileAtPath(path: string): Promise<FileResult> {
  if (!isTauri()) {
    throw new Error('浏览器环境不支持按路径读取文件')
  }
  const content = await invoke<string>('read_file', { path })
  const name = path.split(/[/\\]/).pop() || path
  return { content, path, name }
}

export async function saveFile(content: string, fileName: string): Promise<string | null> {
  if (!isTauri()) {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    return null
  }

  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const filePath = await save({
      defaultPath: fileName,
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    })
    if (!filePath) return null
    await invoke('write_file', { path: filePath, content })
    return filePath
  } catch {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
    return null
  }
}

export async function saveFileToPath(path: string, content: string): Promise<void> {
  if (!isTauri()) {
    // 浏览器环境没有原路径，回退为下载
    const name = path.split(/[/\\]/).pop() || 'untitled.md'
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
    return
  }
  await invoke('write_file', { path, content })
}

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function isMarkdownFile(name: string): boolean {
  const ext = getFileExtension(name)
  return ['md', 'markdown', 'txt', 'text'].includes(ext)
}
