'use client'
import { useTranslations } from 'next-intl'

interface ConfirmationOverlayProps {
  homeScore: number
  awayScore: number
  homeName: string
  awayName: string
  lockedUntil: string
  onNext?: () => void
  onBack: () => void
}

export function ConfirmationOverlay({
  homeScore, awayScore, homeName, awayName,
  lockedUntil, onNext, onBack
}: ConfirmationOverlayProps) {
  const t = useTranslations('prono')

  return (
    <div className="fixed inset-0 bg-bg-dark/95 z-50 flex flex-col items-center justify-center px-6 gap-8">
      <div className="w-20 h-20 rounded-full bg-gold flex items-center justify-center">
        <span className="text-4xl text-bg-dark">✓</span>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl text-cream uppercase mb-2">{t('saved')}</h2>
        <p className="text-beige text-lg font-display">
          {homeName} {homeScore} – {awayScore} {awayName}
        </p>
        <p className="text-muted text-sm mt-2">
          {t('modifiable_until')} {lockedUntil}
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {onNext && (
          <button
            onClick={onNext}
            className="bg-gold text-bg-dark font-display text-lg uppercase py-4 rounded-xl"
          >
            {t('next_prono')}
          </button>
        )}
        <button
          onClick={onBack}
          className="text-beige font-display text-lg uppercase py-4 border border-olive rounded-xl"
        >
          {t('back')}
        </button>
      </div>
    </div>
  )
}
