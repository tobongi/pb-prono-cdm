'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { Flag } from '@/components/flag'
import { ScoreInput } from '@/components/score-input'
import { ConfirmationOverlay } from '@/components/confirmation-overlay'
import { fetchMatches, type Match } from '@/lib/api'

export default function MatchPredictionPage() {
  const t = useTranslations('match')
  const router = useRouter()
  const { matchId } = useParams<{ matchId: string }>()

  const [match, setMatch] = useState<Match | null>(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [existing, setExisting] = useState<{ home: number; away: number } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchMatches().then(matches => {
      const m = matches.find(m => String(m.num) === matchId)
      if (m) setMatch(m)
    }).catch(() => {/* proxy unavailable — match stays null */})

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: userRow } = await supabase
        .from('users').select('id').eq('provider_id', session.user.id).single()
      if (!userRow) return

      const { data: pred } = await supabase
        .from('predictions')
        .select('home_score_pred, away_score_pred')
        .eq('user_id', userRow.id)
        .eq('match_id', matchId)
        .single()

      if (pred) {
        setHomeScore(pred.home_score_pred)
        setAwayScore(pred.away_score_pred)
        setExisting({ home: pred.home_score_pred, away: pred.away_score_pred })
      }
    })
  }, [matchId])

  const isLocked = match?.status === 'live' || match?.status === 'finished'

  function getPredictedResult(): 'home' | 'draw' | 'away' {
    if (homeScore > awayScore) return 'home'
    if (homeScore < awayScore) return 'away'
    return 'draw'
  }

  async function handleSubmit() {
    if (isLocked || !match) return
    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      setSaving(false)
      router.push('/fr/login')
      return
    }

    const { data: userRow } = await supabase
      .from('users').select('id').eq('provider_id', session.user.id).single()
    if (!userRow) { setSaving(false); return }

    const kickoffDate = new Date(`${match.date}T${match.time ?? '21:00'}:00Z`)

    await supabase.from('predictions').upsert({
      user_id: userRow.id,
      match_id: matchId,
      home_score_pred: homeScore,
      away_score_pred: awayScore,
      predicted_result: getPredictedResult(),
      locked_at: kickoffDate.toISOString(),
    }, { onConflict: 'user_id,match_id' })

    setSaving(false)
    setSaved(true)
  }

  if (!match) {
    return <div className="min-h-screen bg-bg-dark flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  }

  const resultLabel = homeScore > awayScore
    ? `${match.team1.name} gagne`
    : homeScore < awayScore
    ? `${match.team2.name} gagne`
    : 'Match nul'

  const kickoffStr = new Date(`${match.date}T${match.time ?? '21:00'}:00Z`)
    .toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })

  return (
    <main className="min-h-screen bg-bg-dark px-4 py-6 pb-24 max-w-lg mx-auto">
      {saved && (
        <ConfirmationOverlay
          homeScore={homeScore}
          awayScore={awayScore}
          homeName={match.team1.code}
          awayName={match.team2.code}
          lockedUntil={kickoffStr}
          onBack={() => router.push('/fr/pronos')}
        />
      )}

      <button
        onClick={() => router.back()}
        className="text-beige mb-6 flex items-center gap-2"
      >
        ← {match.group ?? match.round} · {new Date(match.date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </button>

      <div className="bg-bg-card rounded-xl p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team1.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team1.code}</span>
            <span className="text-xs text-beige">{match.team1.name}</span>
          </div>

          {isLocked && match.score ? (
            <span className="font-display text-3xl text-cream">
              {match.score.ft[0]} – {match.score.ft[1]}
            </span>
          ) : (
            <span className="text-beige text-sm">VS</span>
          )}

          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team2.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team2.code}</span>
            <span className="text-xs text-beige">{match.team2.name}</span>
          </div>
        </div>

        <div className="border-t border-olive pt-4">
          <p className="text-center text-beige text-xs uppercase tracking-widest mb-4">
            {t('your_prono')}
          </p>
          <p className="text-center text-cream text-sm mb-4">{t('choose_score')}</p>

          <div className="flex items-center justify-center gap-8">
            <ScoreInput value={homeScore} onChange={setHomeScore} disabled={isLocked} />
            <span className="font-display text-2xl text-muted">–</span>
            <ScoreInput value={awayScore} onChange={setAwayScore} disabled={isLocked} />
          </div>

          {!isLocked && (
            <p className="text-center text-beige text-sm mt-4">
              {`Résultat prévu :`} <span className="text-cream font-display">{resultLabel}</span>
            </p>
          )}
        </div>

        {!isLocked && (
          <>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50"
            >
              {saving ? '...' : existing ? 'MODIFIER MON PRONO →' : t('validate')}
            </button>
            <p className="text-center text-muted text-xs">
              {t('closes_at')} {kickoffStr}
            </p>
          </>
        )}

        {isLocked && (
          <div className="text-center py-2 border border-muted rounded-xl">
            <span className="text-muted font-display uppercase">{t('locked')}</span>
          </div>
        )}
      </div>
    </main>
  )
}
