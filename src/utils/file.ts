import { invoke } from '@tauri-apps/api/core'

export interface FileResult {
  content: string
  path: string
  name: string
}

// 检测是否在 Tauri 环境
function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

// 浏览器端：用 input[type=file] 选择文件
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
  // 浏览器环境：用原生 input
  if (!isTauri()) {
    return openFileBrowser()
  }

  // Tauri 环境：用原生对话框
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

export function getFileExtension(name: string): string {
  const dot = name.lastIndexOf('.')
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function isMarkdownFile(name: string): boolean {
  const ext = getFileExtension(name)
  return ['md', 'markdown', 'txt', 'text'].includes(ext)
}
