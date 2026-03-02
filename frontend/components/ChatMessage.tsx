import { AGENTS_CATALOG } from '@/lib/agents-data'
import { DOMAIN_META } from '@/lib/mock-data'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

// ─── Agent mention detection ─────────────────────────────────────────────────
// Scans assistant message content for any known agent names and returns matches.
function detectAgentMentions(content: string) {
  return AGENTS_CATALOG.filter(agent =>
    content.toLowerCase().includes(agent.name.toLowerCase())
  )
}

function AgentMentionCard({ slug }: { slug: string }) {
  const agent = AGENTS_CATALOG.find(a => a.slug === slug)
  if (!agent) return null
  const meta = DOMAIN_META[agent.domain]
  const Icon = meta.icon
  return (
    <a
      href={`/stack/${agent.slug}`}
      className="flex items-center gap-3 mt-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: meta.bg,
        border: `1px solid ${meta.color}40`,
        boxShadow: `0 0 16px ${meta.color}15`,
        textDecoration: 'none',
      }}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: `${meta.color}20`, border: `1px solid ${meta.color}50` }}
      >
        <Icon size={14} style={{ color: meta.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
        <p className="font-mono text-2xs text-muted tracking-wider uppercase truncate">
          {agent.role}
        </p>
      </div>
      <span
        className="font-mono text-2xs flex-shrink-0"
        style={{ color: meta.color }}
      >
        View →
      </span>
    </a>
  )
}

export function ChatMessageBubble({ message }: { message: Message }) {
  const isUser      = message.role === 'user'
  const isStreaming = message.streaming && !isUser
  const mentions    = !isUser ? detectAgentMentions(message.content) : []

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end`}>
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mb-0.5"
          style={{
            background: 'linear-gradient(135deg, #EA580C, #F7931A)',
            boxShadow: '0 0 16px rgba(247,147,26,0.35)',
          }}
        >
          <span className="font-mono text-2xs font-bold text-white">B</span>
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role label */}
        <span className="font-mono text-2xs text-subtle uppercase tracking-widest px-1">
          {isUser ? 'You' : 'Brief'}
        </span>

        {/* Bubble */}
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={isUser ? {
            background: 'linear-gradient(135deg, #EA580C22, #F7931A22)',
            border: '1px solid rgba(247,147,26,0.25)',
            color: 'var(--color-foreground)',
            borderBottomRightRadius: '4px',
          } : {
            background: 'var(--color-panel)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--color-foreground)',
            borderBottomLeftRadius: '4px',
          }}
        >
          <span style={{ whiteSpace: 'pre-wrap' }}>{message.content}</span>
          {/* Streaming cursor */}
          {isStreaming && (
            <span
              className="inline-block w-[2px] h-[14px] ml-0.5 align-middle animate-pulse"
              style={{ background: 'var(--color-brand)', borderRadius: '1px' }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Agent mention cards — only on complete assistant messages */}
        {!isUser && !isStreaming && mentions.length > 0 && (
          <div className="w-full flex flex-col gap-1.5 mt-1">
            {mentions.map(agent => (
              <AgentMentionCard key={agent.slug} slug={agent.slug} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
