import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// During build time, we allow placeholder values to enable static generation
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.NEXT_RUNTIME
const hasValidConfig = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.')
}

// Create a mock client for build time if using placeholder values
function createMockClient() {
  return {
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      limit: () => ({ data: null, error: null }),
      order: () => ({ data: null, error: null }),
      maybeSingle: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      contains: () => ({ data: null, error: null }),
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    },
  } as unknown as ReturnType<typeof createClient>
}

export const supabase = (isBuildTime && !hasValidConfig) 
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export type Profile = {
  id: string          // same as auth.users.id (UUID)
  full_name: string | null
  username: string | null
  avatar_url: string | null
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}
