import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser, unauthorized, forbidden, notFound } from '@/lib/auth'

// GET /api/workspaces/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch workspace.' }, { status: 500 })
  }
  if (!data) return notFound('Workspace not found.')
  if (data.owner_id !== user.id) return forbidden()

  return NextResponse.json({ workspace: data })
}
