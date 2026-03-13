'use client'
import Link from 'next/link'
import {
  MonitorPlay, BarChart2, FileText, PenTool,
  Video, Search, Image as ImageIcon,
  Paperclip, Box, Mic, CornerDownLeft, X, ArrowRight
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const MODES = [
  { label: 'Slides', icon: MonitorPlay },
  { label: 'Data', icon: BarChart2 },
  { label: 'Docs', icon: FileText },
  { label: 'Canvas', icon: PenTool },
  { label: 'Video', icon: Video },
  { label: 'Research', icon: Search },
  { label: 'Image', icon: ImageIcon },
]

const SLOGANS = [
  { from: 5,  to: 12, text: "Orchestrez vos agents. Automatisez l\u2019avenir." },
  { from: 12, to: 18, text: "Vos agents travaillent. Vous dirigez." },
  { from: 18, to: 22, text: "L\u2019orchestration ne dort jamais." },
  { from: 22, to: 5,  text: "Pendant que vous dormez, vos agents agissent." },
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

  useEffect(() => {
    setSlogan(getSlogan())
  }, [])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  function handleSend() {
    if (input.trim()) setShowRedirect(true)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const inputActive = focused || input.length > 0

  return (
    <div className="relative min-h-screen flex flex-col bg-bg overflow-hidden font-sans">
      <style>{`
        @keyframes slogan-fade-up {
          0%   { opacity: 0; transform: translateY(18px) scale(0.98); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0)   scale(1);    filter: blur(0); }
        }
        .slogan-reveal {
          animation: slogan-fade-up 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .slogan-cursor {
          display: inline-block;
          width: 3px;
          height: 0.85em;
          background: white;
          margin-left: 4px;
          vertical-align: middle;
          border-radius: 1px;
          animation: cursor-blink 1s step-end infinite;
        }
      `}</style>

      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] pointer-events-none rounded-full opacity-20 -z-10"
        style={{ background: 'radial-gradient(circle, rgba(29,78,216,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3 cursor-pointer">
          <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 1.5px rgba(99,102,241,0.4), 0 0 16px rgba(99,102,241,0.2)' }}>
            <Image src="/logo.jpg" alt="OrchestrAI" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          <span className="font-display font-medium text-lg text-foreground tracking-tight">Orchestrai</span>
        </div>
        <Link href="/login" className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity bg-white/5 border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/10">
          Commencer
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div
          className="mb-7 animate-fade-in"
          style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2.5px rgba(99,102,241,0.45), 0 0 48px rgba(99,102,241,0.28)' }}
        >
          <Image src="/logo.jpg" alt="OrchestrAI" width={120} height={120} className="w-full h-full object-cover" priority />
        </div>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="font-display text-4xl md:text-[52px] font-semibold tracking-tight text-foreground mb-4 leading-tight min-h-[1.2em]">
            {slogan ? (
              <span key={slogan} className="slogan-reveal">
                {slogan}
                <span className="slogan-cursor" />
              </span>
            ) : (
              <span className="opacity-0">placeholder</span>
            )}
          </h1>
          <p className="text-[#71717a] text-[15px] font-normal">
            D&eacute;crivez votre workflow. Vos agents s&apos;en chargent.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-8 max-w-4xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {MODES.map((mode) => (
            <button key={mode.label}
              onClick={() => { setInput(mode.label); inputRef.current?.focus() }}
              className="flex items-center gap-2 px-4 py-2 rounded-[14px] border border-white/[0.07] bg-[#111111] hover:bg-[#1a1a1a] hover:border-white/[0.14] transition-all duration-200 text-[14px] font-medium text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer"
            >
              <mode.icon size={15} className="text-[#71717a]" />
              {mode.label}
            </button>
          ))}
        </div>

        <div className="w-full max-w-[760px] flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {showBanner && (
            <div className="relative flex items-center justify-between px-4 py-3 rounded-[20px] border border-white/[0.08] bg-[#141414] shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <span className="text-[11px] font-semibold text-blue-300">Ultra</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium text-foreground">Unlock the full Orchestrai experience</span>
                  <span className="text-[13px] text-[#a1a1aa] mt-0.5">Advanced mode, 100+ Integrations, Triggers, Custom AI Workers &amp; more</span>
                </div>
              </div>
              <button onClick={() => setShowBanner(false)} className="text-[#a1a1aa] hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Input box */}
          <div
            className="relative w-full rounded-[28px] border transition-all duration-300"
            style={{
              background: '#131313',
              borderColor: inputActive ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
              boxShadow: inputActive ? '0 20px 56px -12px rgba(0,0,0,0.9), 0 0 0 1px rgba(29,78,216,0.14)' : '0 8px 24px -8px rgba(0,0,0,0.6)',
            }}
          >
            <div className="px-4 pt-4 pb-[64px]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="D\u00e9crivez votre besoin, lancez un workflow, interrogez un agent\u2026"
                rows={focused || input.length > 0 ? 2 : 1}
                className="w-full bg-transparent text-[16px] text-[#fafafa] outline-none focus:outline-none focus:ring-0 placeholder:text-[#3f3f46] ml-1 caret-white resize-none overflow-hidden leading-relaxed"
                style={{ border: 'none', boxShadow: 'none', minHeight: '28px', maxHeight: '160px' }}
                aria-label="Message"
                autoComplete="off"
              />
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all"><Paperclip size={18} strokeWidth={1.5} /></button>
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all relative">
                  <Box size={18} strokeWidth={1.5} />
                  <div className="absolute top-[5px] right-[5px] w-[13px] h-[13px] bg-white rounded-full flex items-center justify-center">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-9 h-9 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all"><Mic size={18} strokeWidth={1.5} /></button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: input.trim() ? '#ffffff' : '#1f1f1f',
                    color: input.trim() ? '#000000' : '#3f3f46',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: input.trim() ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <CornerDownLeft size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#2a2a2a] mt-3 font-mono">
            Orchestrai peut commettre des erreurs. V&eacute;rifiez les informations importantes.
          </p>
        </div>
      </main>

      {/* Redirect modal */}
      {showRedirect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRedirect(false)}
        >
          <div
            className="relative w-full max-w-[420px] mx-4 rounded-[24px] border border-white/[0.1] bg-[#111111] p-10 animate-slide-up shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 mb-8">
              <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(99,102,241,0.4), 0 0 24px rgba(99,102,241,0.2)' }}>
                <Image src="/logo.jpg" alt="OrchestrAI" width={72} height={72} className="w-full h-full object-cover" />
              </div>
              <h2 className="font-display text-[24px] font-semibold text-foreground tracking-tight text-center">
                Lancez vos agents
              </h2>
              <p className="text-[14px] text-[#71717a] text-center leading-relaxed">
                Connectez-vous ou cr&eacute;ez un compte pour orchestrer vos workflows et lancer vos agents IA.
              </p>
            </div>

            <div className="mb-4 px-4 py-3 rounded-[14px] border border-white/[0.06] bg-[#0d0d0d] text-[13px] text-[#52525b] font-mono truncate">
              <span className="text-[#6366f1]">&#x276F;</span> {input}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 transition-colors rounded-[12px] py-3 text-[15px] font-semibold"
              >
                Se connecter <ArrowRight size={16} />
              </Link>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 bg-[#18181b] border border-white/[0.08] text-foreground hover:bg-[#222] transition-colors rounded-[12px] py-3 text-[15px] font-medium"
              >
                Cr&eacute;er un compte
              </Link>
            </div>

            <button
              onClick={() => setShowRedirect(false)}
              className="mt-6 w-full text-center text-[13px] text-[#3f3f46] hover:text-[#71717a] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
