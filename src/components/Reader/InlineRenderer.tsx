import type { InlineNode } from '../../core/markdown'

interface InlineRendererProps {
  nodes: InlineNode[]
}

export function InlineRenderer({ nodes }: InlineRendererProps) {
  return (
    <>
      {nodes.map((node, i) => {
        switch (node.type) {
          case 'text':
            return <span key={i}>{node.text}</span>
          case 'bold':
            return (
              <strong key={i}>
                <InlineRenderer nodes={node.children} />
              </strong>
            )
          case 'italic':
            return (
              <em key={i}>
                <InlineRenderer nodes={node.children} />
              </em>
            )
          case 'link':
            return (
              <a
                key={i}
                href={node.href}
                title={node.title}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--island-accent)',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(25,200,185,0.4)',
                  textUnderlineOffset: 3,
                }}
              >
                <InlineRenderer nodes={node.children} />
              </a>
            )
          case 'image':
            return (
              <img
                key={i}
                src={node.src}
                alt={node.alt}
                style={{
                  maxWidth: '100%',
                  borderRadius: 8,
                  display: 'inline',
                  verticalAlign: 'middle',
                }}
                loading="lazy"
              />
            )
          case 'code':
            return (
              <code
                key={i}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9em',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(0,0,0,0.06)',
                  color: '#c7254e',
                }}
              >
                {node.text}
              </code>
            )
          case 'del':
            return (
              <del key={i} style={{ opacity: 0.6 }}>
                <InlineRenderer nodes={node.children} />
              </del>
            )
          default:
            return null
        }
      })}
    </>
  )
}
