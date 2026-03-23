'use client'
import Link from 'next/link'
import {
  MonitorPlay, BarChart2, FileText, PenTool,
  Video, Search, Image as ImageIcon,
  Paperclip, Mic, CornerDownLeft, X, ArrowRight, Sparkles
} from 'lucide-react'
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
  { from: 5,  to: 12, text: 'Orchestrez vos agents. Automatisez l’avenir.' },
  { from: 12, to: 18, text: 'Vos agents travaillent. Vous dirigez.' },
  { from: 18, to: 22, text: 'L’orchestration ne dort jamais.' },
  { from: 22, to: 5,  text: 'Pendant que vous dormez, vos agents agissent.' },
]

function getSlogan(): string {
  const h = new Date().getHours()
  for (const s of SLOGANS) {
    if (s.from < s.to) { if (h >= s.from && h < s.to) return s.text }
    else { if (h >= s.from || h < s.to) return s.text }
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
      if (typeof window !== 'undefined') sessionStorage.setItem('pending_prompt', input.trim())
      setShowRedirect(true)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] relative overflow-hidden font-sans">
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-radial from-[var(--brand-dim)] to-transparent opacity-40 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: 'radial-gradient(var(--brand) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-5 glass border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-white/10 shadow-[0_0_15px_var(--brand-dim)] group-hover:scale-105 transition-transform">
            <Image src="/logo.jpg" alt="OrchestrAI" width={32} height={32} className="object-cover" priority />
          </div>
          <span className="font-display font-bold text-base tracking-tight text-white">OrchestrAI</span>
        </div>
        <Link href="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.04] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.08] hover:border-[var(--border-default)] transition-all">
          Commencer <ArrowRight size={14} />
        </Link>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative z-10 max-w-5xl mx-auto w-full">
        
        {/* Hero Section */}
        <div className="animate-float mb-10 relative">
          <div className="w-24 h-24 rounded-[32px] overflow-hidden ring-2 ring-[var(--brand)]/30 shadow-[0_0_50px_var(--brand-dim)]">
            <Image src="/logo.jpg" alt="OrchestrAI" width={96} height={96} className="object-cover" priority />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[var(--bg-surface)] p-2 rounded-full border border-[var(--border-subtle)] shadow-xl">
            <Sparkles size={16} className="text-[var(--brand)]" />
          </div>
        </div>

        <div className="text-center mb-12 space-y-4 max-w-3xl">
          <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] animate-slogan">
            {slogan || "Orchestrez vos agents."}
          </h1>
          <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-xl mx-auto font-medium">
            Décris ton workflow. Tes agents s&apos;en chargent.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {MODES.map((mode) => (
            <button
              key={mode.label}
              type="button"
              onClick={() => { setInput(mode.label); inputRef.current?.focus() }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06] hover:border-[var(--border-default)] transition-all shadow-sm"
            >
              <mode.icon size={13} className="opacity-60" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Search / Command Interface */}
        <div className="w-full max-w-2xl group">
          {showBanner && (
            <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-[var(--brand)]/5 border border-[var(--brand)]/10 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--brand)] text-[10px] font-bold text-white tracking-widest">
                  ULTRA
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  <b className="text-[var(--text-primary)]">Mode avancé</b> — 100+ intégrations et agents personnalisés.
                </span>
              </div>
              <button onClick={() => setShowBanner(false)} className="text-[var(--text-muted)] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>
          )}

          <div className={`relative w-full rounded-2xl bg-[var(--bg-surface)] border transition-all duration-300 shadow-2xl ${focused ? 'border-[var(--brand)]/50 ring-4 ring-[var(--brand)]/5' : 'border-[var(--border-default)]'}`}>
            <div className="p-5 pb-14">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Décris ton besoin, lance un workflow…"
                className="w-full bg-transparent text-lg text-[var(--text-primary)] outline-none border-none resize-none min-h-[40px] max-h-40 leading-relaxed placeholder:text-[var(--text-muted)]"
                autoComplete="off" spellCheck={false}
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between border-t border-[var(--border-subtle)] bg-white/[0.01]">
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all">
                  <Paperclip size={16} />
                </button>
                <button className="p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/5 transition-all">
                  <Mic size={16} />
                </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`p-2.5 rounded-xl transition-all ${input.trim() ? 'bg-[var(--brand)] text-white shadow-lg shadow-[var(--brand)]/40 hover:scale-105 active:scale-95' : 'bg-white/5 text-[var(--text-muted)]'}`}
              >
                <CornerDownLeft size={18} />
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] font-mono text-[var(--text-muted)] tracking-tight">
            Orchestrai peut commettre des erreurs. Vérifie les informations importantes.
          </p>
        </div>
      </main>

      {/* Redirect Modal */}
      {showRedirect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setShowRedirect(false)}>
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-3xl p-8 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-[var(--brand)]/30">
                <Image src="/logo.jpg" alt="OrchestrAI" width={64} height={64} className="object-cover" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-white">Lance tes agents</h2>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Connecte-toi pour orchestrer tes workflows et lancer tes agents IA.
                </p>
              </div>
            </div>

            {input && (
              <div className="mb-6 p-3 rounded-xl bg-white/[0.02] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-muted)] truncate">
                <span className="text-[var(--brand)] mr-2">›</span> {input}
              </div>
            )}

            <div className="space-y-3">
              <Link href="/login" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all">
                Se connecter <ArrowRight size={16} />
              </Link>
              <Link href="/register" className="flex items-center justify-center w-full py-3.5 rounded-xl bg-white/5 border border-[var(--border-subtle)] text-white font-semibold hover:bg-white/10 transition-all">
                Créer un compte
              </Link>
            </div>

            <button onClick={() => setShowRedirect(false)} className="w-full mt-6 text-xs font-medium text-[var(--text-muted)] hover:text-white transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  )
}
