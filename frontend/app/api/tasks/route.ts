import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser, unauthorized, forbidden, badRequest } from '@/lib/auth'

const VALID_STATUSES = new Set(['backlog', 'in-progress', 'complete', 'error'])

// GET /api/tasks?workspace_id=xxx  &status=in-progress  &agent_slug=atlas
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const workspace_id = searchParams.get('workspace_id')
  const status       = searchParams.get('status')
  const agent_slug   = searchParams.get('agent_slug')

  if (!workspace_id) return badRequest('workspace_id required')

  // Ownership check
  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspace_id)
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!ws) return forbidden()

  let query = supabase
    .from('tasks')
    .select('*')
    .eq('workspace_id', workspace_id)
    .order('created_at', { ascending: false })
  if (status)     query = query.eq('status', status)
  if (agent_slug) query = query.eq('agent_slug', agent_slug)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: 'Failed to fetch tasks.' }, { status: 500 })
  return NextResponse.json({ tasks: data ?? [] })
}

// POST /api/tasks   body: { workspace_id, agent_slug, title, input? }
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { workspace_id, agent_slug, title, input } = await req.json()
  if (!workspace_id || !agent_slug || !title) {
    return badRequest('workspace_id, agent_slug, title required')
  }

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspace_id)
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!ws) return forbidden()

  const { data, error } = await supabase
    .from('tasks')
    .insert({ workspace_id, agent_slug, title, input: input ?? null, status: 'in-progress' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 })
  return NextResponse.json({ task: data }, { status: 201 })
}

// PATCH /api/tasks   body: { id, status, output? }
export async function PATCH(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { id, status, output } = await req.json()
  if (!id || !status) return badRequest('id and status required')

  // ✅ Status enum guard
  if (!VALID_STATUSES.has(status)) {
    return badRequest('status must be one of: backlog, in-progress, complete, error')
  }

  // Ownership check — fetch the task's workspace and verify it belongs to user
  const { data: task } = await supabase
    .from('tasks')
    .select('workspace_id')
    .eq('id', id)
    .maybeSingle()

  if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 })

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', task.workspace_id)
    .eq('owner_id', user.id)
    .maybeSingle()
  if (!ws) return forbidden()

  const { data, error } = await supabase
    .from('tasks')
    .update({
      status,
      output: output ?? null,
      completed_at: status === 'complete'
        ? new Date().toISOString()
        : null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 })
  return NextResponse.json({ task: data })
}
