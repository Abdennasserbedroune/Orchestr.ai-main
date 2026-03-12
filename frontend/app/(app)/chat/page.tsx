'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { Paperclip, Box, Mic, CornerDownLeft } from 'lucide-react'
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

// ── Small toast for "coming soon" features ──────────────────────
function ComingSoonToast({ label, visible }: { label: string; visible: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? 0 : 12}px)`,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: 'none',
        zIndex: 9999,
        background: '#1a1a1a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: '#6366f1',
        flexShrink: 0, boxShadow: '0 0 8px rgba(99,102,241,0.8)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }} />
      <span style={{ fontSize: 13, color: '#a1a1aa', fontFamily: 'inherit' }}>
        <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{label}</span>
        {' '}— Fonctionnalité à venir
      </span>
    </div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [greetings, setGreetings] = useState('')
  const [greetingDone, setGreetingDone] = useState(false)
  const [toast, setToast] = useState<{ label: string; visible: boolean }>({ label: '', visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)

  // Show a 2-second "coming soon" toast
  const showToast = useCallback((label: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ label, visible: true })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2200)
  }, [])

  useEffect(() => {
    if (messages.length === 0) {
      const fullText = getGreeting()
      setGreetings(''); setGreetingDone(false)
      let i = 0
      const timer = setInterval(() => {
        if (i < fullText.length) { setGreetings(cur => cur + fullText.charAt(i)); i++ }
        else { clearInterval(timer); setGreetingDone(true) }
      }, 38)
      return () => clearInterval(timer)
    }
  }, [messages.length])

  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return
    const userMsg: Message = { id: createId(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
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
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + chunk } : m))
      }
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: 'Une erreur est survenue. Veuillez réessayer.', streaming: false } : m
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
  const inputActive = focused || input.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] md:h-screen max-h-[calc(100vh-56px)] md:max-h-screen items-center relative overflow-hidden">

      {/* Ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] pointer-events-none z-0 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle,rgba(29,78,216,0.15) 0%,transparent 70%)', filter: 'blur(80px)' }} />

      {/* Coming soon toast */}
      <ComingSoonToast label={toast.label} visible={toast.visible} />

      {/* Messages area */}
      <div className="flex-1 w-full overflow-y-auto px-4 md:px-8 mt-12 z-10 flex flex-col items-center">
        <div className="w-full max-w-4xl py-8 flex flex-col gap-6 items-center">
          {isFirstMessage ? (
            <div className="flex flex-col items-center mt-6 w-full animate-fade-in text-center">
              <div className="mb-7" style={{ width:120, height:120, borderRadius:'50%', overflow:'hidden', flexShrink:0,
                boxShadow:'0 0 0 2.5px rgba(99,102,241,0.45),0 0 48px rgba(99,102,241,0.28)' }}>
                <Image src="/logo.jpg" alt="OrchestrAI" width={120} height={120} className="w-full h-full object-cover" priority />
              </div>
              <h1 className="font-display text-4xl md:text-[52px] font-semibold tracking-tight text-foreground mb-4 leading-tight min-h-[1.2em]">
                {greetings}
                {!greetingDone && <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />}
              </h1>
              <p className="text-[#71717a] text-[15px] font-normal mb-10">
                Choisissez un domaine pour commencer ou décrivez votre besoin directement.
              </p>
              <div className="flex flex-wrap justify-center gap-2 w-full max-w-3xl mb-8">
                {CATEGORIES.map((cat, i) => (
                  <button key={i} onClick={() => { setInput(cat); inputRef.current?.focus() }}
                    className="flex items-center gap-2 px-4 py-2 rounded-[14px] border border-white/[0.07] bg-[#111111] hover:bg-[#1a1a1a] hover:border-white/[0.14] transition-all duration-200 text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer">
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-[760px] flex flex-col gap-6">
              {messages.map(msg => <ChatMessageBubble key={msg.id} message={msg} />)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="w-full px-4 md:px-8 py-6 z-10 flex justify-center pb-10">
        <div className="w-full transition-all duration-300 ease-out" style={{ maxWidth: inputActive ? '860px' : '700px' }}>
          <div className="relative w-full rounded-[28px] border transition-all duration-300"
            style={{
              background: '#131313',
              borderColor: inputActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
              boxShadow: inputActive ? '0 20px 56px -12px rgba(0,0,0,0.9),0 0 0 1px rgba(29,78,216,0.14)' : '0 8px 24px -8px rgba(0,0,0,0.6)',
            }}>
            <div className="px-4 pt-4 pb-[64px]">
              <textarea ref={inputRef} value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Décrivez ce dont vous avez besoin…"
                rows={focused || input.length > 0 ? 2 : 1}
                className="w-full bg-transparent text-[16px] text-[#fafafa] outline-none focus:outline-none focus:ring-0 placeholder:text-[#3f3f46] ml-1 caret-white resize-none overflow-hidden leading-relaxed"
                style={{ border: 'none', boxShadow: 'none', minHeight: '28px', maxHeight: '160px' }}
                aria-label="Message" disabled={loading} autoComplete="off"
              />
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Attach — coming soon */}
                <button
                  onClick={() => showToast('Joindre un fichier')}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                  style={{ color: '#3f3f46' }}
                  title="Joindre un fichier"
                >
                  <Paperclip size={18} strokeWidth={1.5} />
                </button>
                {/* Tools — coming soon */}
                <button
                  onClick={() => showToast('Outils')}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all relative"
                  style={{ color: '#3f3f46' }}
                  title="Outils"
                >
                  <Box size={18} strokeWidth={1.5} />
                  <div className="absolute top-[5px] right-[5px] w-[13px] h-[13px] bg-white rounded-full flex items-center justify-center">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                {/* Mic — coming soon */}
                <button
                  onClick={() => showToast('Microphone')}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
                  style={{ color: '#3f3f46' }}
                  title="Microphone"
                >
                  <Mic size={18} strokeWidth={1.5} />
                </button>
                {/* Send */}
                <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: input.trim() && !loading ? '#ffffff' : '#1f1f1f',
                    color: input.trim() && !loading ? '#000000' : '#3f3f46',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    boxShadow: input.trim() && !loading ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                  }} title="Envoyer">
                  <CornerDownLeft size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-[#2a2a2a] mt-3 font-mono">
            Orchestrai peut commettre des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </div>
    </div>
  )
}
