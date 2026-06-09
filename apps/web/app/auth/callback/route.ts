import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Exchanges the Supabase PKCE code for a session.
 *
 * Critical: we must capture the session cookies that Supabase sets during
 * exchangeCodeForSession and explicitly attach them to the redirect response.
 * Using createClient() (which writes to Next.js cookieStore) and returning
 * NextResponse.redirect() can lose cookies if Next.js doesn't merge them.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const cookieStore = await cookies()
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
            // Capture session cookies to attach to the redirect response
            cs.forEach(({ name, value, options }) => {
              pendingCookies.push({ name, value, options: options ?? {} })
            })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('provider_id', session.user.id)
        .single()

      const redirectTo = user ? `${origin}/fr` : `${origin}/fr/onboarding`
      const response = NextResponse.redirect(redirectTo)

      // Attach session cookies to the response so the browser is logged in
      pendingCookies.forEach(({ name, value, options }) => {
        response.cookies.set(
          name,
          value,
          options as Parameters<typeof response.cookies.set>[2]
        )
      })

      return response
    }
  }

  return NextResponse.redirect(`${origin}/fr/login`)
}
