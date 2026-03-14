// Next.js 15 — params is now a Promise that must be awaited
// Bug 10 fix retained: notFound() replaced with redirect for client-safety
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Star, ArrowLeft, Wrench, CheckCircle2, Users } from 'lucide-react'
import { AGENTS_CATALOG } from '@/lib/agents-data'
import { DOMAIN_META } from '@/lib/mock-data'
import { AgentTerminal } from '@/components/AgentTerminal'
import { WorkflowsSection } from '@/components/WorkflowsSection'

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < Math.round(rating) ? 'fill-[#FFD600] text-[#FFD600]' : 'text-subtle'}
        />
      ))}
      <span className="font-mono text-sm text-muted ml-1">{rating}</span>
    </div>
  )
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AgentDetailPage({ params }: PageProps) {
  const { slug } = await params
  const agent = AGENTS_CATALOG.find(a => a.slug === slug)
  if (!agent) redirect('/agents')

  const meta = DOMAIN_META[agent.domain]
  const Icon = meta.icon

  return (
    <div className="relative min-h-screen">

      {/* Ambient background glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-gradient-to-b from-brand/10 to-transparent blur-[120px] pointer-events-none z-0 rounded-full opacity-30"></div>
      <div
        className="fixed top-0 right-0 w-[40vw] h-[40vh] rounded-full pointer-events-none opacity-20"
        style={{ background: meta.color, filter: 'blur(100px)' }}
      />

      <div className="relative max-w-[1000px] mx-auto px-6 pb-20">

        {/* ── Back nav ──────────────────────────── */}
        <div className="pt-8 pb-6">
          <Link href="/agents" className="btn-ghost text-sm inline-flex items-center gap-2">
            <ArrowLeft size={14} />
            Retour aux Agents
          </Link>
        </div>

        {/* ── HERO ──────────────────────────────── */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#111111] p-8 mb-8 animate-fade-in shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div
            className="absolute -top-10 -left-10 w-64 h-64 rounded-full pointer-events-none opacity-20"
            style={{ background: meta.color, filter: 'blur(80px)' }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
            <div
              className="icon-node w-16 h-16 flex-shrink-0"
              style={{ background: meta.bg, borderColor: `${meta.color}60`, boxShadow: `0 0 40px ${meta.color}30` }}
            >
              <Icon size={28} style={{ color: meta.color }} />
            </div>
            <div className="flex-1">
              <p className="font-mono text-xs tracking-widest uppercase mb-1.5" style={{ color: meta.color }}>
                {agent.domain}
              </p>
              <h1 className="font-display text-4xl font-bold text-foreground leading-tight">
                {agent.name}
              </h1>
              <p className="font-mono text-sm tracking-widest uppercase text-muted mt-1">
                {agent.role}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <StarRow rating={agent.rating} />
                <span className="text-subtle text-2xs">|</span>
                <div className="flex items-center gap-1.5">
                  <Users size={12} className="text-muted" />
                  <span className="font-mono text-xs text-muted">{agent.installs.toLocaleString()} installations</span>
                </div>
                <span className="text-subtle text-2xs">|</span>
                <span
                  className="chip text-2xs"
                  style={{ color: '#22C55E', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)' }}
                >
                  <span className="status-dot active" />
                  {agent.status}
                </span>
              </div>
              <p className="text-base text-muted leading-relaxed mt-4 max-w-[560px]">{agent.tagline}</p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn-primary">Ajouter aux Agents</button>
                <button className="btn-outline">Voir la Doc</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2-COL CONTENT ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="card p-6">
              <p className="section-label mb-4">À propos</p>
              <p className="text-sm text-muted leading-relaxed">{agent.description}</p>
            </div>
            <div className="card p-6">
              <p className="section-label mb-4">Compétences</p>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map(skill => (
                  <span key={skill} className="chip" style={{ borderColor: `${meta.color}30`, color: meta.color }}>
                    <CheckCircle2 size={10} />{skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <p className="section-label">Outils Compatibles</p>
                <Wrench size={12} className="text-muted" />
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.compatibleTools.map(tool => (
                  <span key={tool} className="chip">{tool}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-[24px] border border-white/[0.08] bg-[#111111] p-7 lg:sticky lg:top-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="h-[2px] w-12 rounded-full mb-6"
                style={{ background: meta.color }} />
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: meta.bg, border: `1px solid ${meta.color}30` }}>
                <Icon size={24} style={{ color: meta.color }} />
              </div>
              <h3 className="font-display text-base font-semibold text-center mb-1">{agent.name}</h3>
              <p className="font-mono text-2xs text-muted text-center tracking-widest uppercase mb-5">{agent.role}</p>
              <StarRow rating={agent.rating} />
              <div className="h-px my-5" style={{ background: 'var(--color-border)' }} />
              <div className="flex flex-col gap-2 text-xs text-muted font-mono mb-6">
                <div className="flex justify-between">
                  <span>Installations</span>
                  <span className="text-foreground">{agent.installs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domaine</span>
                  <span style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>n8n workflow</span>
                  <span className={agent.n8nWorkflow ? 'text-[#22C55E]' : 'text-muted'}>
                    {agent.n8nWorkflow ? 'Inclus' : 'Non inclus'}
                  </span>
                </div>
              </div>
              <button className="btn-primary w-full justify-center">Ajouter aux Agents</button>
              <button className="btn-ghost w-full justify-center mt-2 text-xs">Voir la Doc</button>
            </div>
          </div>
        </div>

        {/* ── PLAYBOOK ──────────────────────────── */}
        <section className="mb-8">
          <p className="section-label mb-6">Guide Pratique</p>
          <div className="relative">
            <div
              className="absolute left-[15px] top-0 bottom-0 w-[2px]"
              style={{ background: `linear-gradient(to bottom, ${meta.color}, transparent)` }}
            />
            <div className="flex flex-col gap-0">
              {agent.playbook.map((step, i) => (
                <div key={step.step} className="flex gap-5 relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm font-medium z-10"
                    style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}50`, color: meta.color }}
                  >
                    {step.step}
                  </div>
                  <div className={`pb-8 ${i === agent.playbook.length - 1 ? 'pb-0' : ''}`}>
                    <h4 className="font-display text-sm font-semibold text-foreground leading-tight mt-1">{step.title}</h4>
                    <p className="text-sm text-muted leading-relaxed mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRY IT ────────────────────────────── */}
        <section className="mb-10">
          <p className="section-label mb-4">Essayez-le</p>
          <AgentTerminal agentName={agent.name} domain={agent.domain} />
        </section>

        {/* ── WORKFLOWS ─────────────────────────── */}
        <WorkflowsSection agentSlug={agent.slug} />

        {/* ── REVIEWS ──────────────────────────── */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Avis</p>
            <span className="chip font-mono">{agent.reviews.length} avis</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agent.reviews.map((review, i) => (
              <div key={i} className="card p-6 flex flex-col gap-3">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12}
                      className={s < review.rating ? 'fill-[#FFD600] text-[#FFD600]' : 'text-subtle'} />
                  ))}
                </div>
                <p className="text-sm text-muted leading-relaxed flex-1">&ldquo;{review.body}&rdquo;</p>
                <div className="flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.author}</p>
                    <span className="chip text-2xs mt-1" style={{ display: 'inline-flex' }}>{review.company}</span>
                  </div>
                  <span className="font-mono text-2xs text-subtle">{review.date}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
