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

export type InlineNode =
  | { type: 'text'; text: string }
  | { type: 'bold'; children: InlineNode[] }
  | { type: 'italic'; children: InlineNode[] }
  | { type: 'link'; href: string; title?: string; children: InlineNode[] }
  | { type: 'image'; src: string; alt: string }
  | { type: 'code'; text: string }
  | { type: 'del'; children: InlineNode[] }

export interface Block {
  id: string
  type: BlockType
  raw: string
  content: string
  inlineChildren?: InlineNode[]
  level?: number
  lang?: string
  ordered?: boolean
  start?: number
  items?: ListItem[]
  rows?: string[][]
  headerRowInline?: InlineNode[][]
  rowsInline?: InlineNode[][][]
  headerRow?: string[]
  src?: string
  alt?: string
  children?: Block[]
  estimatedHeight?: number
  measuredHeight?: number
}

export interface ListItem {
  content: string
  inlineChildren?: InlineNode[]
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

function parseInlineTokens(tokens: Token[]): InlineNode[] {
  const nodes: InlineNode[] = []
  for (const token of tokens) {
    switch (token.type) {
      case 'text': {
        const t = token as Tokens.Text
        if (t.tokens && t.tokens.length > 0) {
          nodes.push(...parseInlineTokens(t.tokens as Token[]))
        } else {
          nodes.push({ type: 'text', text: t.text })
        }
        break
      }
      case 'strong': {
        const t = token as Tokens.Strong
        nodes.push({ type: 'bold', children: parseInlineTokens(t.tokens as Token[]) })
        break
      }
      case 'em': {
        const t = token as Tokens.Em
        nodes.push({ type: 'italic', children: parseInlineTokens(t.tokens as Token[]) })
        break
      }
      case 'link': {
        const t = token as Tokens.Link
        nodes.push({
          type: 'link',
          href: t.href,
          title: t.title || undefined,
          children: parseInlineTokens(t.tokens as Token[]),
        })
        break
      }
      case 'image': {
        const t = token as Tokens.Image
        nodes.push({ type: 'image', src: t.href, alt: t.text || '' })
        break
      }
      case 'codespan': {
        const t = token as Tokens.Codespan
        nodes.push({ type: 'code', text: t.text })
        break
      }
      case 'del': {
        const t = token as Tokens.Del
        nodes.push({ type: 'del', children: parseInlineTokens(t.tokens as Token[]) })
        break
      }
      case 'escape': {
        const t = token as Tokens.Escape
        nodes.push({ type: 'text', text: t.text })
        break
      }
      case 'br': {
        nodes.push({ type: 'text', text: '\n' })
        break
      }
      case 'html': {
        const t = token as Tokens.HTML
        nodes.push({ type: 'text', text: t.text })
        break
      }
      default: {
        if ('tokens' in token && (token as Tokens.Generic).tokens) {
          nodes.push(...parseInlineTokens((token as Tokens.Generic).tokens as Token[]))
        } else if ('text' in token) {
          nodes.push({ type: 'text', text: (token as { text: string }).text })
        } else if ('raw' in token) {
          nodes.push({ type: 'text', text: (token as { raw: string }).raw })
        }
      }
    }
  }
  return nodes
}

function flattenInlineToText(tokens: Token[]): string {
  let result = ''
  for (const token of tokens) {
    if ('tokens' in token && token.tokens) {
      result += flattenInlineToText(token.tokens as Token[])
    } else if ('text' in token) {
      result += (token as { text: string }).text
    } else if ('raw' in token) {
      result += (token as { raw: string }).raw
    }
  }
  return result
}

function extractListItemContent(item: Tokens.ListItem): { text: string; inline: InlineNode[] } {
  const textTokens = item.tokens.filter((t) => t.type !== 'list')
  return {
    text: flattenInlineToText(textTokens).trim(),
    inline: parseInlineTokens(textTokens),
  }
}

function extractNestedList(item: Tokens.ListItem): Block | null {
  const listToken = item.tokens.find((t) => t.type === 'list') as Tokens.List | undefined
  if (!listToken) return null
  return parseListToken(listToken)
}

function parseListItem(item: Tokens.ListItem): ListItem {
  const { text, inline } = extractListItemContent(item)
  const nestedList = extractNestedList(item)
  return {
    content: text,
    inlineChildren: inline,
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
          content: flattenInlineToText(t.tokens as Token[]).trim(),
          inlineChildren: parseInlineTokens(t.tokens as Token[]),
          level: t.depth,
        })
        break
      }
      case 'paragraph': {
        const t = token as Tokens.Paragraph
        if (t.tokens.length === 1 && t.tokens[0].type === 'image') {
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
            content: flattenInlineToText(t.tokens as Token[]).trim(),
            inlineChildren: parseInlineTokens(t.tokens as Token[]),
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
          content: flattenInlineToText(t.tokens as Token[]).trim(),
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
          flattenInlineToText(cell.tokens as Token[]).trim()
        )
        const headerRowInline = t.header.map((cell: Tokens.TableCell) =>
          parseInlineTokens(cell.tokens as Token[])
        )
        const rows = t.rows.map((row: Tokens.TableCell[]) =>
          row.map((cell: Tokens.TableCell) =>
            flattenInlineToText(cell.tokens as Token[]).trim()
          )
        )
        const rowsInline = t.rows.map((row: Tokens.TableCell[]) =>
          row.map((cell: Tokens.TableCell) =>
            parseInlineTokens(cell.tokens as Token[])
          )
        )
        const content = [headerRow.join(' | '), ...rows.map((r: string[]) => r.join(' | '))].join('\n')
        blocks.push({
          id: nextId(),
          type: 'table',
          raw: t.raw,
          content,
          headerRow,
          rows,
          headerRowInline,
          rowsInline,
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
          const content = flattenInlineToText(t.tokens as Token[]).trim()
          if (content) {
            blocks.push({
              id: nextId(),
              type: 'paragraph',
              raw: t.raw,
              content,
              inlineChildren: parseInlineTokens(t.tokens as Token[]),
            })
          }
        }
        break
      }
      default: {
        if ('tokens' in token && (token as Tokens.Generic).tokens) {
          const g = token as Tokens.Generic
          const content = flattenInlineToText(g.tokens as Token[]).trim()
          if (content) {
            blocks.push({
              id: nextId(),
              type: 'paragraph',
              raw: g.raw || '',
              content,
              inlineChildren: parseInlineTokens(g.tokens as Token[]),
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
    case 'code':
    case 'quote':
    case 'table':
      return block.content
    case 'list':
      return block.items?.map((i) => i.content).join('\n') || ''
    case 'image':
      return block.alt || block.src || ''
    case 'hr':
      return '---'
    default:
      return block.content
  }
}
