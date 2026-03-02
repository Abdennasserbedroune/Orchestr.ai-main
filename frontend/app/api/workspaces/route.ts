import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getAuthUser, unauthorized, badRequest } from '@/lib/auth'

const SLUG_REGEX = /^[a-z0-9-]+$/

// POST /api/workspaces — called by frontend right after signUp()
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body.')
  }

  const slug = (body.slug as string | undefined)?.trim()
  const name = (body.name as string | undefined)?.trim()

  // 1 — slug format
  if (!slug || slug.length < 3 || slug.length > 30 || !SLUG_REGEX.test(slug)) {
    return badRequest(
      'Invalid slug format. Use lowercase letters, numbers, and hyphens only.'
    )
  }

  // 2 — name
  if (!name || name.length === 0 || name.length > 60) {
    return badRequest('Name is required.')
  }

  // 3 — slug uniqueness
  const { data: existing } = await supabase
    .from('workspaces')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'Workspace slug is already taken.' },
      { status: 409 }
    )
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({ owner_id: user.id, name, slug })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create workspace.' }, { status: 500 })
  }
  return NextResponse.json({ workspace: data }, { status: 201 })
}

// GET /api/workspaces — returns current user's workspace (used as /me)
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req)
  if (!user) return unauthorized()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch workspace.' }, { status: 500 })
  }
  // 200 with null — frontend handles onboarding redirect
  return NextResponse.json({ workspace: data ?? null })
}
