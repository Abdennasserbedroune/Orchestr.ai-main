'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, ArrowUp, Mic, Plug, X, Square } from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'
import { ChatMessageBubble } from '@/components/ChatMessage'
import type { Message } from '@/components/ChatMessage'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { useChatStore } from '@/store/chat'
import { ModeSelector } from '@/components/Chat/ModeSelector'
import { ModelDropdown } from '@/components/Chat/ModelDropdown'
import { FreeCounter } from '@/components/Chat/FreeCounter'

// ── Inline SVG brand icons (no external dep) ──────────────────────────────────
function GitHubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  )
}
function NotionIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.Seven.326.841.513.841 1.494v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.54-1.632z"/>
    </svg>
  )
}
function N8nIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <rect width="60" height="60" rx="12" fill="#ea4b71"/>
      <text x="50%" y="54%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="monospace">n8n</text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Marketing digital',
  'Ventes & prospection',
  'Support client',
  'Recherche & veille',
  'Analyse de données',
  'Création de contenu',
  'Automatisation métier',
]

const MCP_TOOLS = [
  { id: 'github', name: 'GitHub', desc: 'Code & repos', color: '#e4e4e7', dot: '#c9d1d9', Icon: GitHubIcon },
  { id: 'notion', name: 'Notion', desc: 'Pages & bases', color: '#e4e4e7', dot: '#ffffff', Icon: NotionIcon },
  { id: 'n8n',    name: 'n8n',    desc: 'Workflows',     color: '#ea4b71', dot: '#ea4b71', Icon: N8nIcon },
]

const INITIALS: Record<string, string> = {
  github: 'GH', notion: 'N', n8n: 'N8',
}

function createId() { return Math.random().toString(36).slice(2, 10) }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)  return 'Orchestrez vos agents. Automatisez l’avenir.'
  if (h >= 12 && h < 18) return 'Vos agents travaillent. Vous dirigez.'
  if (h >= 18 && h < 22) return 'L’orchestration ne dort jamais.'
  return 'Pendant que vous dormez, vos agents agissent.'
}

