// Bug 13 fix: useSearchParams wrapped in Suspense via inner component pattern
'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// ── Right panel ──────────────────────────────────────────────────────
function AgentPanel() {
  const agents = [
    { id: 'orchestr', label: 'OrchestrAI', role: 'Orchestrator', color: '#6366f1', x: 50, y: 18 },
    { id: 'claude',   label: 'Claude',      role: 'Reasoning',   color: '#a78bfa', x: 20, y: 48 },
    { id: 'n8n',      label: 'n8n',         role: 'Automation',  color: '#fb923c', x: 50, y: 78 },
    { id: 'openclaw', label: 'OpenClaw',    role: 'Scraping',    color: '#34d399', x: 80, y: 48 },
  ]
  const connections = [
    { from: agents[0], to: agents[1] },
    { from: agents[0], to: agents[2] },
    { from: agents[0], to: agents[3] },
    { from: agents[1], to: agents[2] },
    { from: agents[3], to: agents[2] },
  ]
  const logLines = [
    { t: '00:00:01', agent: 'OrchestrAI', msg: 'Initializing agent runtime…',    color: '#6366f1' },
    { t: '00:00:02', agent: 'Claude',     msg: 'Loading reasoning model v3…',    color: '#a78bfa' },
    { t: '00:00:03', agent: 'OpenClaw',   msg: 'Connecting scraping engine…',     color: '#34d399' },
    { t: '00:00:04', agent: 'n8n',        msg: 'Registering workflow triggers…', color: '#fb923c' },
    { t: '00:00:05', agent: 'OrchestrAI', msg: 'Awaiting new user…',             color: '#6366f1' },
    { t: '00:00:06', agent: 'OrchestrAI', msg: 'Account slot reserved ✓',        color: '#6366f1' },
  ]
  const pills = [
    { label: 'Claude',     status: 'Standby', color: '#a78bfa', pulse: false },
    { label: 'n8n',        status: 'Standby', color: '#fb923c', pulse: false },
    { label: 'OpenClaw',   status: 'Standby', color: '#34d399', pulse: false },
    { label: 'OrchestrAI', status: 'Waiting', color: '#6366f1', pulse: true  },
  ]

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center px-10 py-12 overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d18 50%, #0a0a0f 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 mb-6">
        <p className="font-mono text-[11px] text-[#3f3f46] uppercase tracking-[0.2em] mb-1">Agent Boot Sequence</p>
        <p className="text-[13px] text-[#52525b]">Vos agents se préparent à vous accueillir.</p>
      </div>

      <div className="relative z-10 mb-8">
        <svg viewBox="0 0 100 100" className="w-full" style={{ height: '240px' }}>
          {connections.map((c, i) => (
            <line key={i} x1={c.from.x} y1={c.from.y} x2={c.to.x} y2={c.to.y}
              stroke="rgba(99,102,241,0.18)" strokeWidth="0.5" strokeDasharray="2 2" />
          ))}
          {connections.map((c, i) => (
            <circle key={`p${i}`} r="0.8" fill="#6366f1" opacity="0.7">
              <animateMotion dur={`${1.8 + i * 0.4}s`} repeatCount="indefinite"
                path={`M ${c.from.x} ${c.from.y} L ${c.to.x} ${c.to.y}`} />
            </circle>
          ))}
          {agents.map((a) => (
            <g key={a.id}>
              <circle cx={a.x} cy={a.y} r="5.5" fill="none" stroke={a.color} strokeWidth="0.4" opacity="0.3">
                <animate attributeName="r" values="5.5;7;5.5" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={a.x} cy={a.y} r="4.5" fill={`${a.color}18`} stroke={a.color} strokeWidth="0.6" />
              <circle cx={a.x} cy={a.y} r="1.5" fill={a.color} />
              <text x={a.x} y={a.y + 8} textAnchor="middle" fill="#e4e4e7" fontSize="3.2" fontFamily="monospace" fontWeight="600">{a.label}</text>
              <text x={a.x} y={a.y + 11.5} textAnchor="middle" fill="#52525b" fontSize="2.5" fontFamily="monospace">{a.role}</text>
            </g>
          ))}
        </svg>
      </div>

      <div className="relative z-10 rounded-[16px] border border-white/[0.06] overflow-hidden"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[10px] text-[#3f3f46] ml-2">orchestrai — boot-sequence</span>
          <span className="ml-auto flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            <span className="font-mono text-[9px] text-[#34d399]">LIVE</span>
          </span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-1.5">
          {logLines.map((l, i) => (
            <div key={i} className="flex items-start gap-2 font-mono text-[11px]">
              <span className="text-[#3f3f46] flex-shrink-0">{l.t}</span>
              <span className="flex-shrink-0 font-semibold" style={{ color: l.color }}>[{l.agent}]</span>
              <span className="text-[#71717a]">{l.msg}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex flex-wrap gap-2 mt-5">
        {pills.map((a) => (
          <div key={a.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: `${a.color}10`, borderColor: `${a.color}30` }}>
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${a.pulse ? 'animate-pulse' : ''}`}
              style={{ background: a.color }} />
            <span className="font-mono text-[11px] font-medium" style={{ color: a.color }}>{a.label}</span>
            <span className="font-mono text-[10px] text-[#52525b]">{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    })
    if (authError) { setError(authError.message); setLoading(false); return }
    router.push('/chat')
  }

  const passwordStrength = (() => {
    if (password.length === 0) return null
    if (password.length < 8) return 'weak'
    if (password.length < 12) return 'fair'
    return 'strong'
  })()
  const strengthColor: Record<string, string> = { weak: '#EF4444', fair: '#F59E0B', strong: '#22C55E' }
  const strengthLabel: Record<string, string> = { weak: 'faible', fair: 'moyen', strong: 'fort' }

  return (
    <div className="min-h-screen flex bg-bg overflow-hidden font-sans">

      {/* LEFT — Registration form */}
      <div className="flex flex-col justify-center w-full max-w-[480px] flex-shrink-0 px-12 py-16 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col gap-3 mb-8 relative">
          <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 0 0 2px rgba(99,102,241,0.4), 0 0 28px rgba(99,102,241,0.22)' }}>
            <Image src="/logo.jpg" alt="OrchestrAI" width={72} height={72} className="w-full h-full object-cover" priority />
          </div>
          <h1 className="font-display text-[30px] font-semibold text-foreground tracking-tight mt-2">
            Créer un compte
          </h1>
          <p className="text-[15px] text-[#71717a]">
            Rejoignez Orchestrai et lancez vos premiers agents.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-[12px] px-4 py-3 mb-6 text-[14px] bg-red-500/10 border border-red-500/20 text-red-400 relative" role="alert">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#e4e4e7]" htmlFor="name">Nom complet</label>
            <input id="name" type="text" autoComplete="name" required value={name}
              onChange={e => setName(e.target.value)} placeholder="Ada Lovelace"
              className="w-full bg-[#18181b] border border-white/5 rounded-[12px] px-4 py-3 text-[15px] text-foreground outline-none focus:border-white/20 transition-colors placeholder:text-[#52525b]"
              disabled={loading} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#e4e4e7]" htmlFor="reg-email">Email</label>
            <input id="reg-email" type="email" autoComplete="email" required value={email}
              onChange={e => setEmail(e.target.value)} placeholder="vous@entreprise.com"
              className="w-full bg-[#18181b] border border-white/5 rounded-[12px] px-4 py-3 text-[15px] text-foreground outline-none focus:border-white/20 transition-colors placeholder:text-[#52525b]"
              disabled={loading} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#e4e4e7]" htmlFor="reg-password">Mot de passe</label>
            <div className="relative">
              <input id="reg-password" type={show ? 'text' : 'password'} autoComplete="new-password"
                required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                className="w-full bg-[#18181b] border border-white/5 rounded-[12px] px-4 py-3 text-[15px] text-foreground outline-none focus:border-white/20 transition-colors placeholder:text-[#52525b] pr-10"
                disabled={loading} />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#a1a1aa] transition-colors"
                aria-label={show ? 'Masquer' : 'Afficher'}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {passwordStrength && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-300" style={{
                    width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'fair' ? '66%' : '100%',
                    background: strengthColor[passwordStrength],
                  }} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: strengthColor[passwordStrength] }}>
                  {strengthLabel[passwordStrength]}
                </span>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || !name || !email || !password}
            className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-gray-100 transition-colors rounded-[12px] py-3 text-[15px] font-semibold mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                Création du compte…
              </span>
            ) : (
              <span className="flex items-center gap-2"><Zap size={15} /> Créer mon compte</span>
            )}
          </button>
        </form>

        <p className="text-[14px] text-[#a1a1aa] mt-8 relative">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-white hover:underline font-medium transition-colors">Se connecter</Link>
        </p>
      </div>

      {/* RIGHT — Animated agent panel */}
      <div className="flex-1 hidden lg:block relative overflow-hidden"
        style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
        <AgentPanel />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <RegisterForm />
    </Suspense>
  )
}
