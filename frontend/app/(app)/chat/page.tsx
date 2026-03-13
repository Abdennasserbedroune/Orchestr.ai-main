'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, Box, Mic, CornerDownLeft, Info } from 'lucide-react'
import { ChatMessageBubble } from '@/components/ChatMessage'
import type { Message } from '@/components/ChatMessage'
import Image from 'next/image'

const CATEGORIES = [
  'Marketing digital',
  'Ventes & prospection',
  'Support client',
  'Recherche & veille',
  'Analyse de données',
  'Création de contenu',
  'Automatisation métier',
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
function ComingSoonToast({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 110, left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 10}px)`,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.22s ease, transform 0.22s ease',
      pointerEvents: 'none', zIndex: 9999,
      background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 14, padding: '9px 18px',
      display: 'flex', alignItems: 'center', gap: 9,
      boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0, boxShadow: '0 0 8px rgba(99,102,241,0.8)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <span style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'inherit' }}>
        <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{label}</span>
        {' '}— Fonctionnalité à venir
      </span>
    </div>
  )
}

// ── No-history disclaimer banner ───────────────────────────────────
function DisclaimerBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 16px', borderRadius: 12, marginBottom: 32,
      background: 'rgba(99,102,241,0.07)',
      border: '1px solid rgba(99,102,241,0.2)',
      maxWidth: 640, width: '100%',
    }}>
      <Info size={15} style={{ color: '#6366f1', flexShrink: 0 }} strokeWidth={2} />
      <span style={{ fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
        <span style={{ color: '#a1a1aa', fontWeight: 500 }}>Aucun historique sauvegardé</span>
        {' '}— Vos conversations ne sont pas enregistrées et seront perdues si vous quittez ou rechargez la page.
      </span>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages]   = useState<Message[]>([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [focused, setFocused]     = useState(false)
  const [greeting, setGreeting]   = useState('')
  const [greetingDone, setGreetingDone] = useState(false)
  const [toast, setToast]         = useState<{ label: string; visible: boolean }>({ label: '', visible: false })
  const [inputExpanded, setInputExpanded] = useState(true)

  const bottomRef    = useRef<HTMLDivElement>(null)
  const inputRef     = useRef<HTMLTextAreaElement>(null)
  const abortRef     = useRef<AbortController | null>(null)
  const messagesRef  = useRef(messages)
  const toastTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((label: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ label, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  // Greeting typewriter
  useEffect(() => {
    if (messages.length > 0) return
    const fullText = getGreeting()
    setGreeting(''); setGreetingDone(false)
    let i = 0
    const timer = setInterval(() => {
      if (i < fullText.length) { setGreeting(cur => cur + fullText.charAt(i)); i++ }
      else { clearInterval(timer); setGreetingDone(true) }
    }, 36)
    return () => clearInterval(timer)
  }, [messages.length])

  useEffect(() => { messagesRef.current = messages }, [messages])

  // Smooth scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [input])

  // Collapse input bar after message is sent, expand on focus
  useEffect(() => {
    if (loading) setInputExpanded(false)
  }, [loading])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: Message = { id: createId(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setInputExpanded(false)
    const assistantId = createId()
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '', streaming: true }])
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
        setMessages(prev => prev.map(m =>
          m.id === assistantId ? { ...m, content: m.content + chunk } : m
        ))
      }
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, streaming: false } : m
      ))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', streaming: false }
          : m
      ))
    } finally {
      setLoading(false)
      abortRef.current = null
      inputRef.current?.focus()
    }
  }, [loading])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  const isFirstMessage = messages.length === 0
  const isInputActive  = focused || input.length > 0
  // Input bar is tall (expanded) only when empty + on welcome screen, or user explicitly focused it
  const showExpandedInput = isInputActive || (isFirstMessage && !loading)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', overflow: 'hidden', position: 'relative', background: 'var(--color-bg, #0a0a0a)' }}>

      {/* Ambient glow — subtle, centred */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw', height: '60vh',
        background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <ComingSoonToast label={toast.label} visible={toast.visible} />

      {/* ── Messages area ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 24px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {isFirstMessage ? (
            /* ── Welcome screen ── */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32, paddingBottom: 24 }}>

              {/* Logo + title in the same vertical axis, centred */}
              <div style={{
                width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, marginBottom: 24,
                boxShadow: '0 0 0 2.5px rgba(99,102,241,0.45), 0 0 48px rgba(99,102,241,0.22)',
              }}>
                <Image src="/logo.jpg" alt="OrchestrAI" width={88} height={88}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} priority />
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700,
                color: '#f4f4f5', textAlign: 'center',
                letterSpacing: '-0.03em', lineHeight: 1.15,
                marginBottom: 14, minHeight: '1.3em',
              }}>
                {greeting}
                {!greetingDone && (
                  <span style={{ display: 'inline-block', width: 3, height: '0.8em', background: '#6366f1', borderRadius: 2, marginLeft: 4, verticalAlign: 'middle', animation: 'blink 0.9s step-end infinite' }} />
                )}
              </h1>

              <p style={{ fontSize: 15, color: '#71717a', textAlign: 'center', marginBottom: 12, lineHeight: 1.6 }}>
                Choisissez un domaine ou décrivez votre besoin ci-dessous.
              </p>

              <DisclaimerBanner />

              {/* Category chips — centred, wrapped */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, maxWidth: 620 }}>
                {CATEGORIES.map((cat, i) => (
                  <button key={i}
                    onClick={() => { setInput(cat); setInputExpanded(true); inputRef.current?.focus() }}
                    style={{
                      padding: '8px 16px', borderRadius: 100,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: '#111111',
                      color: '#a1a1aa', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', transition: 'all 0.18s ease',
                      outline: 'none',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'; (e.currentTarget as HTMLButtonElement).style.color = '#f4f4f5'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#111111'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Conversation ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: 16 }}>
              {messages.map(msg => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}

          <div ref={bottomRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* ── Input bar ────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '12px 24px 20px',
        background: 'linear-gradient(to top, #0a0a0a 70%, transparent)',
      }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>

          {/* Collapsed pill — shown after message sent, tap to expand */}
          {!showExpandedInput && (
            <button
              onClick={() => { setInputExpanded(true); setFocused(true); setTimeout(() => inputRef.current?.focus(), 50) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, padding: '12px 20px', borderRadius: 100,
                background: '#141414', border: '1px solid rgba(255,255,255,0.1)',
                color: '#52525b', fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLButtonElement).style.color = '#a1a1aa' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLButtonElement).style.color = '#52525b' }}
            >
              <CornerDownLeft size={15} strokeWidth={2} />
              <span>Écrire un message…</span>
            </button>
          )}

          {/* Full input box */}
          {showExpandedInput && (
            <div style={{
              background: '#131313',
              border: `1px solid ${isInputActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 20,
              boxShadow: isInputActive
                ? '0 0 0 3px rgba(99,102,241,0.1), 0 20px 48px rgba(0,0,0,0.7)'
                : '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              overflow: 'hidden',
            }}>
              {/* Textarea */}
              <div style={{ padding: '14px 16px 8px' }}>
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
                    width: '100%', background: 'transparent',
                    border: 'none', outline: 'none', resize: 'none',
                    fontSize: 15, lineHeight: 1.6,
                    color: '#f4f4f5',
                    caretColor: '#6366f1',
                    minHeight: 28, maxHeight: 160,
                    overflowY: 'auto',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Toolbar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px' }}>
                {/* Left — coming-soon buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <button onClick={() => showToast('Joindre un fichier')}
                    title="Joindre un fichier"
                    style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', color: '#3f3f46', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <Paperclip size={17} strokeWidth={1.8} />
                  </button>
                  <button onClick={() => showToast('Outils')}
                    title="Outils"
                    style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', color: '#3f3f46', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <Box size={17} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Right — mic + send */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => showToast('Microphone')}
                    title="Microphone"
                    style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: 'transparent', color: '#3f3f46', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#71717a'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#3f3f46'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                  >
                    <Mic size={17} strokeWidth={1.8} />
                  </button>

                  <button
                    onClick={() => sendMessage(input)}
                    disabled={loading || !input.trim()}
                    title="Envoyer"
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: 'none',
                      background: input.trim() && !loading ? '#6366f1' : '#1f1f1f',
                      color: input.trim() && !loading ? '#ffffff' : '#3f3f46',
                      cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: input.trim() && !loading ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                      flexShrink: 0,
                    }}
                  >
                    <CornerDownLeft size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disclaimer footer */}
          <p style={{ textAlign: 'center', fontSize: 11, color: '#2a2a2a', marginTop: 10, fontFamily: 'monospace', letterSpacing: '0.02em' }}>
            Orchestrai peut commettre des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  )
}
