'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Search, ChevronRight, ArrowLeft, ExternalLink, Copy, Check, Loader2 } from 'lucide-react'

// ── Data sources ─────────────────────────────────────────────────────────────
const GH_API  = 'https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows'
const GH_RAW  = 'https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows'

// ── Types ────────────────────────────────────────────────────────────────────
interface GHItem {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url: string | null
}

type TriggerType = 'Webhook' | 'Scheduled' | 'Triggered' | 'Manual' | 'Complex'

interface WorkflowEntry {
  name: string
  title: string
  trigger: TriggerType
  path: string
  rawUrl: string
}

// ── Constants ────────────────────────────────────────────────────────────────
const TRIGGER_META: Record<TriggerType, { color: string; bg: string }> = {
  Webhook:   { color: '#6366F1', bg: 'rgba(99,102,241,0.12)'  },
  Scheduled: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  Triggered: { color: '#34D399', bg: 'rgba(52,211,153,0.12)'  },
  Manual:    { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)'  },
  Complex:   { color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
}

// Known counts from catalog stats — shown without extra API calls
const KNOWN_COUNTS: Record<string, number> = {
  Slack: 18, Telegram: 119, Webhook: 65, Code: 183,
  Http: 176, Manual: 391, Discord: 42, Github: 28,
  Notion: 35, Openai: 61, Google: 47, Airtable: 22,
}

// ── Pure helpers ─────────────────────────────────────────────────────────────
function parseTitle(filename: string): string {
  return filename
    .replace(/\.json$/, '')
    .replace(/^\d+_/, '')
    .replace(/_/g, ' ')
    .trim()
}

function getTrigger(filename: string): TriggerType {
  const f = filename.toLowerCase()
  if (f.includes('webhook'))                                     return 'Webhook'
  if (f.includes('schedule') || f.includes('cron') || f.includes('interval')) return 'Scheduled'
  if (f.includes('triggered'))                                   return 'Triggered'
  if (f.includes('manual'))                                      return 'Manual'
  return 'Complex'
}

const CAT_ICON: Record<string, string> = {
  slack: '💬', telegram: '✈️', webhook: '🔗', code: '⌨️',
  http: '🌐', manual: '🤚', github: '🐙', notion: '📝',
  gmail: '📧', openai: '🤖', discord: '🎮', google: '🔍',
  airtable: '🗃️', stripe: '💳', shopify: '🛒', hubspot: '🔶',
  salesforce: '☁️', postgres: '🐘', mysql: '🐬', mongodb: '🍃',
  redis: '🔴', twilio: '📱', sendgrid: '📤', linear: '🎯',
  jira: '🔵', asana: '🟣', clickup: '🔸', trello: '📋',
  dropbox: '📦', box: '📁', onedrive: '🗂️', googledrive: '📂',
  zoom: '📹', teams: '💼', calendly: '📅', typeform: '📋',
  wordpress: '🌐', webflow: '🌊', twitter: '🐦', linkedin: '💼',
  facebook: '👥', instagram: '📷', youtube: '▶️', tiktok: '🎵',
  crypto: '₿', coingecko: '🦎', aws: '☁️', gcp: '☁️', azure: '☁️',
}

function catIcon(name: string): string {
  const key = Object.keys(CAT_ICON).find(k => name.toLowerCase().startsWith(k))
  return key ? CAT_ICON[key] : '⚡'
}

// ── Component ────────────────────────────────────────────────────────────────
export default function StackPage() {
  const [categories,  setCategories ] = useState<GHItem[]>([])
  const [selectedCat, setSelectedCat] = useState<GHItem | null>(null)
  const [workflows,   setWorkflows  ] = useState<WorkflowEntry[]>([])
  const [query,       setQuery      ] = useState('')
  const [trigFilter,  setTrigFilter ] = useState<TriggerType | 'all'>('all')
  const [loadingCats, setLoadingCats] = useState(true)
  const [loadingWf,   setLoadingWf  ] = useState(false)
  const [error,       setError      ] = useState<string | null>(null)
  const [copied,      setCopied     ] = useState<string | null>(null)

  // ── Fetchers ───────────────────────────────────────────────
  const fetchCategories = useCallback(() => {
    setLoadingCats(true)
    setError(null)
    fetch(GH_API, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => {
        if (r.status === 403) throw new Error('GitHub API rate limited — wait 60 s then retry.')
        if (!r.ok)           throw new Error(`GitHub API ${r.status}`)
        return r.json() as Promise<GHItem[]>
      })
      .then(data => setCategories(data.filter(d => d.type === 'dir')))
      .catch(e  => setError(String(e.message)))
      .finally(() => setLoadingCats(false))
  }, [])

  const fetchWorkflows = useCallback((cat: GHItem) => {
    setLoadingWf(true)
    setError(null)
    setWorkflows([])
    fetch(`${GH_API}/${cat.name}`, { headers: { Accept: 'application/vnd.github.v3+json' } })
      .then(r => {
        if (r.status === 403) throw new Error('GitHub API rate limited — wait 60 s then retry.')
        if (!r.ok)           throw new Error(`GitHub API ${r.status}`)
        return r.json() as Promise<GHItem[]>
      })
      .then(data => {
        setWorkflows(
          data
            .filter(d => d.type === 'file' && d.name.endsWith('.json'))
            .map(d => ({
              name:    d.name,
              title:   parseTitle(d.name),
              trigger: getTrigger(d.name),
              path:    d.path,
              rawUrl:  d.download_url ?? `${GH_RAW}/${cat.name}/${d.name}`,
            }))
        )
      })
      .catch(e  => setError(String(e.message)))
      .finally(() => setLoadingWf(false))
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  useEffect(() => {
    if (selectedCat) fetchWorkflows(selectedCat)
    else             setWorkflows([])
  }, [selectedCat, fetchWorkflows])

  // ── Derived state ──────────────────────────────────────────
  const filteredCats = useMemo(() =>
    categories.filter(c =>
      !query || c.name.toLowerCase().includes(query.toLowerCase())
    ),
    [categories, query]
  )

  const filteredWf = useMemo(() =>
    workflows.filter(w => {
      const matchQ = !query || w.title.toLowerCase().includes(query.toLowerCase())
      const matchT = trigFilter === 'all' || w.trigger === trigFilter
      return matchQ && matchT
    }),
    [workflows, query, trigFilter]
  )

  // ── Actions ────────────────────────────────────────────────
  function goBack() {
    setSelectedCat(null)
    setWorkflows([])
    setQuery('')
    setTrigFilter('all')
    setError(null)
  }

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const isLoading = loadingCats || loadingWf

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen">

      {/* Ambient glows */}
      <div className="glow-blob w-[600px] h-[400px] -top-10 right-0   opacity-20" />
      <div className="glow-blob w-[300px] h-[300px]  bottom-10 left-0 opacity-10" />

      <div className="relative p-6 md:p-8 max-w-[1400px] mx-auto flex flex-col gap-6">

        {/* ══ HEADER ══════════════════════════════════════════ */}
        <header className="animate-fade-in">
          {selectedCat ? (
            <div className="flex items-start gap-3">
              <button
                onClick={goBack}
                className="btn-ghost p-2 rounded-lg mt-0.5"
                aria-label="Back to categories"
              >
                <ArrowLeft size={16} />
              </button>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="section-label">Stack</span>
                  <span className="text-muted text-xs">/</span>
                  <h1 className="font-display text-2xl font-semibold text-foreground">
                    {catIcon(selectedCat.name)}&nbsp;{selectedCat.name}
                  </h1>
                  {workflows.length > 0 && (
                    <span className="chip font-mono">
                      {workflows.length} workflows
                    </span>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                  n8n-importable JSON workflows · browse, copy URL, or open raw.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-2xl font-semibold text-foreground">The Stack</h1>
                {!loadingCats && (
                  <span className="chip font-mono">
                    {categories.length} categories · 2 061 workflows
                  </span>
                )}
              </div>
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Browse and deploy production-ready n8n automation workflows across every integration.
              </p>
            </div>
          )}
        </header>

        {/* ══ SEARCH + TRIGGER FILTER ══════════════════════════ */}
        <div className="flex flex-col gap-3 animate-slide-up">

          {/* Terminal-style search */}
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm select-none"
              style={{ color: 'var(--color-brand)' }}
            >
              &gt;
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={selectedCat
                ? `search ${selectedCat.name} workflows...`
                : 'search categories...'}
              className="input pl-9 font-mono text-sm"
              aria-label="Search"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors text-sm"
                aria-label="Clear"
              >
                ✕
              </button>
            )}
          </div>

          {/* Trigger filter pills — only inside a category */}
          {selectedCat && workflows.length > 0 && (
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="Filter by trigger type"
            >
              {(['all', 'Webhook', 'Scheduled', 'Triggered', 'Manual', 'Complex'] as const).map(t => {
                const isActive = trigFilter === t
                const meta     = t !== 'all' ? TRIGGER_META[t] : null
                const activeStyle = isActive
                  ? meta
                    ? { background: meta.bg, borderColor: meta.color, color: meta.color, boxShadow: `0 0 10px ${meta.color}30` }
                    : { background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.5)', color: '#6366F1' }
                  : {}
                return (
                  <button
                    key={t}
                    onClick={() => setTrigFilter(t)}
                    aria-pressed={isActive}
                    className={`chip cursor-pointer transition-all duration-200 ${
                      !isActive ? 'hover:border-white/20 hover:text-foreground hover:bg-white/5' : ''
                    }`}
                    style={activeStyle}
                  >
                    {t === 'all' ? 'All types' : t}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Results info bar ─────────────────────── */}
        {selectedCat && !loadingWf && workflows.length > 0 && (
          <div className="flex items-center gap-2 -mt-2">
            <span className="section-label">
              {filteredWf.length.toLocaleString()} result{filteredWf.length !== 1 ? 's' : ''}
            </span>
            {(query || trigFilter !== 'all') && (
              <button
                onClick={() => { setQuery(''); setTrigFilter('all') }}
                className="text-xs font-mono underline underline-offset-2 transition-colors"
                style={{ color: 'var(--color-muted)' }}
              >
                clear filters
              </button>
            )}
          </div>
        )}

        {/* ══ ERROR STATE ══════════════════════════════════════ */}
        {error && !isLoading && (
          <div
            className="card-glass flex items-start gap-4 p-5 animate-fade-in"
            style={{ borderColor: 'rgba(239,68,68,0.3)' }}
          >
            <div
              className="icon-node w-10 h-10 flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <span>⚠️</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>Failed to load</p>
              <p className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>{error}</p>
              <button
                onClick={() => selectedCat ? fetchWorkflows(selectedCat) : fetchCategories()}
                className="btn-ghost text-xs self-start mt-1"
              >
                Retry →
              </button>
            </div>
          </div>
        )}

        {/* ══ LOADING STATE ════════════════════════════════════ */}
        {isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="icon-node w-14 h-14">
              <Loader2 size={22} className="animate-spin" style={{ color: 'var(--color-brand)' }} />
            </div>
            <p className="section-label">
              {loadingCats ? 'Fetching workflow categories…' : `Loading ${selectedCat?.name} workflows…`}
            </p>
          </div>
        )}

        {/* ══ CATEGORY GRID ════════════════════════════════════ */}
        {!selectedCat && !loadingCats && !error && (
          <>
            {filteredCats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="icon-node w-14 h-14">
                  <Search size={22} style={{ color: 'var(--color-brand)' }} />
                </div>
                <p className="font-display text-base font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  No categories match
                </p>
                <button onClick={() => setQuery('')} className="btn-ghost text-sm">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 pb-10 animate-fade-in">
                {filteredCats.map(cat => (
                  <button
                    key={cat.name}
                    onClick={() => { setSelectedCat(cat); setQuery('') }}
                    className="card-hover p-4 flex flex-col gap-2 text-left group relative overflow-hidden"
                  >
                    {/* Icon */}
                    <span className="text-2xl leading-none">{catIcon(cat.name)}</span>

                    {/* Name + count */}
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-sm font-semibold leading-tight"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {cat.name}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {KNOWN_COUNTS[cat.name] !== undefined
                          ? `${KNOWN_COUNTS[cat.name]} workflows`
                          : 'View workflows →'}
                      </span>
                    </div>

                    {/* Hover arrow */}
                    <ChevronRight
                      size={12}
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--color-brand)' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ══ WORKFLOW LIST ════════════════════════════════════ */}
        {selectedCat && !loadingWf && !error && (
          <>
            {filteredWf.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="icon-node w-14 h-14">
                  <Search size={22} style={{ color: 'var(--color-brand)' }} />
                </div>
                <p
                  className="font-display text-base font-semibold"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  No workflows match
                </p>
                <p className="text-sm max-w-[260px]" style={{ color: 'var(--color-muted)' }}>
                  Try a different keyword or remove the trigger filter.
                </p>
                <button
                  onClick={() => { setQuery(''); setTrigFilter('all') }}
                  className="btn-ghost text-sm mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10 animate-fade-in">
                {filteredWf.map(wf => {
                  const meta = TRIGGER_META[wf.trigger]
                  return (
                    <div
                      key={wf.name}
                      className="card-hover p-5 flex flex-col gap-3 group"
                    >
                      {/* ─ Top row: trigger badge + actions ─ */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="chip text-xs font-mono flex-shrink-0"
                          style={{
                            background:   meta.bg,
                            borderColor:  meta.color,
                            color:        meta.color,
                          }}
                        >
                          {wf.trigger}
                        </span>

                        {/* Actions — revealed on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copy(wf.rawUrl, wf.name)}
                            className="btn-ghost p-1.5 rounded-md"
                            title="Copy raw JSON URL"
                          >
                            {copied === wf.name
                              ? <Check  size={12} style={{ color: 'var(--color-status-active)' }} />
                              : <Copy   size={12} />}
                          </button>
                          <a
                            href={wf.rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-ghost p-1.5 rounded-md"
                            title="Open raw JSON"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>

                      {/* ─ Workflow title ─ */}
                      <h3
                        className="text-sm font-semibold leading-snug flex-1"
                        style={{ color: 'var(--color-foreground)' }}
                      >
                        {wf.title}
                      </h3>

                      {/* ─ Footer: filename + raw label ─ */}
                      <div
                        className="flex items-center justify-between pt-3 border-t gap-2"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <span
                          className="text-xs font-mono truncate flex-1"
                          style={{ color: 'var(--color-muted)' }}
                          title={wf.name}
                        >
                          {wf.name}
                        </span>
                        <a
                          href={wf.rawUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-mono flex-shrink-0 transition-colors"
                          style={{ color: 'var(--color-brand)' }}
                        >
                          JSON ↗
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
