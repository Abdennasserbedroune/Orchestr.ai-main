'use client'
// Clean two-sided chat: left = OrchestrAI avatar + text, right = plain text only
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

function useTypingAnimation(content: string, streaming?: boolean) {
  const [displayed, setDisplayed] = useState('')
  const [animating, setAnimating] = useState(false)
  const prevContent = useRef('')
  useEffect(() => {
    if (streaming) { setDisplayed(content); setAnimating(true); prevContent.current = content; return }
    if (content !== prevContent.current) {
      prevContent.current = content
      const words = content.split(' ')
      let i = 0; setDisplayed(''); setAnimating(true)
      const iv = setInterval(() => {
        i++; setDisplayed(words.slice(0, i).join(' '))
        if (i >= words.length) { clearInterval(iv); setAnimating(false) }
      }, 18)
      return () => clearInterval(iv)
    }
  }, [content, streaming])
  return { displayed, animating }
}

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
        <p className="text-sm font-semibold truncate" style={{ color: '#e4e4e7' }}>{agent.name}</p>
        <p className="font-mono text-[10px] mt-0.5 truncate" style={{ color: '#52525b' }}>{agent.role}</p>
      </div>
      <span className="font-mono text-[10px] flex-shrink-0" style={{ color: meta.color }}>View →</span>
    </a>
  )
}

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
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: '#52525b' }}>{lang || 'code'}</span>
        <div className="flex items-center gap-2">
          <button onClick={handleDownload} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono hover:bg-white/[0.06] transition-all" style={{ color: '#71717a' }}>
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

// ── Big animated avatar (56px, double orbit while writing) ──────
function OrchestrAIAvatar({ animating }: { animating: boolean }) {
  return (
    <div className="flex-shrink-0" style={{ marginTop: 2 }}>
      <div className="relative" style={{ width: 56, height: 56 }}>
        {animating && (
          <span style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px dashed rgba(99,102,241,0.6)', animation:'spin 1.6s linear infinite' }} />
        )}
        {animating && (
          <span style={{ position:'absolute', inset:-9, borderRadius:'50%', border:'1.5px dashed rgba(99,102,241,0.22)', animation:'spin 3.5s linear infinite reverse' }} />
        )}
        <div style={{ width:56, height:56, borderRadius:'50%', overflow:'hidden', position:'relative', background:'linear-gradient(135deg,#1e1e2e,#12121a)',
          boxShadow: animating ? '0 0 0 2.5px rgba(99,102,241,0.7),0 0 32px rgba(99,102,241,0.5)' : '0 0 0 2px rgba(99,102,241,0.3),0 0 16px rgba(99,102,241,0.15)',
          transition:'box-shadow 0.4s ease' }}>
          {animating && <span className="absolute inset-0 rounded-full" style={{ background:'rgba(99,102,241,0.15)', animation:'pulse 1.2s ease-in-out infinite' }} />}
          <Image src="/logo.jpg" alt="OrchestrAI" width={56} height={56} className="relative z-10"
            style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%',
              filter: animating ? 'brightness(1.2)' : 'brightness(1)', transition:'filter 0.4s ease' }} />
        </div>
      </div>
    </div>
  )
}

export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const { displayed, animating } = useTypingAnimation(message.content, message.streaming)
  const mentions = !isUser ? detectAgentMentions(message.content) : []
  const parts = parseContent(isUser ? message.content : displayed)

  // ── USER: right-aligned plain text, no labels, no bubble ────────
  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <p className="text-sm leading-relaxed text-right"
          style={{ color: '#a1a1aa', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '72%' }}>
          {message.content}
        </p>
      </div>
    )
  }

  // ── ASSISTANT: left-aligned with animated avatar ─────────────
  return (
    <div className="flex w-full justify-start gap-4">
      <OrchestrAIAvatar animating={animating} />
      <div className="flex flex-col gap-1.5 items-start" style={{ maxWidth: 'calc(100% - 72px)' }}>
        <div className="text-sm leading-relaxed" style={{ color: 'var(--color-foreground)' }}>
          {parts.map((part, idx) =>
            part.type === 'code' ? (
              <CodeBlock key={idx} code={part.value} lang={part.lang || 'text'} />
            ) : (
              <span key={idx} style={{ whiteSpace: 'pre-wrap' }}>{part.value}</span>
            )
          )}
          {animating && (
            <span className="inline-block ml-0.5 align-middle" aria-hidden="true"
              style={{ width:2, height:15, background:'var(--color-brand,#6366f1)', borderRadius:1, animation:'blink 0.9s step-end infinite' }} />
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
