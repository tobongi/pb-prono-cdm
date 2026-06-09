import { NextResponse } from 'next/server'

// Force dynamic — this route reads env vars and sets cookies at runtime
export const dynamic = 'force-dynamic'

/**
 * GET /auth/tiktok
 * Redirects user to TikTok OAuth authorization page.
 */
export async function GET(request: Request) {
  const { origin } = new URL(request.url)
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin

  if (!clientKey) {
    return NextResponse.redirect(`${appUrl}/fr/login?error=tiktok_not_configured`)
  }

  const state = crypto.randomUUID()
  const redirectUri = `${appUrl}/auth/tiktok/callback`


  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.searchParams.set('client_key', clientKey)
  url.searchParams.set('scope', 'user.info.basic')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  const response = NextResponse.redirect(url.toString())
  response.cookies.set('tiktok_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  })
  return response
}
