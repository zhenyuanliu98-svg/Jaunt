import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Only throw error at runtime, not during build
// During build, Next.js collects page data but we don't need actual DB connections
if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    throw new Error('Supabase environment variables are not configured')
  }
}

// Create a placeholder client during build, real client at runtime
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: { autoRefreshToken: false, persistSession: false }
  }
)