// ─────────────────────────────────────────────────────────────────────────────
// MCP TOOLS DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function ToolsDrawer({ onClose }: { onClose: () => void }) {
  const [tapped, setTapped] = useState<string | null>(null)

  function handleTap(id: string) {
    setTapped(id)
    setTimeout(() => setTapped(null), 1600)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'oFadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 720,
          background: 'rgba(10,10,12,0.85)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: '28px',
          animation: 'oScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)',
          position: 'relative',
        }}
      >
        {/* Decorative top glow */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '50%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)',
          boxShadow: '0 4px 24px rgba(99,102,241,0.6)'
        }} />

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                <Plug size={18} strokeWidth={2.2} />
              </div>
              <p style={{ margin: 0, fontSize: 19, fontWeight: 700, color: '#fafafa', letterSpacing: '-0.02em' }}>
                Connexions MCP
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 13.5, color: '#a1a1aa', lineHeight: 1.5 }}>
              Connectez vos outils locaux ou distants pour étendre les capacités de vos agents.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.03)', color: '#a1a1aa',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease', flexShrink: 0,
            }}
            onMouseEnter={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = 'rgba(255,255,255,0.08)'
              b.style.color = '#ffffff'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget as HTMLButtonElement
              b.style.background = 'rgba(255,255,255,0.03)'
              b.style.color = '#a1a1aa'
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* tools grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
        }}>
          {MCP_TOOLS.map(tool => {
            const active = tapped === tool.id
            return (
              <button
                key={tool.id}
                onClick={() => handleTap(tool.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 16,
                  background: active ? `${tool.dot}10` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${active ? tool.dot + '35' : 'rgba(255,255,255,0.05)'}`,
                  cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'left', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.background = `${tool.dot}0a`
                  b.style.borderColor = `${tool.dot}25`
                  b.style.transform = 'translateY(-2px)'
                  b.style.boxShadow = `0 8px 16px ${tool.dot}10`
                }}
                onMouseLeave={e => {
                  if (tapped !== tool.id) {
                    const b = e.currentTarget as HTMLButtonElement
                    b.style.background = 'rgba(255,255,255,0.02)'
                    b.style.borderColor = 'rgba(255,255,255,0.05)'
                    b.style.transform = 'translateY(0)'
                    b.style.boxShadow = 'none'
                  }
                }}
              >
                {/* monogram avatar or custom icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${tool.dot}15`,
                  border: `1px solid ${tool.dot}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)'
                }}>
                  <div style={{ color: tool.dot, display: 'flex' }}><tool.Icon size={22} /></div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#fafafa', lineHeight: 1.2 }}>{tool.name}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 12, color: '#a1a1aa', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.desc}</p>
                </div>

                {/* tap ripple */}
                {active && (
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: 16,
                    background: `linear-gradient(90deg,transparent,${tool.dot}20,transparent)`,
                    animation: 'oShimmer 0.6s ease',
                  }} />
                )}
              </button>
            )
          })}
        </div>

        {/* coming-soon global pill */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            fontSize: 12, color: '#818cf8',
            fontWeight: 500, letterSpacing: '0.02em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#818cf8', boxShadow: '0 0 8px rgba(129,140,248,0.8)', animation: 'oPulse 2s ease-in-out infinite' }} />
            Toutes les intégrations sont en cours de développement
          </span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { mode, selectedModel, incrementUsage } = useChatStore()
  const [messages, setMessages]         = useState<Message[]>([])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [focused, setFocused]           = useState(false)
  const [greeting, setGreeting]         = useState('')
  const [greetingDone, setGreetingDone] = useState(false)
  const [showTools, setShowTools]       = useState(false)
  const [collapsed, setCollapsed]       = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef    = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)
  const streamingId = useRef<string | null>(null)

  // Greeting typewriter
  useEffect(() => {
    if (messages.length > 0) return
    const full = getGreeting()
    setGreeting('')
    setGreetingDone(false)
    let i = 0
    const t = setInterval(() => {
      i++
      if (i <= full.length) {
        setGreeting(full.slice(0, i))
      } else {
        clearInterval(t)
        setGreetingDone(true)
      }
    }, 32)
    return () => clearInterval(t)
  }, [messages.length])

  useEffect(() => { messagesRef.current = messages }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  // Stop streaming
  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    if (streamingId.current) {
      setMessages(prev =>
        prev.map(m =>
          m.id === streamingId.current
            ? { ...m, content: (m.content || '').trimEnd() + '\n\n*Réponse interrompue.*', streaming: false }
            : m
        )
      )
      streamingId.current = null
    }
    setLoading(false)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { id: createId(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setCollapsed(true)

    const aId = createId()
    streamingId.current = aId
    setMessages(prev => [...prev, { id: aId, role: 'assistant', content: '', streaming: true }])

    const history = [...messagesRef.current, userMsg].map(({ role, content }) => ({ role, content }))
    abortRef.current = new AbortController()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ 
           message: trimmed,
           mode: mode,
           selectedModel: selectedModel,
           history: history 
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || `Erreur ${res.status}`)
      }

      // Read the stream
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const parsed = JSON.parse(line.slice(6))

            if (parsed.type === 'meta') {
              // Store model info on the message
              setMessages(prev => prev.map(m =>
                m.id === aId
                  ? { ...m, modelUsed: parsed.modelUsed, attempts: parsed.attempts }
                  : m
              ))
              if (parsed.attempts > 1) {
                console.log(`Fallback: responded via ${parsed.modelUsed} after ${parsed.attempts} attempts`)
              }
              if (selectedModel !== 'auto') {
                incrementUsage(selectedModel)
                const { modelUsage, setSelectedModel } = useChatStore.getState()
                const usage = modelUsage[selectedModel]
                const today = new Date().toISOString().split('T')[0]
                if (usage && usage.lastReset === today && usage.count >= 3) {
                  setSelectedModel('auto')
                }
              }
            }

            if (parsed.type === 'chunk') {
              setMessages(prev => prev.map(m =>
                m.id === aId
                  ? { ...m, content: (m.content || '') + parsed.text, streaming: true }
                  : m
              ))
            }

            if (parsed.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === aId ? { ...m, streaming: false } : m
              ))
            }

          } catch {
            // malformed chunk, skip
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev =>
        prev.map(m =>
          m.id === aId
            ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', streaming: false }
            : m
        )
      )
    } finally {
      setLoading(false)
      streamingId.current = null
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [loading, mode, selectedModel, incrementUsage])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isFirstMessage = messages.length === 0
  const isActive       = focused || input.length > 0
  const canSend        = input.trim().length > 0 && !loading
  const W              = 720

  return (
    <>
      <style>{`
        @keyframes oFadeIn  { from{opacity:0}           to{opacity:1} }
        @keyframes oSlideUp { from{transform:translateY(36px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes oScaleUp { from{transform:scale(0.96);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes oBlink   { 0%,100%{opacity:1}        50%{opacity:0} }
        @keyframes oSpin    { to{transform:rotate(360deg)} }
        @keyframes oShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes oPulse   { 0%,100%{opacity:1}        50%{opacity:0.3} }
        @keyframes oSlideUpFade { from{transform:translateY(12px);opacity:0} to{transform:translateY(0);opacity:1} }
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:6px}
        textarea::placeholder{color:#3a3a40 !important}
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        background: '#0a0a0d',
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}>

        <AmbientBackground accentColor="#6c63ff" />

        {showTools && <ToolsDrawer onClose={() => setShowTools(false)} />}

        {/* ── MESSAGES ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', zIndex: 1, position: 'relative' }}>
          
          {/* STICKY HEADER for Controls */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 40,
            padding: '12px 0',
            background: 'linear-gradient(to bottom, rgba(10,10,13,0.9) 20%, rgba(10,10,13,0))',
            display: 'flex', justifyContent: 'center', pointerEvents: 'none'
          }}>
            <div style={{ pointerEvents: 'auto' }}>
              <ModeSelector />
            </div>
          </div>

          <div style={{
            maxWidth: W, margin: '0 auto',
            padding: '24px 20px 20px',
            display: 'flex', flexDirection: 'column',
          }}>

            {isFirstMessage ? (
              /* ── WELCOME SCREEN ── */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* logo */}
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                  marginBottom: 26, flexShrink: 0,
                  boxShadow: '0 0 0 2px rgba(99,102,241,0.35), 0 0 48px rgba(99,102,241,0.12)',
                }}>
                  <Image src="/logo.jpg" alt="OrchestrAI" width={80} height={80}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
                </div>

                {/* headline */}
                <h1 style={{
                  fontSize: 'clamp(22px,4vw,36px)', fontWeight: 700,
                  color: '#f4f4f5', textAlign: 'center',
                  letterSpacing: '-0.03em', lineHeight: 1.22,
                  marginBottom: 10, minHeight: '1.25em',
                }}>
                  {greeting}
                  {!greetingDone && (
                    <span style={{
                      display: 'inline-block', width: 2.5, height: '0.76em',
                      background: '#6366f1', borderRadius: 1.5,
                      marginLeft: 3, verticalAlign: 'middle',
                      animation: 'oBlink 0.85s step-end infinite',
                    }} />
                  )}
                </h1>
              </div>
            ) : (
              /* ── CONVERSATION ── */
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {messages.map(msg => (
                  <ChatMessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            )}

            <div ref={bottomRef} style={{ height: 8 }} />
          </div>
        </div>

        {/* ── PINNED INPUT ── */}
        <div style={{
          flexShrink: 0, zIndex: 10,
          padding: '8px 20px 20px',
          background: 'linear-gradient(to top,#0a0a0d 68%,transparent)',
        }}>
          <div style={{ maxWidth: W, margin: '0 auto' }}>

            {/* Controls on top of chatbox */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <FreeCounter />
            </div>

            {/* category chips */}
            {isFirstMessage && (
              <div style={{ 
                display: 'flex', flexWrap: 'nowrap', justifyContent: 'center', gap: 7, 
                marginBottom: 16, overflowX: 'auto',
                scrollbarWidth: 'none', msOverflowStyle: 'none'
              }}>
                {CATEGORIES.slice(0, 4).map((cat, i) => (
                  <button key={i}
                    onClick={() => {
                      setInput(cat)
                      setCollapsed(false)
                      setTimeout(() => inputRef.current?.focus(), 40)
                    }}
                    style={{
                      padding: '7px 15px', borderRadius: 100,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'transparent', color: '#71717a',
                      fontSize: 13.5, cursor: 'pointer',
                      outline: 'none',
                      opacity: 0,
                      animation: `oSlideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.05}s forwards`,
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    }}
                    onMouseEnter={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = 'rgba(255,255,255,0.05)'
                      b.style.color = '#e4e4e7'
                      b.style.borderColor = 'rgba(255,255,255,0.14)'
                    }}
                    onMouseLeave={e => {
                      const b = e.currentTarget as HTMLButtonElement
                      b.style.background = 'transparent'
                      b.style.color = '#71717a'
                      b.style.borderColor = 'rgba(255,255,255,0.08)'
                    }}
                  >{cat}</button>
                ))}
              </div>
            )}

            {/* collapsed pill - only shows when not loading and not focused */}
            {collapsed && !isActive && !loading && (
              <button
                onClick={() => {
                  setCollapsed(false)
                  setTimeout(() => inputRef.current?.focus(), 40)
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8,
                  padding: '13px 20px', borderRadius: 24,
                  background: 'rgba(10,10,12,0.7)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                  color: '#52525b', fontSize: 14.5, cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative', overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = 'rgba(255,255,255,0.15)'
                  b.style.color = '#a1a1aa'
                  b.style.background = 'rgba(10,10,12,0.85)'
                }}
                onMouseLeave={e => {
                  const b = e.currentTarget as HTMLButtonElement
                  b.style.borderColor = 'rgba(255,255,255,0.08)'
                  b.style.color = '#52525b'
                  b.style.background = 'rgba(10,10,12,0.7)'
                }}
              >
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '30%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
                }} />
                <ArrowUp size={14} strokeWidth={2} />
                <span>Continuer la conversation…</span>
              </button>
            )}

            {/* full input */}
            {(!collapsed || isActive || loading) && (
              <div style={{
                background: 'rgba(10,10,12,0.85)',
                backdropFilter: 'blur(30px)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 24,
                boxShadow: isActive
                  ? '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(99,102,241,0.15)'
                  : '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
                position: 'relative',
                zIndex: 20
              }}>

                {/* Decorative top glow matching MCP modal, but subtle */}
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
                  boxShadow: '0 2px 14px rgba(99,102,241,0.4)',
                  opacity: isActive ? 1 : 0.4,
                  transition: 'opacity 0.25s ease'
                }} />

                {/* textarea */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { setFocused(true); setCollapsed(false) }}
                  onBlur={() => setFocused(false)}
                  placeholder="Décrivez ce dont vous avez besoin…"
                  rows={1}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck
                  aria-label="Message"
                  style={{
                    width: '100%', background: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontSize: 15.5, lineHeight: 1.7, color: '#f0f0f2',
                    caretColor: '#6366f1',
                    padding: '16px 18px 0',
                    minHeight: 30, maxHeight: 200,
                    overflowY: 'auto', fontFamily: 'inherit',
                    display: 'block',
                  }}
                />

                {/* toolbar */}
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px 12px 12px',
                }}>
                  {/* left icons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ModelDropdown />
                    
                    <TBtn title="Joindre un fichier">
                      <Paperclip size={16} strokeWidth={1.9} />
                    </TBtn>
                    <TBtn title="Connexions MCP" onClick={() => setShowTools(true)} accent>
                      <Plug size={16} strokeWidth={1.9} />
                    </TBtn>
                    <TBtn title="Microphone">
                      <Mic size={16} strokeWidth={1.9} />
                    </TBtn>
                  </div>

                  {/* send / stop */}
                  <button
                    onClick={loading ? stopStream : () => sendMessage(input)}
                    disabled={!loading && !canSend}
                    title={loading ? 'Arrêter la génération' : 'Envoyer'}
                    style={{
                      width: 36, height: 36, borderRadius: 11,
                      border: 'none', flexShrink: 0,
                      background: loading
                        ? 'rgba(239,68,68,0.1)'
                        : canSend ? '#6366f1' : '#181820',
                      color: loading ? '#ef4444' : canSend ? '#fff' : '#2a2a32',
                      cursor: loading || canSend ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s ease',
                      boxShadow: canSend && !loading ? '0 0 18px rgba(99,102,241,0.5)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (loading || canSend)
                        (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.opacity = '1'
                    }}
                  >
                    {loading
                      ? <Square size={13} fill="#ef4444" strokeWidth={0} />
                      : <ArrowUp size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            )}

            <p style={{
              textAlign: 'center', fontSize: 11,
              color: '#ffffff', marginTop: 7, letterSpacing: '0.01em', opacity: 0.8,
            }}>
              Les conversations ne sont pas sauvegardées - elles disparaissent si vous quittez la page.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOLBAR BUTTON
// ─────────────────────────────────────────────────────────────────────────────
function TBtn({
  children, title, onClick, accent,
}: {
  children: React.ReactNode
  title: string
  onClick?: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32, borderRadius: 8, border: 'none',
        background: 'transparent',
        color: accent ? '#6366f1' : '#32323a',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.13s, background 0.13s',
      }}
      onMouseEnter={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.color = accent ? '#818cf8' : '#71717a'
        b.style.background = 'rgba(255,255,255,0.05)'
      }}
      onMouseLeave={e => {
        const b = e.currentTarget as HTMLButtonElement
        b.style.color = accent ? '#6366f1' : '#32323a'
        b.style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}
