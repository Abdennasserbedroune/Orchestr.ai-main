'use client'
import { useState, useEffect, useRef } from 'react'
import { MOCK_TYPEWRITER_RESPONSES } from '@/lib/mock-data'
import type { Domain } from '@/lib/mock-data'

interface AgentTerminalProps {
  agentName: string
  domain: Domain
}

const CURSOR = '\u2588'

export function AgentTerminal({ agentName, domain }: AgentTerminalProps) {
  const [input,     setInput    ] = useState('')
  const [output,    setOutput   ] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [done,      setDone     ] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const outputRef   = useRef<HTMLDivElement>(null)

  // Auto-scroll output as text streams in
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  function stopStream() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function runDemo() {
    if (streaming) return
    const response =
      MOCK_TYPEWRITER_RESPONSES[domain] ?? MOCK_TYPEWRITER_RESPONSES['default']

    setOutput('')
    setDone(false)
    setStreaming(true)

    let i = 0
    intervalRef.current = setInterval(() => {
      if (i >= response.length) {
        stopStream()
        setStreaming(false)
        setDone(true)
        return
      }
      setOutput(prev => prev + response[i])
      i++
    }, 18)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      runDemo()
    }
  }

  // Cleanup on unmount
  useEffect(() => () => stopStream(), [])

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* macOS-style title bar */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
        <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
        <span
          className="ml-3 font-mono text-2xs tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          {agentName} — terminal
        </span>
      </div>

      {/* Input row */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="font-mono text-sm flex-shrink-0" style={{ color: 'var(--color-brand)' }}>
          $
        </span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask ${agentName} something...`}
          className="flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-subtle"
          aria-label={`Terminal input for ${agentName}`}
          disabled={streaming}
        />
        <button
          onClick={runDemo}
          disabled={streaming}
          className="btn-primary text-xs py-1.5 px-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          aria-label="Run demo"
        >
          {streaming ? 'Running…' : 'Run →'}
        </button>
      </div>

      {/* Output area */}
      <div
        ref={outputRef}
        className="min-h-[140px] max-h-[260px] overflow-y-auto p-5 font-mono text-sm leading-relaxed"
        style={{ color: 'rgba(255,255,255,0.85)' }}
        aria-live="polite"
        aria-atomic="false"
      >
        {!output && !streaming && (
          <p className="text-subtle text-xs">
            Press <span className="text-brand">Run</span> or hit{' '}
            <span className="text-brand">Enter</span> to see {agentName} in action.
          </p>
        )}
        {output && (
          <span>
            <span
              className="font-mono text-2xs tracking-widest uppercase mr-2 mb-3 block"
              style={{ color: 'var(--color-brand)' }}
            >
              &gt; {agentName}
            </span>
            {output}
            {!done && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-middle animate-pulse"
                style={{ background: 'var(--color-brand)' }}
                aria-hidden="true"
              />
            )}
          </span>
        )}
      </div>
    </div>
  )
}

export default AgentTerminal
