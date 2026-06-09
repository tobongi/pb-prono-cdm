import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Derives a deterministic Supabase password from the TikTok open_id.
 * Never changes for the same user, so subsequent logins always work.
 */
function derivePassword(openId: string): string {
  const secret = process.env.TIKTOK_BRIDGE_SECRET ?? 'pb-prono-tiktok-bridge-secret'
  return createHmac('sha256', secret).update(openId).digest('hex')
}

async function exchangeCodeForToken(code: string, redirectUri: string) {
  const res = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  })
  return res.json() as Promise<{
    access_token?: string
    open_id?: string
    error?: string
    error_description?: string
  }>
}

async function getTikTokUserInfo(accessToken: string) {
  const res = await fetch(
    'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )
  return res.json() as Promise<{
    data?: { user?: { open_id: string; display_name: string; avatar_url: string } }
    error?: { code: string; message: string }
  }>
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const errorParam = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin
  const loginUrl = `${origin}/fr/login`

  // User denied TikTok permission
  if (errorParam || !code) {
    return NextResponse.redirect(`${loginUrl}?error=tiktok_denied`)
  }

  // Validate CSRF state
  const cookieStore = await cookies()
  const savedState = cookieStore.get('tiktok_state')?.value
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${loginUrl}?error=tiktok_invalid_state`)
  }

  const redirectUri = `${appUrl}/auth/tiktok/callback`

  // 1. Exchange code for access token
  const tokenData = await exchangeCodeForToken(code, redirectUri)
  if (!tokenData.access_token || !tokenData.open_id) {
    console.error('[TikTok callback] token exchange failed:', tokenData)
    return NextResponse.redirect(`${loginUrl}?error=tiktok_token_failed`)
  }

  const { access_token: accessToken, open_id: openId } = tokenData

  // 2. Fetch TikTok user profile
  const userInfo = await getTikTokUserInfo(accessToken)
  const tiktokUser = userInfo?.data?.user
  if (!tiktokUser) {
    console.error('[TikTok callback] user info failed:', userInfo)
    return NextResponse.redirect(`${loginUrl}?error=tiktok_user_failed`)
  }

  const { display_name: displayName, avatar_url: avatarUrl } = tiktokUser

  // 3. Bridge to Supabase Auth
  // We create a virtual email/password account for each TikTok user.
  // The password is HMAC-derived from open_id — deterministic, server-only.
  const bridgeEmail = `tiktok.${openId}@pb-prono.internal`
  const bridgePassword = derivePassword(openId)
  const adminClient = createAdminClient()

  // Try to create Supabase Auth user (silently ignore "already exists" error)
  await adminClient.auth.admin.createUser({
    email: bridgeEmail,
    password: bridgePassword,
    email_confirm: true, // skip email verification
    user_metadata: {
      provider: 'tiktok',
      tiktok_open_id: openId,
      display_name: displayName,
      avatar_url: avatarUrl ?? null,
      full_name: displayName,
    },
  })

  // 4. Sign in with derived credentials → Supabase sets session cookies
  const supabase = await createClient()
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: bridgeEmail,
    password: bridgePassword,
  })

  if (signInError || !signInData.session) {
    console.error('[TikTok callback] signIn failed:', signInError)
    return NextResponse.redirect(`${loginUrl}?error=tiktok_signin_failed`)
  }

  // 5. Check if user has completed onboarding (exists in public.users)
  const supabaseUserId = signInData.session.user.id

  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('provider_id', supabaseUserId)
    .single()

  if (!existingUser) {
    // New user → onboarding to pick pseudo
    return NextResponse.redirect(`${origin}/fr/onboarding`)
  }

  return NextResponse.redirect(`${origin}/fr`)
}
