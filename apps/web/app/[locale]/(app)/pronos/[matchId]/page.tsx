'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flag } from '@/components/flag'
import { ScoreInput } from '@/components/score-input'
import { fetchMatches, type Match } from '@/lib/api'
import Link from 'next/link'

export default function MatchPredictionPage() {
  const router = useRouter()
  const { matchId, locale } = useParams<{ matchId: string; locale: string }>()

  const [match, setMatch] = useState<Match | null>(null)
  const [homeScore, setHomeScore] = useState(0)
  const [awayScore, setAwayScore] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [existing, setExisting] = useState<{ home: number; away: number } | null>(null)
  const [changeCount, setChangeCount] = useState(0)
  const [countdown, setCountdown] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchMatches().then(matches => {
      const m = matches.find(m => String(m.num) === matchId)
      if (m) setMatch(m)
    }).catch(() => {})

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data: userRow } = await supabase
        .from('users').select('id').eq('provider_id', session.user.id).single()
      if (!userRow) return

      const { data: pred } = await supabase
        .from('predictions')
        .select('home_score_pred, away_score_pred, change_count')
        .eq('user_id', userRow.id)
        .eq('match_id', matchId)
        .single()

      if (pred) {
        setHomeScore(pred.home_score_pred)
        setAwayScore(pred.away_score_pred)
        setExisting({ home: pred.home_score_pred, away: pred.away_score_pred })
        setChangeCount(pred.change_count ?? 0)
      }
    })
  }, [matchId])

  useEffect(() => {
    if (!match || match.status !== 'upcoming') return
    function update() {
      const kickoff = new Date(`${match!.date}T${(match!.time ?? '21:00').replace(/ UTC[-+]\d+/g, '')}:00Z`)
      const diff = kickoff.getTime() - Date.now()
      if (diff <= 0) { setCountdown(''); return }
      const j = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${j}j ${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`)
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [match])

  const isLocked = match?.status === 'live' || match?.status === 'finished'
  const canChange = !existing || changeCount < 2

  // Sanitize match.time — strip timezone suffix like "UTC+3", "UTC-5", etc.
  function getCleanTime(raw?: string): string {
    return (raw ?? '21:00').replace(/\s*UTC[+-]\d+/gi, '').trim() || '21:00'
  }

  function getPredictedResult(): 'home' | 'draw' | 'away' {
    if (homeScore > awayScore) return 'home'
    if (homeScore < awayScore) return 'away'
    return 'draw'
  }

  async function handleSubmit() {
    if (isLocked || !match || !canChange) return
    setSaving(true)
    setSubmitError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push(`/${locale}/login`); return }

      const { data: userRow } = await supabase
        .from('users').select('id').eq('provider_id', session.user.id).single()
      if (!userRow) { setSubmitError('Erreur de connexion. Reconnecte-toi.'); return }

      const cleanTime = getCleanTime(match.time)
      const kickoffDate = new Date(`${match.date}T${cleanTime}:00Z`)
      // Safety: if date is still invalid, use far-future fallback
      const lockedAt = isNaN(kickoffDate.getTime())
        ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        : kickoffDate.toISOString()

      const newChangeCount = existing ? changeCount + 1 : 0

      const { error } = await supabase.from('predictions').upsert({
        user_id: userRow.id,
        match_id: matchId,
        home_score_pred: homeScore,
        away_score_pred: awayScore,
        predicted_result: getPredictedResult(),
        locked_at: lockedAt,
        change_count: newChangeCount,
      }, { onConflict: 'user_id,match_id' })

      if (error) {
        console.error('Upsert error:', error)
        setSubmitError('Erreur lors de l\'enregistrement. Réessaie.')
        return
      }

      setChangeCount(newChangeCount)
      setSaved(true)
    } catch (err) {
      console.error('handleSubmit unexpected error:', err)
      setSubmitError('Erreur inattendue. Réessaie.')
    } finally {
      setSaving(false)
    }
  }

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const kickoffStr = new Date(`${match.date}T${getCleanTime(match.time)}:00Z`)
    .toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

  // ─── SUCCESS PAGE ──────────────────────────────────────────────────────────
  if (saved) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pb-24 gap-8">
        {/* Big checkmark */}
        <div className="w-28 h-28 rounded-full bg-gold flex items-center justify-center shadow-[0_0_40px_rgba(212,168,83,0.5)]">
          <svg className="w-14 h-14 text-bg-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center flex flex-col gap-2">
          <p className="text-gold text-xs uppercase tracking-[0.3em]">
            {existing && changeCount > 0 ? 'PRONO MODIFIÉ' : 'PRONO ENREGISTRÉ'}
          </p>
          <h1 className="font-display text-4xl text-cream uppercase leading-tight">
            {existing && changeCount > 0 ? 'Ton prono a\nété mis à jour !' : 'Ton prono est\nbien enregistré !'}
          </h1>
        </div>

        {/* Score recap */}
        <div className="bg-bg-card rounded-2xl px-8 py-5 flex items-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <Flag code={match.team1.code} size="lg" />
            <span className="font-display text-sm text-cream">{match.team1.code}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-5xl text-gold">{homeScore} – {awayScore}</span>
            <span className="text-muted text-xs uppercase tracking-wide">Ton pronostic</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Flag code={match.team2.code} size="lg" />
            <span className="font-display text-sm text-cream">{match.team2.code}</span>
          </div>
        </div>

        {/* Info */}
        <div className="text-center flex flex-col gap-1">
          <p className="text-beige text-sm">🔒 Prono verrouillé au coup d&apos;envoi</p>
          <p className="text-muted text-xs">{kickoffStr}</p>
          {changeCount < 2 && (
            <p className="text-gold text-xs mt-1">
              Tu peux encore modifier {2 - changeCount} fois avant le coup d&apos;envoi
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href={`/${locale}/calendrier`}
            className="bg-gold text-bg-dark font-display text-lg uppercase py-4 rounded-xl text-center hover:brightness-110 transition"
          >
            🎯 PRONOSTIQUER UN AUTRE MATCH
          </Link>
          <Link
            href={`/${locale}/classement`}
            className="border border-gold/40 text-cream font-display text-base uppercase py-3 rounded-xl text-center hover:border-gold transition"
          >
            🏆 VOIR LE CLASSEMENT
          </Link>
          <button
            onClick={() => setSaved(false)}
            className="text-muted text-sm py-2"
          >
            ← Modifier mon prono
          </button>
        </div>
      </main>
    )
  }

  // ─── FORM ──────────────────────────────────────────────────────────────────
  const resultLabel = homeScore > awayScore
    ? `${match.team1.name} gagne`
    : homeScore < awayScore ? `${match.team2.name} gagne` : 'Match nul'

  return (
    <main className="min-h-screen px-4 py-6 pb-24 max-w-lg mx-auto">
      <button onClick={() => router.back()} className="text-beige mb-6 flex items-center gap-2 text-sm">
        ← {match.group ?? match.round} · {new Date(match.date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })}
      </button>

      <div className="bg-bg-card rounded-xl p-6 flex flex-col gap-6">
        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team1.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team1.code}</span>
            <span className="text-xs text-beige">{match.team1.name}</span>
          </div>
          {isLocked && match.score ? (
            <span className="font-display text-3xl text-cream">{match.score.ft[0]} – {match.score.ft[1]}</span>
          ) : (
            <span className="text-beige text-sm">VS</span>
          )}
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <Flag code={match.team2.code} size="lg" />
            <span className="font-display text-xl text-cream">{match.team2.code}</span>
            <span className="text-xs text-beige">{match.team2.name}</span>
          </div>
        </div>

        {/* Countdown */}
        {!isLocked && countdown && (
          <div className="border-t border-white/10 pt-4 text-center">
            <p className="text-beige text-[10px] uppercase tracking-widest mb-3">COUP D&apos;ENVOI DANS</p>
            <div className="flex justify-center gap-4">
              {countdown.split(' ').map((part, i) => {
                const val = part.replace(/[jhmns]/g,'')
                const unit = ['JOURS','HRS','MIN','SEC'][i] ?? ''
                return (
                  <div key={i} className="flex flex-col items-center">
                    <span className="font-display text-3xl text-cream">{val}</span>
                    <span className="text-muted text-[9px] uppercase tracking-wide">{unit}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Score inputs */}
        <div className="border-t border-white/10 pt-4">
          <p className="text-center text-gold text-[10px] uppercase tracking-widest mb-1">TON PRONOSTIC</p>
          <p className="text-center text-beige text-sm mb-4">Choisis le score final</p>
          <div className="flex items-center justify-center gap-8">
            <ScoreInput value={homeScore} onChange={setHomeScore} disabled={isLocked || !canChange} />
            <span className="font-display text-2xl text-muted">–</span>
            <ScoreInput value={awayScore} onChange={setAwayScore} disabled={isLocked || !canChange} />
          </div>
          {!isLocked && (
            <p className="text-center text-beige text-sm mt-4">
              Résultat prévu : <span className="text-cream font-display">{resultLabel}</span>
            </p>
          )}
        </div>

        {/* Error */}
        {submitError && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-lg px-4 py-3 text-red-400 text-sm text-center">
            {submitError}
          </div>
        )}

        {/* Change count warning */}
        {existing && changeCount === 1 && !isLocked && (
          <p className="text-center text-gold text-xs">
            ⚠️ Il te reste 1 seule modification avant le coup d&apos;envoi
          </p>
        )}

        {/* Submit or locked */}
        {!isLocked && canChange && (
          <>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gold text-bg-dark font-display text-xl uppercase py-4 rounded-xl hover:brightness-110 transition disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-bg-dark border-t-transparent rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : existing ? 'MODIFIER MON PRONO →' : 'VALIDER MON PRONO →'}
            </button>
            <p className="text-center text-muted text-xs">Ferme au coup d&apos;envoi · {kickoffStr}</p>
          </>
        )}

        {!isLocked && !canChange && (
          <div className="text-center py-3 border border-gold/30 rounded-xl">
            <p className="text-gold font-display text-sm uppercase">Limite de 2 modifications atteinte</p>
            <p className="text-muted text-xs mt-1">Ton prono est verrouillé jusqu&apos;au coup d&apos;envoi</p>
          </div>
        )}

        {isLocked && (
          <div className="text-center py-3 border border-white/10 rounded-xl">
            <p className="text-muted font-display uppercase text-sm">Match commencé · Prono verrouillé</p>
          </div>
        )}
      </div>
    </main>
  )
}
