'use client'
import Image from 'next/image'
import { useState, useCallback, useEffect, useRef } from 'react'
import { AGENTS_CATALOG } from '@/lib/agents-data'
import { DOMAIN_META } from '@/lib/mock-data'
import { Copy, Check, Download } from 'lucide-react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  modelUsed?: string
  attempts?: number
}

function useDisplayContent(content: string, streaming?: boolean) {
  const [animating, setAnimating] = useState(!!streaming)
  const prev = useRef('')

  useEffect(() => {
    if (streaming) { setAnimating(true); prev.current = content; return }
    setAnimating(false)
    prev.current = content
  }, [content, streaming])

  return { displayed: content, animating: !!streaming }
}

function detectAgentMentions(content: string) {
  return AGENTS_CATALOG.filter(a =>
    content.toLowerCase().includes(a.name.toLowerCase())
  )
}

function AgentCard({ slug }: { slug: string }) {
  const agent = AGENTS_CATALOG.find(a => a.slug === slug)
  if (!agent) return null
  const meta = DOMAIN_META[agent.domain]
  const Icon = meta.icon
  return (
    <a
      href={`/stack/${agent.slug}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        marginTop: 8, borderRadius: 14,
        padding: '11px 14px',
        background: meta.bg,
        border: `1px solid ${meta.color}35`,
        textDecoration: 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 6px 24px ${meta.color}20`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
      }}>
        <Icon size={15} style={{ color: meta.color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#e4e4e7' }}>{agent.name}</p>
        <p style={{ margin: 0, fontSize: 11.5, color: '#52525b', fontFamily: 'monospace' }}>{agent.role}</p>
      </div>
      <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: meta.color, flexShrink: 0 }}>
        Voir →
      </span>
    </a>
  )
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
  let last = 0, m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index} style={{ color: '#f4f4f5', fontWeight: 600 }}>{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={m.index} style={{ color: '#a1a1aa', fontStyle: 'italic' }}>{m[3]}</em>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

type Block =
  | { kind: 'text';    lines: string[] }
  | { kind: 'code';    lang: string; code: string }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'bullet';  items: string[] }

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const rawLines = content.split('\n')
  let i = 0

  while (i < rawLines.length) {
    const line = rawLines[i]

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < rawLines.length && !rawLines[i].startsWith('```')) {
        codeLines.push(rawLines[i])
        i++
      }
      i++
      blocks.push({ kind: 'code', lang, code: codeLines.join('\n') })
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
    if (headingMatch) {
      blocks.push({ kind: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      i++
      continue
    }

    if (line.match(/^[-*•]\s+/)) {
      const items: string[] = []
      while (i < rawLines.length && rawLines[i].match(/^[-*•]\s+/)) {
        items.push(rawLines[i].replace(/^[-*•]\s+/, ''))
        i++
      }
      blocks.push({ kind: 'bullet', items })
      continue
    }

    const lines: string[] = []
    while (
      i < rawLines.length &&
      !rawLines[i].startsWith('```') &&
      !rawLines[i].match(/^#{1,3}\s+/) &&
      !rawLines[i].match(/^[-*•]\s+/)
    ) {
      lines.push(rawLines[i])
      i++
    }
    if (lines.some(l => l.trim())) {
      blocks.push({ kind: 'text', lines })
    }
  }

  return blocks
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  const download = useCallback(() => {
    const exts: Record<string, string> = {
      json: 'json', javascript: 'js', js: 'js',
      typescript: 'ts', ts: 'ts', python: 'py',
      py: 'py', bash: 'sh', sh: 'sh',
    }
    const ext = exts[lang] ?? 'txt'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' }))
    a.download = `orchestrai.${ext}`
    a.click()
  }, [code, lang])

  return (
    <div style={{
      margin: '16px 0', borderRadius: 14, overflow: 'hidden',
      background: '#0c0c10', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#111116',
      }}>
        <span style={{
          fontFamily: 'monospace', fontSize: 11,
          textTransform: 'uppercase', letterSpacing: '0.08em', color: '#52525b',
        }}>
          {lang || 'code'}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn onClick={download}>
            <Download size={12} strokeWidth={2} />
            <span>Télécharger</span>
          </IconBtn>
          <IconBtn onClick={copy} green={copied}>
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
            <span>{copied ? 'Copié !' : 'Copier'}</span>
          </IconBtn>
        </div>
      </div>
      <pre style={{
        overflowX: 'auto', margin: 0,
        padding: '16px 18px',
        fontSize: 13.5, lineHeight: 1.7,
        fontFamily: '"Fira Code","Cascadia Code",monospace',
        color: '#c9d1d9', whiteSpace: 'pre',
      }}>
        <code>{code.trimEnd()}</code>
      </pre>
    </div>
  )
}

function IconBtn({
  children, onClick, green,
}: { children: React.ReactNode; onClick: () => void; green?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '4px 9px', borderRadius: 7, border: 'none',
        background: green ? 'rgba(74,222,128,0.08)' : 'transparent',
        color: green ? '#4ade80' : '#71717a',
        fontSize: 11.5, fontFamily: 'monospace', cursor: 'pointer',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e =>
        (e.currentTarget as HTMLButtonElement).style.color = green ? '#86efac' : '#a1a1aa'
      }
      onMouseLeave={e =>
        (e.currentTarget as HTMLButtonElement).style.color = green ? '#4ade80' : '#71717a'
      }
    >
      {children}
    </button>
  )
}

