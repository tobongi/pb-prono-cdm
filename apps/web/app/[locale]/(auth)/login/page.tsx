'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)
  const [loading, setLoading] = useState<'google' | 'instagram' | 'tiktok' | null>(null)

  // Show errors passed via URL params (e.g. ?error=instagram_failed from server route)
  useEffect(() => {
    const err = searchParams.get('error')
    if (err) setAuthError(`Erreur: ${err}`)
  }, [searchParams])

  async function signInWithGoogle() {
    setAuthError(null)
    setLoading('google')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('[Google OAuth error]', error)
      setAuthError(error.message)
      setLoading(null)
    }
  }

  async function signInWithInstagram() {
    setAuthError(null)
    setLoading('instagram')
    // Use skipBrowserRedirect:true so Supabase returns the URL without navigating.
    // Then we do a hard window.location.href — a direct user-gesture navigation that
    // works on iOS PWA standalone mode and bypasses Next.js router interception.
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
      },
    })
    if (error || !data?.url) {
      console.error('[Instagram OAuth error]', error)
      setAuthError(error?.message ?? 'Erreur Instagram, réessaie.')
      setLoading(null)
      return
    }
    // Hard navigation — follows the full redirect chain (Supabase → Facebook) in-tab
    window.location.href = data.url
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative pb-pattern-bg">
      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm">
        <img src="/pb-logo-blanc.png" alt="PB Poulet Braisé" className="w-32 h-32" />

        <div className="text-center">
          <p className="text-beige text-xs uppercase tracking-[0.3em] mb-2">{t('tagline')}</p>
          <h1 className="font-display text-4xl text-cream uppercase leading-tight">{t('title')}</h1>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading !== null}
            className="flex items-center justify-center gap-3 bg-cream text-bg-dark font-display text-lg uppercase px-6 py-4 rounded-xl hover:bg-beige transition-colors disabled:opacity-60"
          >
            {loading === 'google' ? (
              <span className="w-5 h-5 border-2 border-bg-dark/30 border-t-bg-dark rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {t('google')}
          </button>

          {/* Instagram (Facebook OAuth) — client-side skipBrowserRedirect + window.location.href */}
          <button
            onClick={signInWithInstagram}
            disabled={loading !== null}
            className="flex items-center justify-center gap-3 text-white font-display text-lg uppercase px-6 py-4 rounded-xl transition-colors disabled:opacity-60"
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            }}
          >
            {loading === 'instagram' ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            )}
            {t('instagram')}
          </button>

          {/* TikTok — server route (hard navigation via window.location.href) */}
          <button
            onClick={() => { window.location.href = '/auth/tiktok' }}
            disabled={loading !== null}
            className="flex items-center justify-center gap-3 bg-[#010101] text-white font-display text-lg uppercase px-6 py-4 rounded-xl hover:bg-[#1a1a1a] border border-white/10 transition-colors disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.75a8.19 8.19 0 004.79 1.54V6.83a4.85 4.85 0 01-1.02-.14z"/>
            </svg>
            {t('tiktok')}
          </button>
        </div>

        {authError && (
          <p className="text-red-400 text-xs text-center bg-red-400/10 px-4 py-2 rounded-lg">{authError}</p>
        )}

        <p className="text-muted text-xs">{t('free_game')}</p>

        {/* Legal links */}
        <div className="flex items-center gap-3 text-[10px] text-muted/60">
          <a href="/fr/privacy" className="hover:text-beige transition-colors underline underline-offset-2">
            Politique de confidentialité
          </a>
          <span>·</span>
          <a href="/fr/data-deletion" className="hover:text-beige transition-colors underline underline-offset-2">
            Suppression des données
          </a>
        </div>
      </div>
    </div>
  )
}
