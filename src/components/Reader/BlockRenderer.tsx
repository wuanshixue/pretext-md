import { useRef, useEffect } from 'react'
import type { Block } from '../../core/markdown'
import { useSettingsStore } from '../../stores/settings'
import { CodeBlock } from 'animal-island-ui'
import { InlineRenderer } from './InlineRenderer'

interface BlockRendererProps {
  block: Block
  onHeightMeasured?: (height: number) => void
}

export function BlockRenderer({ block, onHeightMeasured }: BlockRendererProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { fontSize, lineHeight } = useSettingsStore()
  const measuredRef = useRef(false)

  useEffect(() => {
    if (!ref.current || !onHeightMeasured || measuredRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const h = entry.contentRect.height
        if (h > 0) {
          onHeightMeasured(h)
          measuredRef.current = true
          observer.disconnect()
        }
      }
    })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [onHeightMeasured, block.id])

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-reading)',
    fontSize: `${fontSize}px`,
    lineHeight,
    color: 'var(--text)',
    wordBreak: 'keep-all',
    whiteSpace: 'pre-wrap',
    letterSpacing: '0.01em',
  }

  const renderInline = (inlineChildren: Block['inlineChildren'], fallback: string) => {
    if (inlineChildren && inlineChildren.length > 0) {
      return <InlineRenderer nodes={inlineChildren} />
    }
    return fallback
  }

  switch (block.type) {
    case 'heading': {
      const level = block.level || 1
      const sizes: Record<number, string> = {
        1: `${fontSize * 1.8}px`,
        2: `${fontSize * 1.5}px`,
        3: `${fontSize * 1.25}px`,
        4: `${fontSize * 1.1}px`,
        5: `${fontSize}px`,
        6: `${fontSize * 0.95}px`,
      }
      const headingStyle: React.CSSProperties = {
        ...baseStyle,
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: sizes[level],
        lineHeight: 1.3,
        color: 'var(--island-header)',
        margin: `${fontSize * 0.8}px 0 ${fontSize * 0.4}px`,
      }
      const content = renderInline(block.inlineChildren, block.content)
      return (
        <div ref={ref}>
          {level === 1 && <h1 style={headingStyle}>{content}</h1>}
          {level === 2 && <h2 style={headingStyle}>{content}</h2>}
          {level === 3 && <h3 style={headingStyle}>{content}</h3>}
          {level === 4 && <h4 style={headingStyle}>{content}</h4>}
          {level === 5 && <h5 style={headingStyle}>{content}</h5>}
          {level >= 6 && <h6 style={headingStyle}>{content}</h6>}
        </div>
      )
    }

    case 'paragraph':
      return (
        <div ref={ref}>
          <p style={{ ...baseStyle, marginBottom: `${fontSize * 0.6}px` }}>
            {renderInline(block.inlineChildren, block.content)}
          </p>
        </div>
      )

    case 'code':
      return (
        <div ref={ref} style={{ marginBottom: `${fontSize * 0.6}px` }}>
          <CodeBlock code={block.content} />
        </div>
      )

    case 'quote':
      return (
        <div ref={ref}>
          <blockquote
            style={{
              ...baseStyle,
              borderLeft: '3px solid var(--green)',
              paddingLeft: `${fontSize * 0.8}px`,
              marginLeft: 0,
              marginRight: 0,
              marginBottom: `${fontSize * 0.6}px`,
              color: 'var(--muted)',
              fontStyle: 'italic',
            }}
          >
            {block.children
              ? block.children.map((child) => (
                  <BlockRenderer key={child.id} block={child} />
                ))
              : renderInline(block.inlineChildren, block.content)}
          </blockquote>
        </div>
      )

    case 'list': {
      const isOrdered = block.ordered
      const ListTag = isOrdered ? 'ol' : 'ul'
      return (
        <div ref={ref}>
          <ListTag
            start={isOrdered && block.start && block.start > 1 ? block.start : undefined}
            style={{
              ...baseStyle,
              paddingLeft: `${fontSize * 1.2}px`,
              marginBottom: `${fontSize * 0.6}px`,
              listStyleType: isOrdered ? 'decimal' : 'disc',
            }}
          >
            {block.items?.map((item, i) => (
              <li
                key={i}
                style={{
                  marginBottom: `${fontSize * 0.2}px`,
                  paddingLeft: `${fontSize * 0.3}px`,
                }}
              >
                {item.checked !== undefined && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      border: '2px solid var(--island-border)',
                      background: item.checked ? 'var(--island-accent)' : 'transparent',
                      marginRight: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                )}
                <span>{renderInline(item.inlineChildren, item.content)}</span>
                {item.children && item.children.length > 0 && (
                  <div style={{ marginTop: `${fontSize * 0.2}px` }}>
                    {item.children.map((child) => (
                      <BlockRenderer key={child.id} block={child} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ListTag>
        </div>
      )
    }

    case 'table':
      return (
        <div
          ref={ref}
          style={{
            marginBottom: `${fontSize * 0.6}px`,
            overflowX: 'auto',
          }}
        >
          <table
            style={{
              ...baseStyle,
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: `${fontSize * 0.9}px`,
            }}
          >
            {block.headerRowInline && (
              <thead>
                <tr>
                  {block.headerRowInline.map((cellInline, i) => (
                    <th
                      key={i}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 600,
                        borderBottom: '2px solid var(--island-border)',
                        color: 'var(--island-header)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      <InlineRenderer nodes={cellInline} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            {block.rowsInline && (
              <tbody>
                {block.rowsInline.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cellInline, ci) => (
                      <td
                        key={ci}
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid var(--island-border)',
                        }}
                      >
                        <InlineRenderer nodes={cellInline} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      )

    case 'image':
      return (
        <div ref={ref} style={{ marginBottom: `${fontSize * 0.6}px` }}>
          <img
            src={block.src}
            alt={block.alt || ''}
            style={{
              maxWidth: '100%',
              borderRadius: 12,
              display: 'block',
            }}
            loading="lazy"
          />
          {block.alt && (
            <p
              style={{
                textAlign: 'center' as const,
                marginTop: 8,
                fontSize: `${fontSize * 0.85}px`,
                color: 'var(--muted)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              {block.alt}
            </p>
          )}
        </div>
      )

    case 'hr':
      return (
        <div ref={ref} style={{ padding: `${fontSize * 0.4}px 0` }}>
          <div
            style={{
              height: 2,
              background:
                'linear-gradient(90deg, transparent, var(--island-border) 20%, var(--island-border) 80%, transparent)',
              borderRadius: 1,
            }}
          />
        </div>
      )

    default:
      return (
        <div ref={ref}>
          <p style={baseStyle}>{block.content}</p>
        </div>
      )
  }
}
