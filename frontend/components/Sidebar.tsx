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
  { href: '/chat',       label: 'Chat',       icon: MessageSquare, description: 'Assistant IA',    accent: '#3B82F6' },
  { href: '/agents',     label: 'Agents',     icon: Layers,        description: 'Bibliothèque',     accent: '#A855F7' },
  { href: '/operations', label: 'Opérations', icon: Cpu,           description: 'Tâches en cours', accent: '#10B981' },
  { href: '/skills',     label: 'Skills',     icon: Bot,           description: 'Compétences IA',   accent: '#F59E0B' },
]

function useActiveRoute(href: string) {
  const pathname = usePathname()
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'))
}

function NavItem({ href, label, icon: Icon, description, accent, onClick }: typeof NAV_MAIN[0] & { onClick?: () => void }) {
  const active = useActiveRoute(href)
  return (
    <Link href={href} onClick={onClick}
      className={`group relative flex items-center gap-3.5 px-3 py-3 rounded-[14px] transition-all duration-300 ${!active && 'hover:bg-white/[0.025]'}`}
      style={active ? { background: `linear-gradient(to right, ${accent}15, transparent)`, boxShadow: `inset 1px 0 0 0 ${accent}40, inset 0 0 0 1px rgba(255,255,255,0.02)` } : undefined}>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[22px] rounded-r-full"
          style={{ background: accent, boxShadow: `0 0 10px ${accent}80` }} />
      )}
      <span className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] flex-shrink-0 transition-all duration-300 shadow-sm"
        style={active
          ? { background: `${accent}25`, border: `1px solid ${accent}40`, color: accent }
          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: '#a1a1aa' }}>
        <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="transition-colors group-hover:text-white" style={active ? {} : undefined} />
      </span>
      <div className="flex flex-col min-w-0">
        <span className="text-[14.5px] leading-none transition-colors group-hover:text-white"
          style={{ color: active ? '#ffffff' : '#a1a1aa', fontWeight: active ? 600 : 500 }}>
          {label}
        </span>
        <span className="text-[10px] font-mono mt-[4px] uppercase tracking-[0.1em] transition-colors"
          style={{ color: active ? `${accent}95` : '#52525b' }}>
          {description}
        </span>
      </div>
      <ChevronRight size={14} className="ml-auto flex-shrink-0 transition-all duration-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-white"
        style={{ color: active ? accent : '#71717a' }} />
    </Link>
  )
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">

      {/* Enhanced Logo header without beta version */}
      <Link href="/" className="flex items-center gap-4 px-6 py-6 flex-shrink-0 hover:bg-white/[0.015] transition-colors"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="relative flex-shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-[12px]">
          <Image src="/logo.jpg" alt="OrchestrAI" width={42} height={42} quality={100} className="rounded-[12px] object-cover ring-1 ring-white/10" priority />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-[2px] border-[#0a0a0c] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-display font-bold text-[18px] text-white tracking-tight leading-none drop-shadow-sm">OrchestrAI</span>
        </div>
      </Link>

      <div className="flex-1 flex flex-col px-4 pt-6 pb-4 overflow-y-auto gap-1.5">
        <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.15em] text-[#52525b] px-2 mb-2">Navigation</p>
        {NAV_MAIN.map(item => <NavItem key={item.href} {...item} onClick={onNavClick} />)}

        <div className="my-5 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }} />

        <p className="text-[10.5px] font-mono font-bold uppercase tracking-[0.15em] text-[#52525b] px-2 mb-2">Compte</p>
        <Link href="/settings" onClick={onNavClick}
          className="group flex items-center gap-3.5 px-3 py-[12px] rounded-[14px] transition-all duration-300 hover:bg-white/[0.025]"
          style={{ color: useActiveRoute('/settings') ? '#ffffff' : '#a1a1aa' }}>
          <span className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] bg-white/[0.03] border border-white/[0.05] flex-shrink-0 group-hover:bg-white/[0.06] transition-colors">
            <Settings size={16} strokeWidth={1.8} className="text-[#a1a1aa] group-hover:text-white transition-colors" />
          </span>
          <span className="text-[14.5px] font-medium group-hover:text-white transition-colors">Paramètres</span>
        </Link>
      </div>

      <div className="px-5 py-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)' }}>
        <div className="flex items-center gap-3.5 px-3.5 py-3.5 rounded-[16px] bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer group shadow-sm">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0 uppercase shadow-[0_0_12px_rgba(29,78,216,0.25)]"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.5), rgba(168,85,247,0.5))', border: '1px solid rgba(59,130,246,0.35)', color: '#e0e7ff' }}>
            W
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-[#f4f4f5] leading-none truncate group-hover:text-white transition-colors">Espace de travail</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
              <p className="text-[10.5px] font-mono text-[#71717a] truncate group-hover:text-[#a1a1aa] transition-colors">Plan gratuit</p>
            </div>
          </div>
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <Zap size={15} className="text-[#a1a1aa] group-hover:text-white" />
          </div>
        </div>
      </div>

    </div>
  )
}

function DesktopSidebar() {
  return (
    <aside className="hidden md:flex w-[250px] flex-shrink-0 h-screen flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] z-20"
      style={{ background: '#0a0a0c', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
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
        style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}
        aria-hidden="true" />
      <div className="fixed top-0 left-0 h-full z-50 md:hidden"
        style={{ width: 280, background: '#0a0a0c', borderRight: '1px solid rgba(255,255,255,0.05)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: open ? '24px 0 80px rgba(0,0,0,0.8)' : 'none' }}
        role="dialog" aria-modal="true">
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-[10px] border border-white/[0.08] text-[#71717a] hover:text-white hover:bg-white/[0.06] transition-all bg-[#0a0a0c] z-10 shadow-lg">
          <X size={15} />
        </button>
        <SidebarContent onNavClick={onClose} />
      </div>
    </>
  )
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="md:hidden flex items-center justify-between px-5 h-[64px] flex-shrink-0 sticky top-0 z-30 shadow-sm"
      style={{ background: 'rgba(10,10,12,0.85)', borderBottom: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
      <Link href="/" className="flex items-center gap-3">
        <Image src="/logo.jpg" alt="OrchestrAI" width={32} height={32} quality={100} className="rounded-[10px] object-cover ring-1 ring-white/10 shadow-md" />
        <span className="font-display font-bold text-[16px] text-[#fafafa] tracking-tight">OrchestrAI</span>
      </Link>
      <button onClick={onOpen} className="w-9 h-9 flex items-center justify-center rounded-[10px] border border-white/[0.08] text-[#a1a1aa] hover:text-white hover:bg-white/[0.06] transition-all shadow-sm">
        <Menu size={18} />
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
