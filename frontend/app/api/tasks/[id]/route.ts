import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser, unauthorized, forbidden, notFound } from '@/lib/auth'
import type { Task } from '@/lib/supabase'

// Internal: fetch task and verify it belongs to the requesting user
async function resolveTaskWithOwnership(
  taskId: string,
  userId: string
): Promise<{ task: Task | null; reason: 'not_found' | 'forbidden' | null }> {
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .maybeSingle()

  if (error || !task) return { task: null, reason: 'not_found' }

  const { data: ws } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', task.workspace_id)
    .eq('owner_id', userId)
    .maybeSingle()

  if (!ws) return { task: null, reason: 'forbidden' }
  return { task: task as Task, reason: null }
}

// GET /api/tasks/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { task, reason } = await resolveTaskWithOwnership(params.id, user.id)
  if (reason === 'not_found') return notFound('Task not found.')
  if (reason === 'forbidden') return forbidden()

  return NextResponse.json({ task })
}

// DELETE /api/tasks/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { task, reason } = await resolveTaskWithOwnership(params.id, user.id)
  if (reason === 'not_found') return notFound('Task not found.')
  if (reason === 'forbidden') return forbidden()

  // Delete related activity_log entries stored with task_id in metadata
  await supabase
    .from('activity_log')
    .delete()
    .eq('workspace_id', task!.workspace_id)
    .contains('metadata', { task_id: task!.id })

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete task.' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
