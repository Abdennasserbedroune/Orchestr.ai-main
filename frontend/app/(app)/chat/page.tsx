'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, ArrowUp, Mic, Plug, X, Square } from 'lucide-react'
import { ChatMessageBubble } from '@/components/ChatMessage'
import type { Message } from '@/components/ChatMessage'
import Image from 'next/image'

const CATEGORIES = [
  'Marketing digital',
  'Ventes & prospection',
  'Support client',
  'Recherche & veille',
  'Analyse de donn\u00e9es',
  'Cr\u00e9ation de contenu',
  'Automatisation m\u00e9tier',
]

const MCP_TOOLS = [
  { id: 'github',      name: 'GitHub',    desc: 'Code & repos',     color: '#e4e4e7', dot: '#c9d1d9' },
  { id: 'notion',      name: 'Notion',    desc: 'Pages & bases',    color: '#e4e4e7', dot: '#ffffff' },
  { id: 'n8n',         name: 'n8n',       desc: 'Workflows',        color: '#ea4b71', dot: '#ea4b71' },
  { id: 'slack',       name: 'Slack',     desc: 'Notifications',    color: '#e01e5a', dot: '#e01e5a' },
  { id: 'googledrive', name: 'Drive',     desc: 'Fichiers & docs',  color: '#34a853', dot: '#34a853' },
  { id: 'airtable',   name: 'Airtable',  desc: 'Tables & data',    color: '#18bfff', dot: '#18bfff' },
  { id: 'linear',     name: 'Linear',    desc: 'Projets & sprints', color: '#5e6ad2', dot: '#5e6ad2' },
  { id: 'calendly',   name: 'Calendly',  desc: 'Agenda & RDV',     color: '#006bff', dot: '#006bff' },
]

const INITIALS: Record<string, string> = {
  github: 'GH', notion: 'N', n8n: 'N8', slack: 'S',
  googledrive: 'GD', airtable: 'AT', linear: 'LN', calendly: 'CL',
}

function createId() { return Math.random().toString(36).slice(2, 10) }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Orchestrez vos agents. Automatisez l\u2019avenir.'
  if (h >= 12 && h < 18) return 'Vos agents travaillent. Vous dirigez.'
  if (h >= 18 && h < 22) return 'L\u2019orchestration ne dort jamais.'
  return 'Pendant que vous dormez, vos agents agissent.'
}

function DisclaimerBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 14px', borderRadius: 10, marginBottom: 28,
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
      <p style={{ margin: 0, fontSize: 12.5, color: '#52525b', lineHeight: 1.5 }}>
        Les conversations ne sont{' '}
        <span style={{ color: '#71717a', fontWeight: 500 }}>pas sauvegard\u00e9es</span>
        {' '}\u2014 elles disparaissent si vous quittez la page.
      </p>
    </div>
  )
}

