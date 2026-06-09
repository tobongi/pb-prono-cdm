import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    console.error('[Instagram OAuth]', error)
    return NextResponse.redirect(`${origin}/fr/login?error=instagram_failed`)
  }

  return NextResponse.redirect(data.url)
}
