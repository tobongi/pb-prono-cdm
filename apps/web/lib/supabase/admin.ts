import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using Service Role Key — server-side only, never expose to client.
 * Used for TikTok bridge: creating/confirming users without email verification.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
