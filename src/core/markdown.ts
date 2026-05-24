import type { Token, Tokens } from 'marked'
import { marked } from 'marked'

export type BlockType =
  | 'heading'
  | 'paragraph'
  | 'code'
  | 'quote'
  | 'list'
  | 'table'
  | 'image'
  | 'hr'

export interface Block {
  id: string
  type: BlockType
  raw: string
  content: string
  level?: number
  lang?: string
  ordered?: boolean
  start?: number
  items?: ListItem[]
  rows?: string[][]
  headerRow?: string[]
  src?: string
  alt?: string
  children?: Block[]
  estimatedHeight?: number
  measuredHeight?: number
}

export interface ListItem {
  content: string
  checked?: boolean
  children?: Block[]
}

let blockIdCounter = 0

function nextId(): string {
  return `b-${blockIdCounter++}`
}

function resetIds() {
  blockIdCounter = 0
}

function flattenInlineTokens(tokens: Token[]): string {
  let result = ''
  for (const token of tokens) {
    if ('tokens' in token && token.tokens) {
      result += flattenInlineTokens(token.tokens as Token[])
    } else if ('text' in token) {
      result += (token as { text: string }).text
    } else if ('raw' in token) {
      result += (token as { raw: string }).raw
    }
  }
  return result
}

function extractListItemContent(item: Tokens.ListItem): string {
  // 从 tokens 中提取纯文本内容（排除嵌套列表）
  const textTokens = item.tokens.filter(
    (t) => t.type !== 'list'
  )
  return flattenInlineTokens(textTokens).trim()
}

function extractNestedList(item: Tokens.ListItem): Block | null {
  const listToken = item.tokens.find((t) => t.type === 'list') as Tokens.List | undefined
  if (!listToken) return null
  return parseListToken(listToken)
}

function parseListItem(item: Tokens.ListItem): ListItem {
  const content = extractListItemContent(item)
  const nestedList = extractNestedList(item)
  return {
    content,
    checked: item.task ? item.checked : undefined,
    children: nestedList ? [nestedList] : undefined,
  }
}

function parseListToken(t: Tokens.List): Block {
  const items = t.items.map((item: Tokens.ListItem) => parseListItem(item))
  const content = items.map((i: ListItem) => i.content).join('\n')
  return {
    id: nextId(),
    type: 'list',
    raw: t.raw,
    content,
    items,
    ordered: t.ordered,
    start: typeof t.start === 'number' ? t.start : undefined,
  }
}

function parseTokens(tokens: Token[]): Block[] {
  const blocks: Block[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'heading': {
        const t = token as Tokens.Heading
        blocks.push({
          id: nextId(),
          type: 'heading',
          raw: t.raw,
          content: flattenInlineTokens(t.tokens as Token[]).trim(),
          level: t.depth,
        })
        break
      }
      case 'paragraph': {
        const t = token as Tokens.Paragraph
        const content = flattenInlineTokens(t.tokens as Token[]).trim()
        if (
          t.tokens.length === 1 &&
          t.tokens[0].type === 'image'
        ) {
          const img = t.tokens[0] as Tokens.Image
          blocks.push({
            id: nextId(),
            type: 'image',
            raw: t.raw,
            content: img.text || '',
            src: img.href,
            alt: img.text,
          })
        } else {
          blocks.push({
            id: nextId(),
            type: 'paragraph',
            raw: t.raw,
            content,
          })
        }
        break
      }
      case 'code': {
        const t = token as Tokens.Code
        blocks.push({
          id: nextId(),
          type: 'code',
          raw: t.raw,
          content: t.text,
          lang: t.lang || undefined,
        })
        break
      }
      case 'blockquote': {
        const t = token as Tokens.Blockquote
        const children = parseTokens(t.tokens as Token[])
        blocks.push({
          id: nextId(),
          type: 'quote',
          raw: t.raw,
          content: flattenInlineTokens(t.tokens as Token[]).trim(),
          children,
        })
        break
      }
      case 'list': {
        const t = token as Tokens.List
        blocks.push(parseListToken(t))
        break
      }
      case 'table': {
        const t = token as Tokens.Table
        const headerRow = t.header.map((cell: Tokens.TableCell) =>
          flattenInlineTokens(cell.tokens as Token[]).trim()
        )
        const rows = t.rows.map((row: Tokens.TableCell[]) =>
          row.map((cell: Tokens.TableCell) =>
            flattenInlineTokens(cell.tokens as Token[]).trim()
          )
        )
        const content = [headerRow.join(' | '), ...rows.map((r: string[]) => r.join(' | '))].join(
          '\n'
        )
        blocks.push({
          id: nextId(),
          type: 'table',
          raw: t.raw,
          content,
          headerRow,
          rows,
        })
        break
      }
      case 'hr': {
        blocks.push({
          id: nextId(),
          type: 'hr',
          raw: (token as Tokens.Hr).raw,
          content: '',
        })
        break
      }
      case 'space':
        break
      case 'text': {
        const t = token as Tokens.Text
        if (t.tokens && t.tokens.length > 0) {
          const content = flattenInlineTokens(t.tokens as Token[]).trim()
          if (content) {
            blocks.push({
              id: nextId(),
              type: 'paragraph',
              raw: t.raw,
              content,
            })
          }
        }
        break
      }
      default: {
        if ('tokens' in token && (token as Tokens.Generic).tokens) {
          const content = flattenInlineTokens(
            (token as Tokens.Generic).tokens as Token[]
          ).trim()
          if (content) {
            blocks.push({
              id: nextId(),
              type: 'paragraph',
              raw: (token as Tokens.Generic).raw || '',
              content,
            })
          }
        }
      }
    }
  }

  return blocks
}

export function parseMarkdown(markdown: string): Block[] {
  resetIds()
  const tokens = marked.lexer(markdown)
  return parseTokens(tokens)
}

export function getBlockText(block: Block): string {
  switch (block.type) {
    case 'heading':
    case 'paragraph':
      return block.content
    case 'code':
      return block.content
    case 'quote':
      return block.content
    case 'list':
      return block.items?.map((i) => i.content).join('\n') || ''
    case 'table':
      return block.content
    case 'image':
      return block.alt || block.src || ''
    case 'hr':
      return '---'
    default:
      return block.content
  }
}
