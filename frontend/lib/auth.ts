import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from './supabase'

export async function getAuthUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await client.auth.getUser(token)
  return user ?? null
}

export async function validateWorkspaceOwnership(
  workspace_id: string,
  user_id: string
): Promise<boolean> {
  const { data } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspace_id)
    .eq('owner_id', user_id)
    .maybeSingle()
  return !!data
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
export function forbidden() {
  return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
}
export function notFound(msg = 'Not found.') {
  return NextResponse.json({ error: msg }, { status: 404 })
}
export function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 })
}
