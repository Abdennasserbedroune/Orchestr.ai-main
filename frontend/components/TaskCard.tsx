import { DOMAIN_META } from '@/lib/mock-data'
import type { MockTask } from '@/lib/mock-data'

interface TaskCardProps {
  task: MockTask
}

const PRIORITY_STYLES: Record<MockTask['priority'], { color: string; bg: string; border: string; label: string }> = {
  high:   { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)',   label: 'High'   },
  medium: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)',  label: 'Medium' },
  low:    { color: '#4B5563', bg: 'rgba(75,85,99,0.08)',    border: 'rgba(75,85,99,0.2)',    label: 'Low'    },
}

export function TaskCard({ task }: TaskCardProps) {
  const meta     = DOMAIN_META[task.domain]
  const priority = PRIORITY_STYLES[task.priority]
  const AgentIcon = meta.icon

  return (
    <div
      className="card group relative overflow-hidden transition-all duration-200"
      style={{ padding: '14px 14px 14px 18px' }}
    >
      {/* Domain accent bar — left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full"
        style={{ background: meta.color }}
      />

      {/* Agent row */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex items-center justify-center w-5 h-5 rounded-md flex-shrink-0"
          style={{ background: meta.bg, border: `1px solid ${meta.color}40` }}
        >
          <AgentIcon size={10} style={{ color: meta.color }} />
        </div>
        <span className="font-mono text-2xs text-muted tracking-wider uppercase">
          {task.agentName}
        </span>
      </div>

      {/* Task title */}
      <p className="text-sm font-medium text-foreground leading-snug">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span
          className="chip text-2xs py-0.5 px-2"
          style={{
            color: priority.color,
            background: priority.bg,
            borderColor: priority.border,
          }}
        >
          {priority.label}
        </span>
        <span className="font-mono text-2xs text-subtle">{task.createdAt}</span>
      </div>
    </div>
  )
}

export default TaskCard
