'use client'
// Claude-style streaming — bigger spinning logo, flat user text (no bubble = no overflow)
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
}

// ── Typing animation ───────────────────────────────────────────
function useTypingAnimation(content: string, streaming?: boolean) {
  const [displayed, setDisplayed] = useState('')
  const [animating, setAnimating] = useState(false)
  const prevContent = useRef('')

  useEffect(() => {
    if (streaming) {
      setDisplayed(content)
      setAnimating(true)
      prevContent.current = content
      return
    }
    if (content !== prevContent.current) {
      prevContent.current = content
      const words = content.split(' ')
      let i = 0
      setDisplayed('')
      setAnimating(true)
      const interval = setInterval(() => {
        i++
        setDisplayed(words.slice(0, i).join(' '))
        if (i >= words.length) { clearInterval(interval); setAnimating(false) }
      }, 18)
      return () => clearInterval(interval)
    }
  }, [content, streaming])

  return { displayed, animating }
}

// ── Agent mention card ────────────────────────────────────────
function detectAgentMentions(content: string) {
  return AGENTS_CATALOG.filter(a => content.toLowerCase().includes(a.name.toLowerCase()))
}

function AgentMentionCard({ slug }: { slug: string }) {
  const agent = AGENTS_CATALOG.find(a => a.slug === slug)
  if (!agent) return null
  const meta = DOMAIN_META[agent.domain]
  const Icon = meta.icon
  return (
    <a href={`/stack/${agent.slug}`}
      className="flex items-center gap-3 mt-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{ background: meta.bg, border: `1px solid ${meta.color}40`, boxShadow: `0 0 16px ${meta.color}15`, textDecoration: 'none' }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}50` }}>
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
        <p className="font-mono text-2xs text-muted tracking-wider uppercase truncate">{agent.role}</p>
      </div>
      <span className="font-mono text-2xs flex-shrink-0" style={{ color: meta.color }}>View &#x2192;</span>
    </a>
  )
}

// ── Content parser ────────────────────────────────────────────
function parseContent(content: string): Array<{ type: 'text' | 'code'; value: string; lang?: string }> {
  const parts: Array<{ type: 'text' | 'code'; value: string; lang?: string }> = []
  const regex = /```(\w*)\n?([\s\S]*?)```/g
  let lastIndex = 0; let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: content.slice(lastIndex, match.index) })
    parts.push({ type: 'code', lang: match[1] || 'text', value: match[2] })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < content.length) parts.push({ type: 'text', value: content.slice(lastIndex) })
  return parts
}

