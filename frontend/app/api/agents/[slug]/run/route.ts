export const runtime = 'edge'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { AGENTS_CATALOG } from '@/lib/agents-data'
import { MOCK_TYPEWRITER_RESPONSES } from '@/lib/mock-data'

// POST /api/agents/[slug]/run
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const input        = typeof body.input === 'string' ? body.input.trim() : ''
  const workspace_id = typeof body.workspace_id === 'string' ? body.workspace_id : null

  if (!input) {
    return NextResponse.json({ error: 'input is required' }, { status: 400 })
  }

  const agent = AGENTS_CATALOG.find(a => a.slug === slug)
  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  const responses = MOCK_TYPEWRITER_RESPONSES as Record<string, string>
  const text = responses[agent.domain] ?? responses['default'] ?? 'Processing your request...'

  // Fire-and-forget — insert task first to capture its id, then link activity_log.
  // This sequence is intentional: activity_log.metadata.task_id must match
  // the real task UUID so DELETE /api/tasks/[id] can cascade-clean activity rows.
  // Never await — must not block or crash the stream.
  if (workspace_id) {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      try {
        const { data: newTask } = await client
          .from('tasks')
          .insert({
            workspace_id,
            agent_slug: slug,
            title: input.slice(0, 120),
            status: 'complete',
            input,
            output: text,
          })
          .select('id')
          .single()

        // Only insert activity if we have a real task id to link
        if (newTask?.id) {
          await client.from('activity_log').insert({
            workspace_id,
            agent_slug: slug,
            action: `Ran task: ${input.slice(0, 80)}`,
            metadata: {
              source: 'agent_run',
              task_id: newTask.id,   // ✔ DELETE /api/tasks/[id] uses this to clean up
            },
          })
        }
      } catch {
        // Intentionally swallowed — never propagate to the stream
      }
    })()
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      for (const char of text) {
        controller.enqueue(encoder.encode(char))
        await new Promise<void>(r => setTimeout(r, 18))
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