function Avatar({ animating }: { animating: boolean }) {
  return (
    <div style={{ flexShrink: 0, position: 'relative', width: 38, height: 38, marginTop: 2 }}>
      {animating && (
        <span style={{
          position: 'absolute', inset: -5, borderRadius: '50%',
          border: '1.5px dashed rgba(99,102,241,0.45)',
          animation: 'oSpin 2s linear infinite',
        }} />
      )}
      <div style={{
        width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
        boxShadow: animating
          ? '0 0 0 1.5px rgba(99,102,241,0.6), 0 0 20px rgba(99,102,241,0.35)'
          : '0 0 0 1px rgba(99,102,241,0.2)',
        transition: 'box-shadow 0.4s ease',
      }}>
        <Image src="/logo.jpg" alt="OrchestrAI" width={38} height={38}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            filter: animating ? 'brightness(1.08)' : 'brightness(0.95)',
            transition: 'filter 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}

export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const { displayed, animating } = useDisplayContent(message.content, message.streaming)
  const mentions = !isUser ? detectAgentMentions(message.content) : []

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
        <div style={{
          maxWidth: '74%',
          background: 'linear-gradient(145deg,#1c1a3e,#181830)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '20px 20px 4px 20px',
          padding: '13px 18px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>
          <p style={{
            margin: 0, fontSize: 15.5, lineHeight: 1.7,
            color: '#e8e8f0', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          }}>
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  const blocks = parseBlocks(displayed)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, width: '100%' }}>
      <Avatar animating={animating} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 8px',
          fontSize: 11.5, fontWeight: 700, color: '#6366f1',
          fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          OrchestrAI
        </p>

        <div style={{ fontSize: 15.5, lineHeight: 1.8, color: '#c8c8d4' }}>
          {blocks.map((block, bi) => {
            if (block.kind === 'code') {
              return <CodeBlock key={bi} code={block.code} lang={block.lang} />
            }
            if (block.kind === 'heading') {
              const sizes: Record<number, string> = { 1: '18px', 2: '16px', 3: '15px' }
              return (
                <p key={bi} style={{
                  margin: '16px 0 6px',
                  fontSize: sizes[block.level] || '16px',
                  fontWeight: 700, color: '#e8e8f0',
                  letterSpacing: '-0.01em', lineHeight: 1.3,
                }}>
                  {renderInline(block.text)}
                </p>
              )
            }
            if (block.kind === 'bullet') {
              return (
                <ul key={bi} style={{
                  margin: '8px 0', paddingLeft: 20,
                  display: 'flex', flexDirection: 'column', gap: 4,
                }}>
                  {block.items.map((item, ii) => (
                    <li key={ii} style={{ fontSize: 15.5, lineHeight: 1.7, color: '#c8c8d4' }}>
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              )
            }
            return (
              <div key={bi} style={{ marginBottom: 4 }}>
                {block.lines.map((line, li) =>
                  line.trim() === '' ? (
                    <br key={li} />
                  ) : (
                    <span key={li} style={{ display: 'block', lineHeight: 1.8 }}>
                      {renderInline(line)}
                    </span>
                  )
                )}
              </div>
            )
          })}

          {animating && (
            <span style={{
              display: 'inline-block', marginLeft: 2,
              verticalAlign: 'middle',
              width: 2, height: 16,
              background: '#6366f1', borderRadius: 1,
              animation: 'oBlink 0.85s step-end infinite',
            }} aria-hidden />
          )}
        </div>

        {!animating && mentions.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {mentions.map(a => <AgentCard key={a.slug} slug={a.slug} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
