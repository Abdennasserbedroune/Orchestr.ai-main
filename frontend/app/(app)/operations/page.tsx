'use client'
import { Cpu, Zap, GitBranch, Activity, Clock, ArrowRight } from 'lucide-react'
import { AmbientBackground } from '@/components/AmbientBackground'
import Link from 'next/link'

const UPCOMING = [
  {
    icon: Activity,
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.2)',
    title: 'Tableau de bord temps réel',
    desc: 'Visualisez chaque agent en action — entrées, sorties et latences en direct.',
  },
  {
    icon: GitBranch,
    color: '#a855f7',
    bg: 'rgba(168,85,247,0.08)',
    border: 'rgba(168,85,247,0.2)',
    title: 'Logs de pipeline',
    desc: 'Tracez le chemin complet de chaque requête à travers vos agents orchestrés.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    title: 'Historique des workflows n8n',
    desc: 'Consultez et rejouez chaque workflow JSON généré et exécuté dans n8n.',
  },
  {
    icon: Clock,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
    title: 'Planification des tâches',
    desc: 'Programmez des automatisations récurrentes directement depuis l’interface.',
  },
]

export default function OperationsPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16">

      <AmbientBackground accentColor="#10B981" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center gap-8">

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(99,102,241,0.2)',
        }}>
          <Cpu size={32} style={{ color: '#6366f1' }} strokeWidth={1.5} />
        </div>

        {/* Badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 14px', borderRadius: 99,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#818cf8',
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'#6366f1', boxShadow:'0 0 8px rgba(99,102,241,0.9)', animation:'pulse 1.5s ease-in-out infinite', flexShrink:0 }} />
          Fonctionnalité à venir
        </span>

        {/* Title */}
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: '#fafafa' }}>
            Opérations
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: '#71717a', maxWidth: 480, margin: '12px auto 0' }}>
            Le centre de contrôle de vos agents IA arrive bientôt.
            Suivez, planifiez et rejouez chaque workflow orchestré.
          </p>
        </div>

        {/* Feature cards */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {UPCOMING.map(({ icon: Icon, color, bg, border, title, desc }) => (
            <div key={title}
              style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: '18px 20px', textAlign: 'left' }}
            >
              <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, border:`1px solid ${color}35`,
                display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 12 }}>
                <Icon size={18} style={{ color }} strokeWidth={1.7} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7', marginBottom: 4 }}>{title}</p>
              <p style={{ fontSize: 12, color: '#71717a', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Notify CTA */}
        <Link
          href="/chat"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#a1a1aa', fontSize: 14, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.color = '#e4e4e7' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLElement).style.color = '#a1a1aa' }}
        >
          Retourner au chat
          <ArrowRight size={14} strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
