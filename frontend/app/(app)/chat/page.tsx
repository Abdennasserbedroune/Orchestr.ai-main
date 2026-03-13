'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, CornerDownLeft, Mic, Square, X, Wrench } from 'lucide-react'
import { ChatMessageBubble } from '@/components/ChatMessage'
import type { Message } from '@/components/ChatMessage'
import Image from 'next/image'

// ── Types ───────────────────────────────────────────────────────
const CATEGORIES = [
  'Marketing digital',
  'Ventes & prospection',
  'Support client',
  'Recherche & veille',
  'Analyse de données',
  'Création de contenu',
  'Automatisation métier',
]

// MCP integrations catalog
const MCP_TOOLS = [
  { id: 'github',    name: 'GitHub',    color: '#f0f0f0', bg: '#161b22', desc: 'Code, PRs, issues', icon: 'https://cdn.simpleicons.org/github/f0f0f0' },
  { id: 'notion',    name: 'Notion',    color: '#ffffff', bg: '#1a1a1a', desc: 'Pages & bases de données', icon: 'https://cdn.simpleicons.org/notion/ffffff' },
  { id: 'n8n',       name: 'n8n',       color: '#ea4b71', bg: '#1f0b10', desc: 'Workflows automatisés', icon: 'https://cdn.simpleicons.org/n8n/ea4b71' },
  { id: 'calendly',  name: 'Calendly',  color: '#006bff', bg: '#001533', desc: 'Agenda & rendez-vous', icon: 'https://cdn.simpleicons.org/calendly/006bff' },
  { id: 'slack',     name: 'Slack',     color: '#4a154b', bg: '#1a0d1b', desc: 'Notifications & canaux', icon: 'https://cdn.simpleicons.org/slack/e01e5a' },
  { id: 'airtable',  name: 'Airtable',  color: '#18bfff', bg: '#061820', desc: 'Tables & automatisations', icon: 'https://cdn.simpleicons.org/airtable/18bfff' },
  { id: 'googledrive', name: 'Google Drive', color: '#34a853', bg: '#0a1a0e', desc: 'Fichiers & documents', icon: 'https://cdn.simpleicons.org/googledrive/34a853' },
  { id: 'linear',    name: 'Linear',    color: '#5e6ad2', bg: '#0d0e1a', desc: 'Projets & sprints', icon: 'https://cdn.simpleicons.org/linear/5e6ad2' },
]

function createId() { return Math.random().toString(36).slice(2, 10) }

function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Orchestrez vos agents. Automatisez l’avenir.'
  if (h >= 12 && h < 18) return 'Vos agents travaillent. Vous dirigez.'
  if (h >= 18 && h < 22) return 'L’orchestration ne dort jamais.'
  return 'Pendant que vous dormez, vos agents agissent.'
}

// ── Coming-soon toast ──────────────────────────────────────────────
function Toast({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 100, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 10}px)`,
      opacity: visible ? 1 : 0, transition: 'opacity 0.22s ease, transform 0.22s ease',
      pointerEvents: 'none', zIndex: 9999,
      background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '9px 18px',
      display: 'flex', alignItems: 'center', gap: 9,
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
      <span style={{ fontSize: 13, color: '#a1a1aa' }}>
        <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{label}</span> — Fonctionnalité à venir
      </span>
    </div>
  )
}

// ── MCP Tools modal ─────────────────────────────────────────────────
function ToolsModal({ onClose }: { onClose: () => void }) {
  const [clicked, setClicked] = useState<string | null>(null)
  const [showComing, setShowComing] = useState<string | null>(null)

  function handleTool(id: string) {
    setClicked(id)
    setShowComing(id)
    setTimeout(() => { setClicked(null); setShowComing(null) }, 1800)
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 112px',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#111111', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '20px 20px 16px', width: '100%', maxWidth: 680,
          boxShadow: '0 -8px 48px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.22s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f4f4f5' }}>Connexions MCP</p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#52525b' }}>
              Connectez vos outils préférés — GitHub, Notion, n8n et plus encore.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: 4, borderRadius: 8, display: 'flex', lineHeight: 1 }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#52525b'}>
            <X size={18} />
          </button>
        </div>

        {/* Coming-soon badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 100, marginBottom: 16,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 11, color: '#6366f1', fontFamily: 'monospace', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Bientôt disponible</span>
        </div>

        {/* Tool grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {MCP_TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => handleTool(tool.id)}
              style={{
                background: clicked === tool.id ? `${tool.color}18` : tool.bg,
                border: `1px solid ${clicked === tool.id ? tool.color + '60' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 14, padding: '14px 12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                position: 'relative', overflow: 'hidden',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = tool.color + '50'; (e.currentTarget as HTMLButtonElement).style.background = tool.color + '14' }}
              onMouseLeave={e => { if (clicked !== tool.id) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLButtonElement).style.background = tool.bg } }}
            >
              {/* Icon */}
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tool.icon}
                  alt={tool.name}
                  width={24}
                  height={24}
                  style={{ width: 24, height: 24, objectFit: 'contain' }}
                />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{tool.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#52525b', lineHeight: 1.3 }}>{tool.desc}</p>
              </div>
              {/* Coming-soon overlay */}
              {showComing === tool.id && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 14,
                  background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600, fontFamily: 'monospace' }}>Bientôt ✨</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Disclaimer banner ────────────────────────────────────────────────
function DisclaimerBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
      borderRadius: 12, marginBottom: 28, maxWidth: 560, width: '100%',
      background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
    }}>
      <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0 }}>ℹ️</span>
      <p style={{ margin: 0, fontSize: 13, color: '#71717a', lineHeight: 1.55 }}>
        <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Aucun historique sauvegardé</span>
        {' '}— Vos conversations ne sont pas enregistrées et disparaissent si vous quittez la page.
      </p>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages]     = useState<Message[]>([])
  const [input, setInput]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [focused, setFocused]       = useState(false)
  const [greeting, setGreeting]     = useState('')
  const [greetingDone, setGreetingDone] = useState(false)
  const [toast, setToast]           = useState<{ label: string; visible: boolean }>({ label: '', visible: false })
  const [showTools, setShowTools]   = useState(false)
  const [collapsed, setCollapsed]   = useState(false) // input collapsed after send

  const bottomRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const abortRef    = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const streamingId = useRef<string | null>(null)

  const showToast = useCallback((label: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ label, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  // Greeting typewriter
  useEffect(() => {
    if (messages.length > 0) return
    const full = getGreeting()
    setGreeting(''); setGreetingDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < full.length) { setGreeting(c => c + full.charAt(i)); i++ }
      else { clearInterval(timer); setGreetingDone(true) }
    }, 36)
    return () => clearInterval(timer)
  }, [messages.length])

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current; if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }, [input])

  // Stop streaming
  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    if (streamingId.current) {
      setMessages(prev => prev.map(m =>
        m.id === streamingId.current
          ? { ...m, content: (m.content || '') + '\n\n*⏹ Génération arrêtée.*', streaming: false }
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
      if (!res.ok || !res.body) throw new Error(`Erreur API ${res.status}`)
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
        m.id === aId ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', streaming: false } : m
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
  const CHAT_WIDTH     = 740

  return (
    <>
      {/* Global keyframes — injected once */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(24px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
        @keyframes blink   { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes pulse   { 0%,100% { opacity: 1 } 50% { opacity: .4 } }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#09090b', position: 'relative' }}>

        {/* Ambient glow */}
        <div style={{ position: 'fixed', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: '55vw', height: '55vh', background: 'radial-gradient(circle, rgba(99,102,241,0.055) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

        <Toast label={toast.label} visible={toast.visible} />
        {showTools && <ToolsModal onClose={() => setShowTools(false)} />}

        {/* ── MESSAGES SCROLL AREA ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: CHAT_WIDTH, margin: '0 auto', padding: '40px 20px 20px', display: 'flex', flexDirection: 'column' }}>

            {isFirstMessage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
                {/* Logo */}
                <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', marginBottom: 28, flexShrink: 0, boxShadow: '0 0 0 2.5px rgba(99,102,241,0.45), 0 0 48px rgba(99,102,241,0.2)' }}>
                  <Image src="/logo.jpg" alt="OrchestrAI" width={96} height={96} style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
                </div>
                {/* Greeting */}
                <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 42px)', fontWeight: 700, color: '#f4f4f5', textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.18, marginBottom: 14, minHeight: '1.3em' }}>
                  {greeting}
                  {!greetingDone && <span style={{ display: 'inline-block', width: 3, height: '0.8em', background: '#6366f1', borderRadius: 2, marginLeft: 4, verticalAlign: 'middle', animation: 'blink 0.9s step-end infinite' }} />}
                </h1>
                <p style={{ fontSize: 16, color: '#71717a', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                  Choisissez un domaine ou décrivez votre besoin ci-dessous.
                </p>
                <DisclaimerBanner />
                {/* Category chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 560 }}>
                  {CATEGORIES.map((cat, i) => (
                    <button key={i}
                      onClick={() => { setInput(cat); setCollapsed(false); setTimeout(() => inputRef.current?.focus(), 30) }}
                      style={{ padding: '9px 18px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.09)', background: '#111', color: '#a1a1aa', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.18s ease', outline: 'none' }}
                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#1c1c1c'; b.style.color = '#f4f4f5'; b.style.borderColor = 'rgba(255,255,255,0.18)' }}
                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#111'; b.style.color = '#a1a1aa'; b.style.borderColor = 'rgba(255,255,255,0.09)' }}
                    >{cat}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 12 }}>
                {messages.map(msg => <ChatMessageBubble key={msg.id} message={msg} />)}
              </div>
            )}

            <div ref={bottomRef} style={{ height: 8 }} />
          </div>
        </div>

        {/* ── PINNED INPUT BAR ── */}
        <div style={{ flexShrink: 0, position: 'relative', zIndex: 10, padding: '8px 20px 20px', background: 'linear-gradient(to top, #09090b 75%, transparent)' }}>
          <div style={{ maxWidth: CHAT_WIDTH, margin: '0 auto' }}>

            {/* Collapsed pill */}
            {collapsed && !isActive && (
              <button
                onClick={() => { setCollapsed(false); setTimeout(() => inputRef.current?.focus(), 30) }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '13px 20px', borderRadius: 100,
                  background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#52525b', fontSize: 15, cursor: 'pointer',
                  transition: 'all 0.2s ease', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.22)'; b.style.color = '#a1a1aa' }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = 'rgba(255,255,255,0.1)'; b.style.color = '#52525b' }}
              >
                <CornerDownLeft size={16} strokeWidth={2} />
                <span>Écrire un message…</span>
              </button>
            )}

            {/* Full input box */}
            {(!collapsed || isActive) && (
              <div style={{
                background: '#131313',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 18,
                boxShadow: isActive ? '0 0 0 3px rgba(99,102,241,0.1), 0 16px 48px rgba(0,0,0,0.7)' : '0 4px 24px rgba(0,0,0,0.5)',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                overflow: 'hidden',
              }}>
                {/* Textarea */}
                <div style={{ padding: '14px 16px 6px' }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Décrivez ce dont vous avez besoin…"
                    rows={1}
                    disabled={loading}
                    autoComplete="off"
                    aria-label="Message"
                    style={{
                      width: '100%', background: 'transparent', border: 'none', outline: 'none',
                      resize: 'none', fontSize: 16, lineHeight: 1.65, color: '#f4f4f5',
                      caretColor: '#6366f1', minHeight: 28, maxHeight: 180,
                      overflowY: 'auto', fontFamily: 'inherit',
                    }}
                  />
                </div>

                {/* Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 10px 10px' }}>
                  {/* Left */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ToolbarBtn title="Joindre un fichier" onClick={() => showToast('Joindre un fichier')}>
                      <Paperclip size={18} strokeWidth={1.8} />
                    </ToolbarBtn>
                    <ToolbarBtn title="Outils MCP" onClick={() => setShowTools(true)} active>
                      <Wrench size={18} strokeWidth={1.8} />
                    </ToolbarBtn>
                  </div>
                  {/* Right */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Stop streaming */}
                    {loading && (
                      <button onClick={stopStream}
                        title="Arrêter la génération"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
                          borderRadius: 10, border: '1px solid rgba(239,68,68,0.35)',
                          background: 'rgba(239,68,68,0.08)', color: '#ef4444',
                          fontSize: 13, cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
                      >
                        <Square size={12} fill="#ef4444" strokeWidth={0} />
                        <span>Arrêter</span>
                      </button>
                    )}
                    <ToolbarBtn title="Microphone" onClick={() => showToast('Microphone')}>
                      <Mic size={18} strokeWidth={1.8} />
                    </ToolbarBtn>
                    {/* Send */}
                    <button
                      onClick={() => sendMessage(input)}
                      disabled={loading || !input.trim()}
                      title="Envoyer"
                      style={{
                        width: 38, height: 38, borderRadius: 11, border: 'none',
                        background: input.trim() && !loading ? '#6366f1' : '#1f1f1f',
                        color: input.trim() && !loading ? '#fff' : '#3f3f46',
                        cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s ease', flexShrink: 0,
                        boxShadow: input.trim() && !loading ? '0 0 16px rgba(99,102,241,0.5)' : 'none',
                      }}
                    >
                      <CornerDownLeft size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p style={{ textAlign: 'center', fontSize: 11, color: '#262626', marginTop: 8, fontFamily: 'monospace' }}>
              Orchestrai peut commettre des erreurs. Vérifiez les informations importantes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Reusable toolbar button ──────────────────────────────────────────────
function ToolbarBtn({ children, title, onClick, active }: { children: React.ReactNode; title: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 36, height: 36, borderRadius: 10, border: 'none',
        background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
        color: active ? '#6366f1' : '#3f3f46',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = active ? '#818cf8' : '#71717a'; b.style.background = active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)' }}
      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = active ? '#6366f1' : '#3f3f46'; b.style.background = active ? 'rgba(99,102,241,0.1)' : 'transparent' }}
    >
      {children}
    </button>
  )
}
