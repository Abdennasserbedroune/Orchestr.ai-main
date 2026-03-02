'use client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Star, ArrowLeft, Wrench, CheckCircle2, Users } from 'lucide-react'
import { AGENTS_CATALOG } from '@/lib/agents-data'
import { DOMAIN_META } from '@/lib/mock-data'
import { AgentTerminal } from '@/components/AgentTerminal'

interface PageProps {
  params: { slug: string }
}

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

export default function AgentDetailPage({ params }: PageProps) {
  const agent = AGENTS_CATALOG.find(a => a.slug === params.slug)
  if (!agent) notFound()

  const meta = DOMAIN_META[agent.domain]
  const Icon = meta.icon

  return (
    <div className="relative min-h-screen">

      {/* Ambient background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none opacity-20"
        style={{ background: meta.color, filter: 'blur(160px)' }}
      />

      <div className="relative max-w-[1000px] mx-auto px-6 pb-20">

        {/* ── Back nav ──────────────────────────── */}
        <div className="pt-8 pb-6">
          <Link
            href="/stack"
            className="btn-ghost text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            Back to The Stack
          </Link>
        </div>

        {/* ── HERO ──────────────────────────────── */}
        <section
          className="card-glass bg-grid relative overflow-hidden p-8 mb-8 animate-fade-in"
        >
          {/* Domain glow blob behind icon */}
          <div
            className="absolute top-8 left-8 w-48 h-48 rounded-full pointer-events-none opacity-30"
            style={{ background: meta.color, filter: 'blur(80px)' }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Large domain icon */}
            <div
              className="icon-node w-16 h-16 flex-shrink-0"
              style={{
                background: meta.bg,
                borderColor: `${meta.color}60`,
                boxShadow: `0 0 40px ${meta.color}30`,
              }}
            >
              <Icon size={28} style={{ color: meta.color }} />
            </div>

            {/* Name + meta */}
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
                  <span className="font-mono text-xs text-muted">
                    {agent.installs.toLocaleString()} installs
                  </span>
                </div>
                <span className="text-subtle text-2xs">|</span>
                <span
                  className="chip text-2xs"
                  style={{
                    color: '#22C55E',
                    borderColor: 'rgba(34,197,94,0.3)',
                    background: 'rgba(34,197,94,0.08)',
                  }}
                >
                  <span className="status-dot active" />
                  {agent.status}
                </span>
              </div>

              <p className="text-base text-muted leading-relaxed mt-4 max-w-[560px]">
                {agent.tagline}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <button className="btn-primary">
                  Add to Stack
                </button>
                <button className="btn-outline">
                  View Docs
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2-COL CONTENT ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Left col — About + Skills + Tools */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* About */}
            <div className="card p-6">
              <p className="section-label mb-4">About</p>
              <p className="text-sm text-muted leading-relaxed">{agent.description}</p>
            </div>

            {/* Skills */}
            <div className="card p-6">
              <p className="section-label mb-4">Skills</p>
              <div className="flex flex-wrap gap-2">
                {agent.skills.map(skill => (
                  <span
                    key={skill}
                    className="chip"
                    style={{ borderColor: `${meta.color}30`, color: meta.color }}
                  >
                    <CheckCircle2 size={10} />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Compatible Tools */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <p className="section-label">Compatible Tools</p>
                <Wrench size={12} className="text-muted" />
              </div>
              <div className="flex flex-wrap gap-2">
                {agent.compatibleTools.map(tool => (
                  <span key={tool} className="chip">{tool}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right col — Sticky CTA card */}
          <div className="lg:col-span-1">
            <div
              className="card p-6 lg:sticky lg:top-6"
              style={{ boxShadow: `0 0 40px -10px ${meta.color}20` }}
            >
              {/* Domain accent bar top */}
              <div
                className="h-[3px] w-full rounded-full mb-5"
                style={{ background: `linear-gradient(to right, ${meta.color}, transparent)` }}
              />

              <div
                className="icon-node w-12 h-12 mx-auto mb-4"
                style={{ background: meta.bg, borderColor: `${meta.color}50` }}
              >
                <Icon size={20} style={{ color: meta.color }} />
              </div>

              <h3 className="font-display text-base font-semibold text-center mb-1">
                {agent.name}
              </h3>
              <p className="font-mono text-2xs text-muted text-center tracking-widest uppercase mb-5">
                {agent.role}
              </p>

              <StarRow rating={agent.rating} />

              <div className="h-px my-5" style={{ background: 'var(--color-border)' }} />

              <div className="flex flex-col gap-2 text-xs text-muted font-mono mb-6">
                <div className="flex justify-between">
                  <span>Installs</span>
                  <span className="text-foreground">{agent.installs.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domain</span>
                  <span style={{ color: meta.color }}>{meta.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>n8n workflow</span>
                  <span className={agent.n8nWorkflow ? 'text-[#22C55E]' : 'text-muted'}>
                    {agent.n8nWorkflow ? 'Included' : 'Not included'}
                  </span>
                </div>
              </div>

              <button className="btn-primary w-full justify-center">Add to Stack</button>
              <button className="btn-ghost w-full justify-center mt-2 text-xs">View Docs</button>
            </div>
          </div>
        </div>

        {/* ── PLAYBOOK ──────────────────────────── */}
        <section className="mb-8">
          <p className="section-label mb-6">Playbook</p>
          <div className="relative">
            {/* Vertical gradient timeline line */}
            <div
              className="absolute left-[15px] top-0 bottom-0 w-[2px]"
              style={{
                background: `linear-gradient(to bottom, ${meta.color}, transparent)`,
              }}
            />

            <div className="flex flex-col gap-0">
              {agent.playbook.map((step, i) => (
                <div key={step.step} className="flex gap-5 relative">
                  {/* Step node */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-mono text-sm font-medium z-10"
                    style={{
                      background: `${meta.color}20`,
                      border: `1px solid ${meta.color}50`,
                      color: meta.color,
                    }}
                  >
                    {step.step}
                  </div>

                  {/* Content */}
                  <div className={`pb-8 ${i === agent.playbook.length - 1 ? 'pb-0' : ''}`}>
                    <h4 className="font-display text-sm font-semibold text-foreground leading-tight mt-1">
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted leading-relaxed mt-1">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRY IT ────────────────────────────── */}
        <section className="mb-10">
          <p className="section-label mb-4">Try It</p>
          <AgentTerminal agentName={agent.name} domain={agent.domain} />
        </section>

        {/* ── REVIEWS ──────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Reviews</p>
            <span className="chip font-mono">{agent.reviews.length} reviews</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agent.reviews.map((review, i) => (
              <div key={i} className="card p-6 flex flex-col gap-3">
                {/* Stars */}
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      className={s < review.rating ? 'fill-[#FFD600] text-[#FFD600]' : 'text-subtle'}
                    />
                  ))}
                </div>

                {/* Body */}
                <p className="text-sm text-muted leading-relaxed flex-1">&ldquo;{review.body}&rdquo;</p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{review.author}</p>
                    <span
                      className="chip text-2xs mt-1"
                      style={{ display: 'inline-flex' }}
                    >
                      {review.company}
                    </span>
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
