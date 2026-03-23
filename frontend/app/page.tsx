'use client'
import Link from 'next/link'
import {
  MonitorPlay, BarChart2, FileText, PenTool,
  Video, Search, Image as ImageIcon,
  Paperclip, Box, Mic, CornerDownLeft, X, ArrowRight
} from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const MODES = [
  { label: 'Slides',   icon: MonitorPlay },
  { label: 'Data',     icon: BarChart2 },
  { label: 'Docs',     icon: FileText },
  { label: 'Canvas',   icon: PenTool },
  { label: 'Video',    icon: Video },
  { label: 'Research', icon: Search },
  { label: 'Image',    icon: ImageIcon },
]

const SLOGANS = [
  { from: 5,  to: 12, text: 'Orchestrez vos agents. Automatisez l\u2019avenir.' },
  { from: 12, to: 18, text: 'Vos agents travaillent. Vous dirigez.' },
  { from: 18, to: 22, text: 'L\u2019orchestration ne dort jamais.' },
  { from: 22, to: 5,  text: 'Pendant que vous dormez, vos agents agissent.' },
]

function getSlogan(): string {
  const h = new Date().getHours()
  for (const s of SLOGANS) {
    if (s.from < s.to) {
      if (h >= s.from && h < s.to) return s.text
    } else {
      if (h >= s.from || h < s.to) return s.text
    }
  }
  return SLOGANS[1].text
}

