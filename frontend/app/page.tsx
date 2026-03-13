'use client'
import Link from 'next/link'
import {
  MonitorPlay, BarChart2, FileText, PenTool,
  Video, Search, Image as ImageIcon,
  Paperclip, Box, Mic, CornerDownLeft, X, ArrowRight
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const MODES = [
  { label: 'Slides', icon: MonitorPlay },
  { label: 'Data', icon: BarChart2 },
  { label: 'Docs', icon: FileText },
  { label: 'Canvas', icon: PenTool },
  { label: 'Video', icon: Video },
  { label: 'Research', icon: Search },
  { label: 'Image', icon: ImageIcon },
]

function getSlogan(): string {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return 'Orchestrez vos agents. Automatisez l\u2019avenir.'
  if (h >= 12 && h < 18) return 'Vos agents travaillent. Vous dirigez.'
  if (h >= 18 && h < 22) return 'L\u2019orchestration ne dort jamais.'
  return 'Pendant que vous dormez, vos agents agissent.'
}

export default function Home() {
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
        @keyframes ambient-drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1);    opacity: 0.18; }
          50%       { transform: translate(-50%, -52%) scale(1.08); opacity: 0.26; }
        }
        .ambient-glow { animation: ambient-drift 8s ease-in-out infinite; }

        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.06); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg)   translateX(68px) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(68px) rotate(-360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); opacity: 0.7; }
          70%  { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .logo-breathe { animation: logo-breathe 4s ease-in-out infinite; }
        .orbit-dot    { animation: orbit 6s linear infinite; }
        .pulse-ring   { animation: pulse-ring 2.4s ease-out infinite; }
        .pulse-ring-2 { animation: pulse-ring 2.4s ease-out 0.8s infinite; }

        @keyframes slogan-fade-up {
          0%   { opacity: 0; transform: translateY(16px); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        .slogan-reveal { animation: slogan-fade-up 0.85s cubic-bezier(0.22,1,0.36,1) both; }

        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .slogan-cursor {
          display: inline-block;
          width: 3px; height: 0.85em;
          background: white;
          margin-left: 6px;
          vertical-align: middle;
          border-radius: 2px;
          animation: cursor-blink 1.1s step-end infinite;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up { animation: fade-in-up 0.7s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Ambient glow — pointer-events none so it never blocks clicks */}
      <div
        className="ambient-glow fixed top-1/2 left-1/2 pointer-events-none rounded-full -z-10"
        style={{
          width: '65vw', height: '60vh',
          background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(29,78,216,0.10) 40%, transparent 70%)',
          filter: 'blur(72px)',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, boxShadow: '0 0 0 1.5px rgba(99,102,241,0.4), 0 0 12px rgba(99,102,241,0.2)' }}>
            <Image src="/logo.jpg" alt="OrchestrAI" width={36} height={36} className="w-full h-full object-cover" priority />
          </div>
          <span className="font-display font-semibold text-base text-foreground tracking-tight">Orchestrai</span>
        </div>
        <Link href="/login" className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity bg-white/5 border border-white/10 px-5 py-2 rounded-full hover:bg-white/10">
          Commencer
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10" style={{ paddingBottom: '2vh' }}>

        {/* Animated Logo — entire container is pointer-events-none so animations never block UI */}
        <div
          className="relative flex items-center justify-center mb-8 fade-in-up pointer-events-none"
          style={{ width: 140, height: 140 }}
        >
          {/* Pulse rings */}
          <div className="pulse-ring absolute rounded-full" style={{ width: 140, height: 140, border: '1.5px solid rgba(99,102,241,0.5)', top: 0, left: 0 }} />
          <div className="pulse-ring-2 absolute rounded-full" style={{ width: 140, height: 140, border: '1.5px solid rgba(99,102,241,0.35)', top: 0, left: 0 }} />

          {/* Orbit dot — zero-size anchor at center, pointer-events-none */}
          <div className="absolute pointer-events-none" style={{ width: 0, height: 0, top: '50%', left: '50%' }}>
            <div
              className="orbit-dot"
              style={{
                position: 'absolute',
                width: 8, height: 8,
                borderRadius: '50%',
                background: 'rgba(129,140,248,0.9)',
                boxShadow: '0 0 8px 2px rgba(99,102,241,0.7)',
                marginTop: -4, marginLeft: -4,
              }}
            />
          </div>

          {/* Logo image with breathe */}
          <div
            className="logo-breathe relative z-10"
            style={{ width: 108, height: 108, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2.5px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.3)' }}
          >
            <Image src="/logo.jpg" alt="OrchestrAI" width={108} height={108} className="w-full h-full object-cover" priority />
          </div>
        </div>

        {/* Slogan + subtitle */}
        <div className="text-center mb-7 fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3 leading-tight">
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

        {/* Mode chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-7 max-w-3xl fade-in-up" style={{ animationDelay: '0.18s' }}>
          {MODES.map((mode) => (
            <button
              key={mode.label}
              onClick={() => { setInput(mode.label); inputRef.current?.focus() }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/[0.07] bg-[#111111] hover:bg-[#1a1a1a] hover:border-white/[0.15] transition-all duration-200 text-[13px] font-medium text-[#a1a1aa] hover:text-[#fafafa] cursor-pointer"
            >
              <mode.icon size={14} className="text-[#71717a]" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="w-full max-w-[720px] flex flex-col gap-3 fade-in-up" style={{ animationDelay: '0.26s' }}>
          {showBanner && (
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-white/[0.07] bg-[#141414] shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <span className="text-[11px] font-semibold text-blue-300">Ultra</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-foreground">Unlock the full Orchestrai experience</span>
                  <span className="text-[12px] text-[#71717a] mt-0.5">Advanced mode, 100+ Integrations, Triggers, Custom AI Workers &amp; more</span>
                </div>
              </div>
              <button onClick={() => setShowBanner(false)} className="text-[#71717a] hover:text-white transition-colors p-1 ml-3 shrink-0">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Input box */}
          <div
            className="relative w-full rounded-[26px] border transition-all duration-300"
            style={{
              background: '#131313',
              borderColor: inputActive ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.07)',
              boxShadow: inputActive
                ? '0 16px 48px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(99,102,241,0.16)'
                : '0 6px 20px -6px rgba(0,0,0,0.5)',
            }}
          >
            <div className="px-4 pt-4 pb-[60px]">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="D\u00e9crivez votre besoin, lancez un workflow, interrogez un agent\u2026"
                rows={focused || input.length > 0 ? 2 : 1}
                className="w-full bg-transparent text-[15px] text-[#fafafa] outline-none focus:outline-none focus:ring-0 placeholder:text-[#3f3f46] ml-1 caret-white resize-none overflow-hidden leading-relaxed"
                style={{ border: 'none', boxShadow: 'none', minHeight: '26px', maxHeight: '160px' }}
                aria-label="Message"
                autoComplete="off"
              />
            </div>

            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all">
                  <Paperclip size={16} strokeWidth={1.5} />
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all relative">
                  <Box size={16} strokeWidth={1.5} />
                  <div className="absolute top-[5px] right-[5px] w-[11px] h-[11px] bg-white rounded-full flex items-center justify-center">
                    <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 flex items-center justify-center rounded-full text-[#3f3f46] hover:text-[#a1a1aa] hover:bg-white/[0.05] transition-all">
                  <Mic size={16} strokeWidth={1.5} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    background: input.trim() ? '#ffffff' : '#1f1f1f',
                    color: input.trim() ? '#000000' : '#3f3f46',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: input.trim() ? '0 0 16px rgba(255,255,255,0.2)' : 'none',
                  }}
                >
                  <CornerDownLeft size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-[#333] mt-1 font-mono">
            Orchestrai peut commettre des erreurs. V&eacute;rifiez les informations importantes.
          </p>
        </div>
      </main>

      {/* Redirect modal */}
      {showRedirect && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)' }}
          onClick={() => setShowRedirect(false)}
        >
          <div
            className="relative w-full max-w-[400px] mx-4 rounded-[22px] border border-white/[0.09] bg-[#111111] p-8 fade-in-up shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-3 mb-7">
              <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(99,102,241,0.4), 0 0 20px rgba(99,102,241,0.2)' }}>
                <Image src="/logo.jpg" alt="OrchestrAI" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <h2 className="font-display text-[22px] font-semibold text-foreground tracking-tight text-center">
                Lancez vos agents
              </h2>
              <p className="text-[13px] text-[#71717a] text-center leading-relaxed">
                Connectez-vous ou cr&eacute;ez un compte pour orchestrer vos workflows et lancer vos agents IA.
              </p>
            </div>

            <div className="mb-4 px-4 py-3 rounded-[12px] border border-white/[0.06] bg-[#0d0d0d] text-[12px] text-[#52525b] font-mono truncate">
              <span className="text-[#6366f1]">&#x276F;</span> {input}
            </div>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/login"
                className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 transition-colors rounded-[11px] py-3 text-[14px] font-semibold"
              >
                Se connecter <ArrowRight size={15} />
              </Link>
              <Link
                href="/register"
                className="w-full flex items-center justify-center gap-2 bg-[#18181b] border border-white/[0.08] text-foreground hover:bg-[#222] transition-colors rounded-[11px] py-3 text-[14px] font-medium"
              >
                Cr&eacute;er un compte
              </Link>
            </div>

            <button
              onClick={() => setShowRedirect(false)}
              className="mt-5 w-full text-center text-[12px] text-[#3f3f46] hover:text-[#71717a] transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
