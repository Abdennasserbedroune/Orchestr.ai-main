'use client'
import { useState } from 'react'
import { Download, Copy, Check, Zap } from 'lucide-react'
import type { N8nWorkflow } from '@/lib/n8n-workflows-index'

interface WorkflowCardProps {
  workflow: N8nWorkflow
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const [copied,      setCopied     ] = useState(false)
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    if (downloading) return
    setDownloading(true)
    try {
      const res = await fetch(workflow.raw_url)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${workflow.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Silently fail — raw_url may not exist in the repo yet
    } finally {
      setDownloading(false)
    }
  }

  async function handleCopyUrl() {
    try {
      await navigator.clipboard.writeText(workflow.raw_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable (e.g. non-secure context)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5"
         style={{ boxShadow: 'none' }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div
          className="icon-node w-9 h-9 flex-shrink-0"
          style={{
            background: 'rgba(99,102,241,0.1)',
            borderColor: 'rgba(99,102,241,0.25)',
          }}
        >
          <Zap size={14} style={{ color: 'var(--color-brand)' }} strokeWidth={2} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground leading-snug">
            {workflow.name}
          </h4>
        </div>
      </div>

      {/* Integration badges */}
      <div className="flex flex-wrap gap-1.5">
        {workflow.integrations.map(integration => (
          <span
            key={integration}
            className="chip text-2xs"
            style={{
              background: 'rgba(99,102,241,0.07)',
              borderColor: 'rgba(99,102,241,0.2)',
              color: 'var(--color-brand)',
            }}
          >
            {integration}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-2 pt-3"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="btn-ghost text-xs gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={`Download ${workflow.name} JSON`}
        >
          <Download size={12} />
          {downloading ? 'Downloading…' : 'Download JSON'}
        </button>

        <button
          onClick={handleCopyUrl}
          className="btn-ghost text-xs gap-1.5 ml-auto"
          aria-label={`Copy import URL for ${workflow.name}`}
        >
          {copied
            ? <><Check size={12} style={{ color: 'var(--color-status-active)' }} /> Copied</>  
            : <><Copy size={12} /> Copy URL</>
          }
        </button>
      </div>
    </div>
  )
}

export default WorkflowCard
