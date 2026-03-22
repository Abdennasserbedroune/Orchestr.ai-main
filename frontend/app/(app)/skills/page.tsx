// FILE: frontend/app/(app)/skills/page.tsx
'use client'

import { useState, useMemo, useEffect, useCallback, type ComponentType, type SVGProps } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Search,
  Bot,
  Code,
  Terminal,
  BookOpen,
  Download,
  Edit3,
  X,
  Check,
  Copy,
  ChevronRight,
  Lock,
  Zap,
  Shield,
  Layers,
  Sparkles,
  Command,
  Cloud,
  Settings,
  AlertCircle
} from 'lucide-react'

// ── Constants ───────────────────────────────────────────────────────────────
const GH_USER = 'alirezarezvani'
const GH_REPO = 'claude-skills'
const GH_API = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`
const GH_RAW = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/main`
const GOOGLE_CLI = `${GH_RAW}/.gemini/skills-index.json`
const CODEX_CLI = `${GH_RAW}/.codex/skills-index.json`

// ── Types ────────────────────────────────────────────────────────────────────
type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>
type Modell = 'Claude' | 'Gemini' | 'Codex' | 'Tous'

type SkillCategory = 
  | 'Développement' 
  | 'Marketing' 
  | 'Produit' 
  | 'Projet' 
  | 'Sécurité' 
  | 'Finance' 
  | 'IA & ML'
  | 'PROJET' // Local skills
  | 'Librairie'

interface GHItem {
  name: string
  path: string
  type: 'dir' | 'file'
  download_url: string | null
}

interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  icon: LucideIcon
  content: string
  version: string
  author: string
  accentColor: string
  accentBg: string
  isLocal?: boolean
  rawUrl?: string
  models: ('Claude' | 'Gemini' | 'Codex')[]
}

