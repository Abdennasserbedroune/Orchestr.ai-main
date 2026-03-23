'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare, Layers, Cpu, Bot,
  Menu, X, ChevronRight,
  Zap, Settings,
} from 'lucide-react'
import Image from 'next/image'

const NAV_MAIN = [
  { href: '/chat',       label: 'Chat',       icon: MessageSquare, description: 'Assistant IA',    accent: '#6c63ff' },
  { href: '/agents',     label: 'Agents',     icon: Layers,        description: 'Bibliothèque',     accent: '#A855F7' },
  { href: '/skills',     label: 'Skills',     icon: Bot,           description: 'Compétences IA',   accent: '#F59E0B' },
  { href: '/operations', label: 'Opérations', icon: Cpu,           description: 'Flux en cours',    accent: '#10B981' },
]

function useActiveRoute(href: string) {
  const pathname = usePathname()
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

function NavItem({ href, label, icon: Icon, description, accent, onClick }: typeof NAV_MAIN[0] & { onClick?: () => void }) {
  const active = useActiveRoute(href)
  return (
    <Link href={href} onClick={onClick}
      className={`group relative flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-300 ${!active ? 'hover:bg-white/[0.03]' : ''}`}
      style={active ? { 
        background: `linear-gradient(to right, ${accent}15, transparent)`, 
        boxShadow: `inset 1px 0 0 0 ${accent}40, inset 0 0 0 1px rgba(255,255,255,0.02)` 
      } : undefined}>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}80` }} />
      )}
      <span className="w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 transition-all duration-300 shadow-sm"
        style={active
          ? { background: `${accent}25`, border: `1px solid ${accent}40`, color: accent }
          : { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="transition-colors group-hover:text-white" />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[14px] leading-none transition-colors group-hover:text-white"
          style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 500 }}>
          {label}
        </span>
        <span className="text-[10px] font-mono mt-1 uppercase tracking-widest transition-colors"
          style={{ color: active ? `${accent}cc` : 'var(--text-muted)' }}>
          {description}
        </span>
      </div>
      <ChevronRight size={14} className="ml-auto flex-shrink-0 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white"
        style={{ color: active ? accent : 'var(--text-muted)' }} />
    </Link>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{
      background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, rgba(8,8,14,0.98) 100%)',
    }}>

      <Link href="/" className="flex items-center gap-4 px-6 py-7 flex-shrink-0 hover:bg-white/[0.01] transition-colors"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="relative flex-shrink-0 shadow-[0_0_20px_rgba(108,99,255,0.1)] rounded-xl">
          <Image src="/logo.jpg" alt="OrchestrAI" width={42} height={42} quality={100} className="rounded-xl object-cover ring-1 ring-white/10" priority />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[2px] border-[var(--bg-base)] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-display font-bold text-lg text-white tracking-tight leading-none">OrchestrAI</span>
        </div>
      </Link>

      <div className="flex-1 flex flex-col px-4 pt-8 pb-4 overflow-y-auto gap-1.5">
        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] px-3 mb-2">Navigation</p>
        {NAV_MAIN.map(item => <NavItem key={item.href} {...item} onClick={onNavClick} />)}

        <div className="my-6 mx-2 border-t border-[var(--border-subtle)]" />

        <p className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--text-muted)] px-3 mb-2">Compte</p>
        <Link href="/settings" onClick={onNavClick}
          className={`group flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-300 hover:bg-white/[0.03] ${useActiveRoute('/settings') ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
          <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/[0.03] border border-[var(--border-subtle)] flex-shrink-0 group-hover:bg-white/[0.06] transition-colors">
            <Settings size={16} strokeWidth={1.8} className="text-[var(--text-secondary)] group-hover:text-white transition-colors" />
          </span>
          <span className="text-[14px] font-medium group-hover:text-white transition-colors">Paramètres</span>
        </Link>
      </div>

      <div className="px-5 py-6 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)', background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }}>
        <div className="flex items-center gap-3.5 px-4 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer group shadow-sm">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 uppercase shadow-[0_0_12px_rgba(108,99,255,0.2)]"
            style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.5), rgba(0,212,255,0.3))', border: '1px solid rgba(108,99,255,0.35)', color: '#e0e7ff' }}>
            W
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-none truncate group-hover:text-white transition-colors">Espace de travail</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <p className="text-[10px] font-mono text-[var(--text-muted)] truncate group-hover:text-[var(--text-secondary)] transition-colors">Plan gratuit</p>
            </div>
          </div>
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <Zap size={14} className="text-[var(--text-muted)] group-hover:text-[var(--brand)]" />
          </div>
        </div>
      </div>

    </div>
  )
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-[260px] flex-shrink-0 h-screen flex-col z-20 border-r border-[var(--border-subtle)]"
      style={{ background: 'var(--bg-sidebar)', boxShadow: '1px 0 0 rgba(255,255,255,0.04), 8px 0 40px rgba(0,0,0,0.5)' }}>
      <SidebarContent />
    </aside>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])
  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 md:hidden"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}
        aria-hidden="true" />
      <div className="fixed top-0 left-0 h-full z-50 md:hidden"
        style={{ width: 280, background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border-subtle)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: open ? '24px 0 80px rgba(0,0,0,0.9)' : 'none' }}
        role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06] transition-all bg-[var(--bg-base)] z-10 shadow-lg">
          <X size={16} />
        </button>
        <SidebarContent onNavClick={onClose} />
      </div>
    </>
  )
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="md:hidden flex items-center justify-between px-6 h-16 flex-shrink-0 sticky top-0 z-30 shadow-sm"
      style={{ background: 'rgba(10,10,15,0.85)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(24px)' }}>
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.jpg" alt="OrchestrAI" width={34} height={34} quality={100} className="rounded-lg object-cover ring-1 ring-white/10 shadow-md" />
        <span className="font-display font-bold text-base text-white tracking-tight">OrchestrAI</span>
      </Link>
      <button onClick={onOpen} className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/[0.08] text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06] transition-all shadow-sm">
        <Menu size={20} />
      </button>
    </div>
  )
}

export function Sidebar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => { setDrawerOpen(false) }, [pathname])
  return (
    <>
      <DesktopSidebar />
      <MobileTopBar onOpen={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default Sidebar
