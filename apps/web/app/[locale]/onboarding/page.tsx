'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { getDeviceFingerprint } from '@/lib/device-fp'

export default function OnboardingPage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const [pseudo, setPseudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pseudo.length < 2) return setError('Minimum 2 caractères')
    setLoading(true)

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setLoading(false)
      return router.push('/fr/login')
    }

    const rawProvider = session.user.app_metadata.provider
    if (rawProvider !== 'google' && rawProvider !== 'facebook') {
      setError('Fournisseur OAuth non supporté.')
      setLoading(false)
      return
    }
    const provider = rawProvider as 'google' | 'facebook'

    const { error: insertError } = await supabase.from('users').insert({
      provider,
      provider_id: session.user.id,
      pseudo: pseudo.trim(),
      avatar_url: session.user.user_metadata.avatar_url,
      device_fp: getDeviceFingerprint(),
    })

    if (insertError) {
      setError('Ce pseudo est peut-être déjà pris, essaies-en un autre.')
      setLoading(false)
      return
    }

    router.push('/fr')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-pattern-bg relative">
      <div className="absolute inset-0 bg-black/55" />
      <div className="relative z-10 w-full max-w-sm flex flex-col gap-6">
        <h1 className="font-display text-3xl text-cream uppercase text-center">{t('title')}</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            placeholder={t('placeholder')}
            maxLength={20}
            className="bg-bg-card text-cream px-4 py-3 rounded-xl border border-olive focus:border-gold outline-none font-body"
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50"
          >
            {loading ? '...' : t('cta')}
          </button>
        </form>
      </div>
    </div>
  )
}