// ── Category metadata ─────────────────────────────────────────────────────────
const CAT_META: Record<SkillCategory, { icon: LucideIcon; color: string; bg: string }> = {
  'Développement': { icon: Code,      color: '#6366F1', bg: 'rgba(99,102,241,0.12)'  },
  'Marketing':     { icon: Zap,       color: '#EC4899', bg: 'rgba(236,72,153,0.12)'  },
  'Produit':       { icon: Layers,    color: '#06B6D4', bg: 'rgba(6,182,212,0.12)'   },
  'Projet':        { icon: Terminal,  color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)'  },
  'Sécurité':      { icon: Shield,    color: '#F43F5E', bg: 'rgba(244,63,94,0.12)'   },
  'Finance':       { icon: Sparkles,  color: '#10B981', bg: 'rgba(16,185,129,0.12)'  },
  'IA & ML':       { icon: Bot,       color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  },
  'PROJET':        { icon: Settings,  color: '#A1A1AA', bg: 'rgba(161,161,170,0.12)' },
  'Librairie':     { icon: BookOpen,  color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
}

// ── Logic Helpers ─────────────────────────────────────────────────────────────
function resolveGHPath(baseUrl: string, relPath: string): string {
  try {
    const url = new URL(baseUrl)
    const parts = url.pathname.split('/')
    // On retire le nom du fichier (ex: SKILL.md) pour avoir le répertoire
    parts.pop()
    
    // Le chemin peut être formaté comme ../../../path/file.md
    const relParts = relPath.trim().replace(/\\/g, '/').split('/')
    for (const p of relParts) {
      if (p === '..') parts.pop()
      else if (p !== '.') parts.push(p)
    }
    
    url.pathname = parts.join('/')
    return url.toString()
  } catch (e) {
    return baseUrl
  }
}

function formatName(name: string): string {
  return name
    .replace(/-/g, ' ')
    .replace(/^cs\s/, '') // Remove "cs-" prefix
    .replace(/\b\w/g, c => c.toUpperCase())
}

function inferCategory(path: string): SkillCategory {
  if (path.includes('engineering')) return 'Développement'
  if (path.includes('marketing')) return 'Marketing'
  if (path.includes('product')) return 'Produit'
  if (path.includes('project')) return 'Projet'
  if (path.includes('ra-qm')) return 'Sécurité'
  if (path.includes('finance')) return 'Finance'
  if (path.includes('ai') || path.includes('ml')) return 'IA & ML'
  return 'Librairie'
}

// ── SkillCard ─────────────────────────────────────────────────────────────────
interface SkillCardProps {
  skill: Skill
  onClick: () => void
}

function SkillCard({ skill, onClick }: SkillCardProps) {
  const Icon = skill.icon
  const color = skill.accentColor

  return (
    <button
      id={`skill-card-${skill.id}`}
      onClick={onClick}
      className="group relative flex flex-col gap-3 p-5 rounded-[24px] text-left overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{
        background: 'rgba(10,10,12,0.85)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top accent glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[55%] h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(to right, transparent, ${color}80, transparent)`,
          boxShadow: `0 2px 14px ${color}60`,
        }}
      />

      {/* Ambient color glow */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: color, filter: 'blur(40px)' }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 border relative z-10 transition-all duration-300"
        style={{
          background: skill.accentBg,
          border: `1px solid ${color}30`,
          color,
        }}
      >
        <Icon size={18} strokeWidth={1.7} />
      </div>

      {/* Category + Name */}
      <div className="flex flex-col gap-0.5 relative z-10">
        <span
          className="text-[10px] font-mono uppercase tracking-[0.12em]"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {skill.category}
        </span>
        <h3
          className="text-[15px] font-semibold leading-snug truncate"
          style={{ color: '#fafafa' }}
        >
          {skill.name}
        </h3>
       <div className="flex gap-1 mt-1 overflow-hidden">
          {skill.models.map(m => (
            <span key={m} className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 text-[8px] font-mono text-zinc-500">
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <p
        className="text-[13px] leading-relaxed line-clamp-2 relative z-10"
        style={{ color: '#a1a1aa' }}
      >
        {skill.description}
      </p>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-auto relative z-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {skill.isLocal ? 'PROJET' : `v${skill.version} · Library`}
        </span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <span className="text-[10px] font-medium" style={{ color: '#71717a' }}>Voir</span>
          <ChevronRight size={13} style={{ color: '#a1a1aa' }} />
        </div>
      </div>
    </button>
  )
}

// ── SkillModal ────────────────────────────────────────────────────────────────
interface SkillModalProps {
  skill: Skill
  onClose: () => void
  onDownload: (content: string, name: string) => void
}

function SkillModal({ skill, onClose, onDownload }: SkillModalProps) {
  const [content, setContent] = useState(skill.content)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadingContent, setLoadingContent] = useState(!skill.content && !!skill.rawUrl)
  const Icon = skill.icon
  const color = skill.accentColor

  useEffect(() => {
    if (!skill.content && skill.rawUrl) {
      setLoadingContent(true)
      
      const loadContent = async (url: string, depth = 0): Promise<string> => {
        if (depth > 2) return 'Redirection trop profonde.'
        try {
          const r = await fetch(url)
          if (!r.ok) return `Erreur ${r.status}`
          const text = await r.text()
          
          // Détection de lien symbolique (chemin relatif court sans markdown)
          const trimmed = text.trim()
          const isSymlink = 
            trimmed.length < 300 && 
            trimmed.startsWith('..') && 
            (trimmed.endsWith('.md') || trimmed.endsWith('.json') || !trimmed.includes(' '))

          if (isSymlink) {
            const nextUrl = resolveGHPath(url, trimmed)
            return loadContent(nextUrl, depth + 1)
          }
          return text
        } catch (e) {
          return 'Échec de la récupération du contenu.'
        }
      }

      loadContent(skill.rawUrl)
        .then(text => setContent(text))
        .finally(() => setLoadingContent(false))
    }
  }, [skill])

  const handleCopy = (): void => {
    navigator.clipboard.writeText(content).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = content
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      id="skill-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        id="skill-modal-panel"
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
        style={{
          background: 'rgba(10,10,12,0.95)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          boxShadow: `0 40px 120px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.07), 0 0 0 1px ${color}18`,
        }}
      >
        {/* Top accent glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px]"
          style={{
            background: `linear-gradient(to right, transparent, ${color}80, transparent)`,
            boxShadow: `0 2px 20px ${color}50`,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
              style={{ background: skill.accentBg, border: `1px solid ${color}30`, color }}
            >
              <Icon size={17} strokeWidth={1.7} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold" style={{ color: '#fafafa' }}>
                {skill.name}
              </h2>
              <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {skill.category} · {skill.isLocal ? 'PROJET' : `v${skill.version}`}
              </p>
            </div>
          </div>

          <button
            id="skill-modal-close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[10px] transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center justify-between px-6 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.015)' }}
        >
          <div className="flex items-center gap-1.5">
            {(['aperçu', 'éditer'] as const).map(tab => {
              const active = (tab === 'éditer') === isEditing
              return (
                <button
                  key={tab}
                  onClick={() => setIsEditing(tab === 'éditer')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-200"
                  style={{
                    background: active ? `${color}18` : 'transparent',
                    border: `1px solid ${active ? `${color}35` : 'transparent'}`,
                    color: active ? color : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {tab === 'aperçu' ? <BookOpen size={12} strokeWidth={2} /> : <Edit3 size={12} strokeWidth={2} />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[12px] font-medium transition-all duration-200"
            style={{
              background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
              color: copied ? '#22c55e' : 'rgba(255,255,255,0.4)',
            }}
          >
            {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={2} />}
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingContent ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
              <Sparkles size={24} className="text-zinc-600 animate-spin" />
              <p className="text-[13px] text-zinc-500 font-mono">Chargement du contenu librairie…</p>
            </div>
          ) : isEditing ? (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-72 resize-none outline-none text-[13px] leading-relaxed p-4 rounded-[14px] font-mono"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}30`,
                color: '#e4e4e7',
                caretColor: color,
              }}
              placeholder="Écris ton markdown ici…"
            />
          ) : (
            <div
              className="rounded-[14px] p-5 min-h-[200px]"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <pre
                className="whitespace-pre-wrap text-[13px] leading-relaxed font-mono"
                style={{ color: '#a1a1aa' }}
              >
                {content}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Place le fichier .md dans ton dossier de projet pour l'activer.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 text-zinc-500 hover:text-white"
            >
              Annuler
            </button>
            <button
              onClick={() => onDownload(content, skill.name)}
              className="flex items-center gap-2 px-5 py-2 rounded-[12px] text-[13px] font-semibold transition-all duration-200"
              style={{
                background: color,
                color: '#fff',
                boxShadow: `0 0 20px ${color}40`,
              }}
            >
              <Download size={14} strokeWidth={2} />
              Télécharger .md
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SkillsPage(): JSX.Element {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'Tous'>('Tous')
  const [selectedModelle, setSelectedModelle] = useState<Modell>('Tous')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  
  const [allSkills, setAllSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── Data Fetching ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 0. Get Auth Token
      const { data: { session } } = await supabase.auth.getSession()
      const headers: Record<string, string> = {}
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      // 1. Fetch Local Skills
      const localRes = await fetch('/api/skills/local', { headers })
      const { data: localData } = await localRes.json()
      const localSkillsMap = (localData || []).map((s: any) => ({
        ...s,
        icon: CAT_META[s.category as SkillCategory]?.icon || Settings,
        accentColor: CAT_META[s.category as SkillCategory]?.color || '#A1A1AA',
        accentBg: CAT_META[s.category as SkillCategory]?.bg || 'rgba(255,255,255,0.1)',
        models: ['Claude', 'Gemini', 'Codex'] // Local skills are universal
      }))

      // 2. Fetch GitHub Indices
      const [ghGemRes, ghCodexRes] = await Promise.all([
        fetch(GOOGLE_CLI),
        fetch(CODEX_CLI)
      ])

      const ghGemData = ghGemRes.ok ? await ghGemRes.json() : { skills: [] }
      const ghCodexData = ghCodexRes.ok ? await ghCodexRes.json() : { skills: [] }
      
      const mapSkills = (skills: any[], model: 'Gemini' | 'Codex') => {
        return skills.map((s: any) => {
          const cat = inferCategory(s.name)
          const meta = CAT_META[cat] || CAT_META['Librairie']
          return {
            id: `gh-${model.toLowerCase()}-${s.name}`,
            name: formatName(s.name),
            description: s.description,
            category: cat,
            icon: meta.icon,
            version: '1.2.0',
            author: model === 'Gemini' ? 'Librairie Gemini' : 'Librairie Codex',
            accentColor: meta.color,
            accentBg: meta.bg,
            content: '',
            rawUrl: `${GH_RAW}/.${model.toLowerCase()}/skills/${s.name}/SKILL.md`,
            models: [model, 'Claude'] // Most are cross-compatible
          }
        })
      }

      const geminiSkills = mapSkills(ghGemData.skills, 'Gemini')
      const codexSkills = mapSkills(ghCodexData.skills, 'Codex')

      // 3. Unique Map to avoid duplicate keys
      const merged = [...localSkillsMap, ...geminiSkills, ...codexSkills]
      const uniqueSkillsMap = new Map<string, Skill>()
      merged.forEach(s => uniqueSkillsMap.set(s.id, s))

      setAllSkills(Array.from(uniqueSkillsMap.values()))
    } catch (e: any) {
      console.error(e)
      setError('Impossible de synchroniser la librairie — vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived State ───────────────────────────────────────────────
  const filteredSkills = useMemo<Skill[]>(() => {
    return allSkills.filter(skill => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q)
      
      const matchesCategory =
        selectedCategory === 'Tous' || skill.category === selectedCategory
      
      // Nouvelle logique de filtrage par modèle
      const matchesModelle = 
        selectedModelle === 'Tous' || 
        skill.models.some(m => m === selectedModelle)
      
      return matchesSearch && matchesCategory && matchesModelle
    })
  }, [allSkills, search, selectedCategory, selectedModelle])

  const handleDownload = (content: string, name: string): void => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${name.toLowerCase().replace(/\s+/g, '-')}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const catList: (SkillCategory | 'Tous')[] = ['Tous', 'PROJET', 'Développement', 'IA & ML', 'Produit', 'Marketing', 'Projet', 'Sécurité', 'Finance']

  return (
    <div className="relative min-h-full overflow-y-auto">

      {/* ── Ambient background glows ──────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '60vw', height: '60vw',
          background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 60%)',
          filter: 'blur(90px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', left: '20%',
          width: '60vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(99,102,241,0.03) 0%, transparent 65%)',
          filter: 'blur(100px)',
        }} />
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-[1400px] mx-auto flex flex-col gap-8">

        {/* ── Header ────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                Skills Library
              </h1>
              {!loading && (
                <span className="text-[12px] font-mono border rounded-full px-3 py-1 bg-white/5 border-white/10 text-zinc-400">
                  {filteredSkills.length} actifs
                </span>
              )}
            </div>
            <p className="text-[15px] text-zinc-400 max-w-lg">
              Explore la librairie <span className="text-zinc-200">Claude Skills</span> et synchronises-les avec ton agent pour débloquer de nouvelles capacités.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              {(['Tous', 'Claude', 'Gemini', 'Codex'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedModelle(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedModelle === m ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ── Search & Filters ──────────────────────────────────── */}
        <div className="flex flex-col gap-4 animate-slide-up">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une capacité, un outil ou un prompt..."
              className="w-full h-14 pl-12 pr-10 rounded-[20px] bg-zinc-900/60 backdrop-blur-xl border border-white/5 text-white outline-none focus:border-amber-500/40 focus:ring-4 focus:ring-amber-500/5 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {catList.map(cat => {
              const active = selectedCategory === cat
              const meta = cat !== 'Tous' ? CAT_META[cat] : null
              const CatIcon = meta?.icon
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                    active 
                      ? `bg-white/10 border-white/20 text-white` 
                      : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {CatIcon && <CatIcon size={14} style={{ color: active ? 'white' : 'inherit' }} />}
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Main Content ──────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-[24px] bg-white/5 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <AlertCircle size={40} className="text-red-500/50" />
            <h3 className="text-lg font-semibold text-white">{error}</h3>
            <button 
              onClick={fetchData} 
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white transition-colors"
            >
              Réessayer la synchronisation
            </button>
          </div>
        ) : filteredSkills.length > 0 ? (
          <div 
            key={`${selectedModelle}-${selectedCategory}`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-20 animate-fade-in"
          >
            {filteredSkills.map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onClick={() => setSelectedSkill(skill)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 text-center gap-4 opacity-50">
            <Search size={40} className="text-zinc-700" />
            <p className="text-white font-medium">Aucun résultat trouvé</p>
            <p className="text-sm text-zinc-500">Essaie d'élargir tes critères de recherche</p>
          </div>
        )}
      </div>

      {/* ── Modal ─────────────────────────────────────────────── */}
      {selectedSkill && (
        <SkillModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onDownload={(content, name) => {
            handleDownload(content, name)
            setSelectedSkill(null)
          }}
        />
      )}
    </div>
  )
}