// ── Code block ────────────────────────────────────────────────
function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }, [code])
  const handleDownload = useCallback(() => {
    const ext = lang === 'json' ? 'json' : ['javascript','js'].includes(lang) ? 'js' :
      ['typescript','ts'].includes(lang) ? 'ts' : ['python','py'].includes(lang) ? 'py' :
      ['bash','sh'].includes(lang) ? 'sh' : 'txt'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `orchestrai-output.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }, [code, lang])
  return (
    <div className="relative my-3 rounded-xl overflow-hidden" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#111111' }}>
        <span className="font-mono text-xs text-[#52525b] uppercase tracking-wider">{lang || 'code'}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-[#71717a] hover:text-[#a1a1aa] hover:bg-white/[0.06] transition-all">
            <Download size={12} strokeWidth={2} /><span>Download</span>
          </button>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
            style={{ color: copied ? '#4ade80' : '#71717a', background: copied ? 'rgba(74,222,128,0.08)' : 'transparent' }}>
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-[13px] leading-relaxed font-mono" style={{ color: '#e4e4e7', margin: 0, whiteSpace: 'pre' }}>
        <code>{code.trimEnd()}</code>
      </pre>
    </div>
  )
}

// ── OrchestrAI animated avatar — 52px, big spinning orbit ─────
function OrchestrAIAvatar({ animating }: { animating: boolean }) {
  return (
    <div className="flex-shrink-0" style={{ marginTop: 2 }}>
      <div className="relative" style={{ width: 56, height: 56 }}>

        {/* Outer spinning dashed ring — only while writing */}
        {animating && (
          <span style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px dashed rgba(99,102,241,0.6)',
            animation: 'spin 1.6s linear infinite',
          }} />
        )}

        {/* Second slower counter-spinning ring for depth */}
        {animating && (
          <span style={{
            position: 'absolute',
            inset: -9,
            borderRadius: '50%',
            border: '1.5px dashed rgba(99,102,241,0.22)',
            animation: 'spin 3.5s linear infinite reverse',
          }} />
        )}

        {/* Avatar circle */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            overflow: 'hidden',
            position: 'relative',
            background: 'linear-gradient(135deg, #1e1e2e, #12121a)',
            boxShadow: animating
              ? '0 0 0 2.5px rgba(99,102,241,0.7), 0 0 32px rgba(99,102,241,0.5)'
              : '0 0 0 2px rgba(99,102,241,0.3), 0 0 16px rgba(99,102,241,0.15)',
            transition: 'box-shadow 0.4s ease',
          }}
        >
          {/* Indigo pulse fill */}
          {animating && (
            <span className="absolute inset-0 rounded-full" style={{
              background: 'rgba(99,102,241,0.15)',
              animation: 'pulse 1.2s ease-in-out infinite',
            }} />
          )}
          <Image
            src="/logo.jpg"
            alt="OrchestrAI"
            width={56}
            height={56}
            className="relative z-10"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              filter: animating ? 'brightness(1.2)' : 'brightness(1)',
              transition: 'filter 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Main chat bubble ──────────────────────────────────────────
export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const { displayed, animating } = useTypingAnimation(message.content, message.streaming)
  const mentions = !isUser ? detectAgentMentions(message.content) : []
  const parts = parseContent(isUser ? message.content : displayed)

  // ── USER message — full-width right-aligned, NO bubble, NO overflow ──
  if (isUser) {
    return (
      <div className="flex w-full justify-end gap-3">
        {/* Text block — full width available, wraps naturally */}
        <div className="flex flex-col items-end" style={{ maxWidth: 'calc(100% - 52px)' }}>
          <span className="font-mono text-[10px] text-[#3f3f46] uppercase tracking-widest mb-1.5 pr-1">
            Vous
          </span>
          <p
            className="text-sm leading-relaxed text-right"
            style={{
              color: '#c4c4cc',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.content}
          </p>
        </div>
        {/* Small user avatar */}
        <div
          className="flex-shrink-0"
          style={{ marginTop: 22 }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(99,102,241,0.1))',
              border: '1px solid rgba(99,102,241,0.28)',
              flexShrink: 0,
            }}
          >
            <span className="font-mono text-xs font-bold" style={{ color: '#818cf8' }}>U</span>
          </div>
        </div>
      </div>
    )
  }

  // ── ASSISTANT message — left-aligned with animated avatar ──
  return (
    <div className="flex w-full justify-start gap-4">
      <OrchestrAIAvatar animating={animating} />

      <div className="flex flex-col gap-1.5 items-start" style={{ maxWidth: 'calc(100% - 72px)' }}>
        <span className="font-mono text-[10px] text-[#3f3f46] uppercase tracking-widest px-1">
          OrchestrAI
        </span>

        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
          {parts.map((part, idx) =>
            part.type === 'code' ? (
              <CodeBlock key={idx} code={part.value} lang={part.lang || 'text'} />
            ) : (
              <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>{part.value}</span>
            )
          )}
          {animating && (
            <span
              className="inline-block ml-0.5 align-middle"
              style={{
                width: 2, height: 15,
                background: 'var(--color-brand, #6366f1)',
                borderRadius: 1,
                animation: 'blink 0.9s step-end infinite',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {!animating && mentions.length > 0 && (
          <div className="w-full flex flex-col gap-1.5 mt-1">
            {mentions.map(agent => <AgentMentionCard key={agent.slug} slug={agent.slug} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