export default function Home() {
  const router = useRouter()
  const [showBanner, setShowBanner] = useState(true)
  const [slogan, setSlogan] = useState('')
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const [showRedirect, setShowRedirect] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setSlogan(getSlogan()) }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  function handleSend() {
    if (input.trim()) {
      // Persist prompt so it can be pre-filled after login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_prompt', input.trim())
      }
      setShowRedirect(true)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const inputActive = focused || input.length > 0

  // Suppress unused variable warning — router kept for future programmatic navigation
  void router

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden font-sans" style={{ background: 'var(--bg-base)' }}>
      <AmbientBackground accentColor="#6c63ff" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3 cursor-pointer">
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 1.5px rgba(108,99,255,0.45), 0 0 20px rgba(108,99,255,0.2)' }}>
            <Image src="/logo.jpg" alt="OrchestrAI logo" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>OrchestrAI</span>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold transition-all"
          style={{
            padding: '8px 20px', borderRadius: 100,
            background: 'rgba(108,99,255,0.1)',
            border: '1px solid rgba(108,99,255,0.28)',
            color: '#c4bfff',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(108,99,255,0.18)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(108,99,255,0.1)'; }}
        >
          Commencer
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative z-10">
        {/* Hero logo */}
        <div
          className="mb-7 animate-fade-in"
          style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 3px rgba(108,99,255,0.5), 0 0 60px rgba(108,99,255,0.35)' }}
        >
          <Image src="/logo.jpg" alt="OrchestrAI" width={120} height={120} className="w-full h-full object-cover" priority />
        </div>

        {/* Slogan */}
        <div className="text-center mb-8 animate-fade-in px-4">
          <h1 className="font-display text-2xl sm:text-4xl md:text-[52px] font-semibold tracking-tight text-foreground mb-4 leading-tight min-h-[1.2em]">
            {slogan ? (
              <span key={slogan} className="slogan-reveal">
                {slogan}
                <span className="slogan-cursor" aria-hidden="true" />
              </span>
            ) : (
              <span className="opacity-0" aria-hidden="true">placeholder</span>
            )}
          </h1>
          <p className="text-[#a1a1aa] text-[15px] font-normal mt-2">
            Décrivez votre workflow. Vos agents s'en chargent.
          </p>
        </div>

        {/* Mode chips */}
        <div
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 max-w-4xl w-full px-2 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          {MODES.map((mode) => (
            <button
              key={mode.label}
              type="button"
              onClick={() => { setInput(mode.label); inputRef.current?.focus() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '7px 15px', borderRadius: 100,
                border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.022)',
                color: 'var(--text-secondary)',
                fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(108,99,255,0.1)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(108,99,255,0.25)';
                (e.currentTarget as HTMLButtonElement).style.color = '#d4d0ff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.022)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }}
            >
              <mode.icon size={14} aria-hidden="true" style={{ opacity: 0.7 }} />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="w-full max-w-[760px] flex flex-col gap-3 animate-slide-up px-0" style={{ animationDelay: '0.2s' }}>
          {showBanner && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 16, gap: 12,
              background: 'rgba(108,99,255,0.07)',
              border: '1px solid rgba(108,99,255,0.2)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  padding: '3px 10px', borderRadius: 100,
                  background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.35)',
                  fontSize: 10, fontWeight: 700, color: '#a8a2ff', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                }}>PRO</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Accède à toute l'expérience OrchestrAI</span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Mode avancé, 100+ intégrations, agents personnalisés et bien plus.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBanner(false)}
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
                aria-label="Fermer"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Input box */}
          <div
            className="relative w-full rounded-[28px] border transition-all duration-300 bg-[rgba(10,10,12,0.85)] backdrop-blur-[30px]"
            style={{
              borderColor: inputActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              boxShadow: inputActive
                ? '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(99,102,241,0.15)'
                : '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {/* Top subtle border glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-[1px] opacity-20 pointer-events-none rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)' }} />

            <div className="px-5 pt-5 pb-[64px] relative z-10">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Décrivez votre besoin, lancez un workflow, interrogez un agent…"
                rows={focused || input.length > 0 ? 2 : 1}
                className="w-full bg-transparent text-[16px] text-[#fafafa] outline-none focus:outline-none focus:ring-0 placeholder:text-[#52525b] caret-white resize-none overflow-hidden leading-relaxed"
                style={{ border: 'none', boxShadow: 'none', minHeight: '28px', maxHeight: '160px' }}
                aria-label="Describe your workflow or task"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Attach file"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all"
                >
                  <Paperclip size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Tools (locked)"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all relative"
                >
                  <Box size={18} strokeWidth={1.5} aria-hidden="true" />
                  <div className="absolute top-[5px] right-[5px] w-[13px] h-[13px] bg-white rounded-full flex items-center justify-center" aria-hidden="true">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Voice input"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all"
                >
                  <Mic size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: input.trim() ? '#ffffff' : '#1f1f1f',
                    color: input.trim() ? '#000000' : '#3f3f46',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: input.trim() ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <CornerDownLeft size={16} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[12px] text-[#71717a] mt-4">
            Orchestrai peut commettre des erreurs. Vérifiez les informations importantes.
          </p>
        </div>
      </main>

      {/* Redirect modal */}
      {showRedirect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRedirect(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="redirect-title"
        >
          <div
            style={{
              position: 'relative', width: '100%', maxWidth: 420,
              borderRadius: 24, padding: '36px 32px',
              background: 'rgba(10,10,18,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 0 0 1px rgba(108,99,255,0.1), 0 40px 100px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.04)',
              animation: 'oSlideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Top brand line */}
            <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: '50%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(108,99,255,0.6), transparent)',
              boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(108,99,255,0.45), 0 0 28px rgba(108,99,255,0.22)' }}>
                <Image src="/logo.jpg" alt="OrchestrAI" width={72} height={72} className="w-full h-full object-cover" />
              </div>
              <h2 id="redirect-title" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', textAlign: 'center' }}>
                Lancez vos agents
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>
                Connecte-toi ou crée un compte pour orchestrer tes workflows et lancer tes agents IA.
              </p>
            </div>

            {input && (
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.06)',
                background: 'rgba(255,255,255,0.02)',
                fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#6c63ff', marginRight: 6 }}>&#x276F;</span>
                <span>{input}</span>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href="/login"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px 0', borderRadius: 12, fontSize: 14.5, fontWeight: 600,
                  background: 'var(--brand)', color: '#fff',
                  transition: 'opacity 0.15s', textDecoration: 'none',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.88'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
              >
                Se connecter <ArrowRight size={15} aria-hidden="true" />
              </Link>
              <Link
                href="/register"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '13px 0', borderRadius: 12, fontSize: 14.5, fontWeight: 500,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'; }}
              >
                Créer un compte
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setShowRedirect(false)}
              style={{ marginTop: 20, width: '100%', textAlign: 'center', fontSize: 12.5, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
