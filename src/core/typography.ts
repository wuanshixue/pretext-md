export const TYPOGRAPHY = {
  fontSize: 18,
  lineHeight: 1.9,
  maxWidth: 72,
  letterSpacing: 0.01,
  wordBreak: 'keep-all' as const,
  whiteSpace: 'pre-wrap' as const,
}

export function getReadingFont(fontSize: number): string {
  return `400 ${fontSize}px "Noto Serif SC", "Inter", Georgia, serif`
}

export function getUIFont(fontSize: number, weight = 500): string {
  return `${weight} ${fontSize}px "Nunito", "Noto Sans SC", -apple-system, sans-serif`
}

export function getCodeFont(fontSize: number): string {
  return `500 ${fontSize}px "JetBrains Mono", "SF Mono", monospace`
}
