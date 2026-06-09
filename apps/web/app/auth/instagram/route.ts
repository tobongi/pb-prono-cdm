import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /auth/instagram
 *
 * Initiates Facebook (Instagram-branded) OAuth via a server-side redirect.
 * Using a server route instead of a client-side onClick avoids async-redirect
 * issues on mobile Safari.
 *
 * Critical: we must collect the PKCE code_verifier cookies that Supabase sets
 * during signInWithOAuth and explicitly attach them to the redirect response.
 * If we use createClient() (which writes to Next.js cookieStore) and then return
 * NextResponse.redirect(), the cookies end up on the internal context, NOT on
 * the response the browser receives → exchangeCodeForSession fails silently.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const cookieStore = await cookies()

  // Collect cookies Supabase wants to set (PKCE code_verifier, etc.)
  const pendingCookies: Array<{
    name: string
    value: string
    options: Record<string, unknown>
  }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => {
          // Capture instead of writing to cookieStore — we'll attach to the response
          cs.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options: options ?? {} })
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      // Use origin from request (www.pbprono.online) — must match Supabase allow-list
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
    },
  })

  if (error || !data.url) {
    console.error('[Instagram OAuth]', error)
    return NextResponse.redirect(`${origin}/fr/login?error=instagram_failed`)
  }

  const response = NextResponse.redirect(data.url)

  // Attach PKCE cookies to the actual response the browser receives
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(
      name,
      value,
      options as Parameters<typeof response.cookies.set>[2]
    )
  })

  return response
}
