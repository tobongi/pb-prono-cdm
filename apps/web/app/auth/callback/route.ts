import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)

    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('provider_id', session.user.id)
        .single()

      if (!user) {
        return NextResponse.redirect(`${origin}/fr/onboarding`)
      }
      return NextResponse.redirect(`${origin}/fr`)
    }
  }

  return NextResponse.redirect(`${origin}/fr/login`)
}