function ToolsDrawer({ onClose }: { onClose: () => void }) {
  const [tapped, setTapped] = useState<string | null>(null)
  function handleTap(id: string) {
    setTapped(id)
    setTimeout(() => setTapped(null), 1600)
  }
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 400,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'oFadeIn 0.15s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 740, margin: '0 20px',
        background: '#111113', border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '22px 22px 0 0', padding: '0 0 40px',
        animation: 'oSlideUp 0.22s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '0 -32px 80px rgba(0,0,0,0.9)',
      }}>
        <div style={{ padding: '14px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 38, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.1)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 24px 0' }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f4f4f5', letterSpacing: '-0.015em' }}>Connexions MCP</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#52525b', lineHeight: 1.5 }}>Connectez vos outils \u2014 chaque int\u00e9gration arrive bient\u00f4t.</p>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: 'none',
            background: 'rgba(255,255,255,0.06)', color: '#71717a',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s', flexShrink: 0, marginTop: 2,
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
          ><X size={14} strokeWidth={2} /></button>
        </div>
        <div style={{ padding: '16px 24px 4px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 11px', borderRadius: 100,
            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            fontSize: 11.5, color: '#6366f1', fontWeight: 500, letterSpacing: '0.04em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', animation: 'oPulse 2s ease-in-out infinite' }} />
            Bient\u00f4t disponible
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(156px, 1fr))', gap: 10, padding: '16px 24px 0' }}>
          {MCP_TOOLS.map(tool => {
            const active = tapped === tool.id
            return (
              <button key={tool.id} onClick={() => handleTap(tool.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 14px', borderRadius: 14,
                background: active ? `${tool.dot}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? tool.dot + '35' : 'rgba(255,255,255,0.07)'}`,
                cursor: 'pointer', transition: 'all 0.17s ease',
                textAlign: 'left', position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = `${tool.dot}0d`; b.style.borderColor = `${tool.dot}30` }}
                onMouseLeave={e => { if (tapped !== tool.id) { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(255,255,255,0.03)'; b.style.borderColor = 'rgba(255,255,255,0.07)' } }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `${tool.dot}18`, border: `1px solid ${tool.dot}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: tool.dot, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{INITIALS[tool.id]}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#e4e4e7', lineHeight: 1.2 }}>{tool.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#52525b', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tool.desc}</p>
                </div>
                {active && <div style={{ position: 'absolute', inset: 0, borderRadius: 14, background: `linear-gradient(90deg,transparent,${tool.dot}18,transparent)`, animation: 'oShimmer 0.7s ease' }} />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [focused, setFocused]   = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef    = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)
  const streamingId = useRef<string | null>(null)

  // Greeting is computed once — no typewriter, no state, no interval
  const greeting = getGreeting()

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    if (streamingId.current) {
      setMessages(prev => prev.map(m =>
        m.id === streamingId.current
          ? { ...m, content: (m.content || '').trimEnd() + '\n\n*R\u00e9ponse interrompue.*', streaming: false }
          : m
      ))
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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) throw new Error(`Erreur ${res.status}`)
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === aId ? { ...m, content: m.content + chunk } : m))
      }
      setMessages(prev => prev.map(m => m.id === aId ? { ...m, streaming: false } : m))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => prev.map(m =>
        m.id === aId ? { ...m, content: 'Une erreur est survenue. Veuillez r\u00e9essayer.', streaming: false } : m
      ))
    } finally {
      setLoading(false)
      streamingId.current = null
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [loading])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const isFirstMessage = messages.length === 0
  const isActive       = focused || input.length > 0
  const canSend        = input.trim().length > 0 && !loading
  const W              = 720

  return (
    <>
      <style>{`
        @keyframes oFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes oSlideUp { from { transform: translateY(36px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes oSpin    { to { transform: rotate(360deg) } }
        @keyframes oShimmer { 0% { transform: translateX(-100%) } 100% { transform: translateX(200%) } }
        @keyframes oPulse   { 0%, 100% { opacity: 1 } 50% { opacity: 0.3 } }
        @keyframes greetIn  { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
        * { box-sizing: border-box }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: transparent }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 6px }
        textarea::placeholder { color: #3a3a40 !important }
      `}</style>

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', overflow: 'hidden',
        background: '#0a0a0d',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div aria-hidden style={{
          position: 'fixed', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw', height: '60vh',
          background: 'radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%)',
          filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0,
        }} />

        {showTools && <ToolsDrawer onClose={() => setShowTools(false)} />}

        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', zIndex: 1 }}>
          <div style={{ maxWidth: W, margin: '0 auto', padding: '52px 20px 20px', display: 'flex', flexDirection: 'column' }}>
            {isFirstMessage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                  marginBottom: 26, flexShrink: 0,
                  boxShadow: '0 0 0 2px rgba(99,102,241,0.35), 0 0 48px rgba(99,102,241,0.12)',
                }}>
                  <Image src="/logo.jpg" alt="OrchestrAI" width={80} height={80}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
                </div>

                {/* Greeting — plain text, no typewriter, clean fade-in */}
                <h1 style={{
                  fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700,
                  color: '#f4f4f5', textAlign: 'center',
                  letterSpacing: '-0.03em', lineHeight: 1.22,
                  marginBottom: 10,
                  animation: 'greetIn 0.5s ease forwards',
                }}>
                  {greeting}
                </h1>

                <p style={{ fontSize: 15, color: '#52525b', textAlign: 'center', marginBottom: 28, lineHeight: 1.65, maxWidth: 420 }}>
                  D\u00e9crivez votre besoin ou choisissez un domaine pour commencer.
                </p>
                <DisclaimerBanner />
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 7, maxWidth: 500 }}>
                  {CATEGORIES.map((cat, i) => (
                    <button key={i} onClick={() => { setInput(cat); setCollapsed(false); setTimeout(() => inputRef.current?.focus(), 40) }}
                      style={{ padding: '7px 15px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#71717a', fontSize: 13.5, cursor: 'pointer', transition: 'all 0.15s ease', outline: 'none' }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'rgba(255,255,255,0.05)'; b.style.color = '#e4e4e7'; b.style.borderColor = 'rgba(255,255,255,0.14)' }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = 'transparent'; b.style.color = '#71717a'; b.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    >{cat}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {messages.map(msg => <ChatMessageBubble key={msg.id} message={msg} />)}
              </div>
            )}
            <div ref={bottomRef} style={{ height: 8 }} />
          </div>
        </div>

        <div style={{ flexShrink: 0, zIndex: 10, padding: '8px 20px 20px', background: 'linear-gradient(to top, #0a0a0d 68%, transparent)' }}>
          <div style={{ maxWidth: W, margin: '0 auto' }}>
            {collapsed && !isActive && !loading && (
              <button onClick={() => { setCollapsed(false); setTimeout(() => inputRef.current?.focus(), 40) }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 20px', borderRadius: 15, background: '#111113', border: '1px solid rgba(255,255,255,0.08)', color: '#3a3a40', fontSize: 14.5, cursor: 'pointer', transition: 'all 0.18s ease' }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.15)'; b.style.color = '#71717a' }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.08)'; b.style.color = '#3a3a40' }}
              >
                <ArrowUp size={14} strokeWidth={2} />
                <span>Continuer la conversation\u2026</span>
              </button>
            )}

            {(!collapsed || isActive || loading) && (
              <div style={{
                background: '#111113',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 18,
                boxShadow: isActive ? '0 0 0 3px rgba(99,102,241,0.07), 0 8px 40px rgba(0,0,0,0.65)' : '0 4px 24px rgba(0,0,0,0.5)',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
                overflow: 'hidden',
              }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { setFocused(true); setCollapsed(false) }}
                  onBlur={() => setFocused(false)}
                  placeholder="D\u00e9crivez ce dont vous avez besoin\u2026"
                  rows={1} disabled={loading} autoComplete="off" spellCheck aria-label="Message"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: 15.5, lineHeight: 1.7, color: '#f0f0f2', caretColor: '#6366f1', padding: '16px 18px 0', minHeight: 30, maxHeight: 200, overflowY: 'auto', fontFamily: 'inherit', display: 'block' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px 12px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TBtn title="Joindre un fichier"><Paperclip size={16} strokeWidth={1.9} /></TBtn>
                    <TBtn title="Connexions MCP" onClick={() => setShowTools(true)} accent><Plug size={16} strokeWidth={1.9} /></TBtn>
                    <TBtn title="Microphone"><Mic size={16} strokeWidth={1.9} /></TBtn>
                  </div>
                  <button
                    onClick={loading ? stopStream : () => sendMessage(input)}
                    disabled={!loading && !canSend}
                    title={loading ? 'Arr\u00eater la g\u00e9n\u00e9ration' : 'Envoyer'}
                    style={{
                      width: 36, height: 36, borderRadius: 11, border: 'none', flexShrink: 0,
                      background: loading ? 'rgba(239,68,68,0.1)' : canSend ? '#6366f1' : '#181820',
                      color: loading ? '#ef4444' : canSend ? '#fff' : '#2a2a32',
                      cursor: loading || canSend ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s ease',
                      boxShadow: canSend && !loading ? '0 0 18px rgba(99,102,241,0.5)' : 'none',
                    }}
                    onMouseEnter={e => { if (loading || canSend) (e.currentTarget as HTMLButtonElement).style.opacity = '0.8' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                  >
                    {loading ? <Square size={13} fill="#ef4444" strokeWidth={0} /> : <ArrowUp size={16} strokeWidth={2.5} />}
                  </button>
                </div>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: '#202028', marginTop: 7, letterSpacing: '0.01em' }}>
              OrchestrAI peut commettre des erreurs \u2014 v\u00e9rifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function TBtn({ children, title, onClick, accent }: { children: React.ReactNode; title: string; onClick?: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: accent ? '#6366f1' : '#32323a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.13s, background 0.13s' }}
      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = accent ? '#818cf8' : '#71717a'; b.style.background = 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = accent ? '#6366f1' : '#32323a'; b.style.background = 'transparent' }}
    >{children}</button>
  )
}
