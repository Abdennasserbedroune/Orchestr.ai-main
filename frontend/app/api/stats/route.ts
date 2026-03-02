import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser, unauthorized, forbidden, badRequest } from '@/lib/auth'

// GET /api/stats?workspace_id=xxx
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { searchParams } = new URL(req.url)
  const workspace_id = searchParams.get('workspace_id')
  if (!workspace_id) return badRequest('workspace_id required')

  // Verify ownership before running queries
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspace_id)
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!workspace) return forbidden()

  const [
    totalResult,
    completedResult,
    activeResult,
    errorResult,
    stackResult,
    activityResult,
  ] = await Promise.all([
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id)
      .eq('status', 'complete'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id)
      .eq('status', 'in-progress'),
    supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id)
      .eq('status', 'error'),
    supabase
      .from('user_stack')
      .select('*', { count: 'exact', head: true })
      .eq('workspace_id', workspace_id),
    supabase
      .from('activity_log')
      .select('*')
      .eq('workspace_id', workspace_id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  if (
    totalResult.error ||
    completedResult.error ||
    activeResult.error ||
    errorResult.error ||
    stackResult.error ||
    activityResult.error
  ) {
    return NextResponse.json({ error: 'Failed to load stats.' }, { status: 500 })
  }

  const totalTasks     = totalResult.count     ?? 0
  const completedTasks = completedResult.count  ?? 0
  const activeTasks    = activeResult.count     ?? 0
  const errorTasks     = errorResult.count      ?? 0

  return NextResponse.json({
    totalTasks,
    completedTasks,
    activeTasks,
    errorTasks,
    backlogTasks: totalTasks - completedTasks - activeTasks - errorTasks,
    agentsInStack: stackResult.count ?? 0,
    recentActivity: activityResult.data ?? [],
  })
}
