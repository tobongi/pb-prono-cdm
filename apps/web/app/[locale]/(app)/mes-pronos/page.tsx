import { createClient } from '@/lib/supabase/server'

export const revalidate = 60

interface Prediction {
  match_id: string
  home_score_pred: number
  away_score_pred: number
  points_earned: number | null
  created_at: string
}

export default async function MesPronos() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let predictions: Prediction[] = []

  if (session) {
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', session.user.id)
      .single()

    if (userRow) {
      const { data } = await supabase
        .from('predictions')
        .select('match_id, home_score_pred, away_score_pred, points_earned, created_at')
        .eq('user_id', userRow.id)
        .order('created_at', { ascending: false })
      predictions = data ?? []
    }
  }

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">MON HISTORIQUE</p>
        <h1 className="font-display text-4xl text-cream uppercase">MES PRONOS</h1>
      </div>

      {!session ? (
        <div className="bg-bg-card rounded-xl p-8 text-center flex flex-col items-center gap-4">
          <span className="text-5xl">🔒</span>
          <p className="font-display text-lg text-cream uppercase">Connexion requise</p>
          <a href="/fr/login" className="bg-gold text-bg-dark font-display uppercase px-6 py-3 rounded-xl text-sm">
            Se connecter
          </a>
        </div>
      ) : predictions.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-bg-dark rounded-2xl flex items-center justify-center text-3xl">📋</div>
          <p className="font-display text-lg text-cream uppercase">Aucun pronostic</p>
          <p className="text-muted text-sm">Tu n&apos;as pas encore pronostiqué de match.</p>
          <a href="/fr/calendrier" className="text-gold text-sm font-display uppercase mt-2">
            Voir les matchs →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {predictions.map(p => (
            <div key={p.match_id + p.created_at} className="bg-bg-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <p className="text-beige text-xs">Match #{p.match_id}</p>
                <p className="font-display text-xl text-cream">
                  {p.home_score_pred} – {p.away_score_pred}
                </p>
                <p className="text-muted text-xs">
                  {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              {p.points_earned !== null ? (
                <div className={`flex flex-col items-center ${p.points_earned > 0 ? 'text-gold' : 'text-muted'}`}>
                  <span className="font-display text-2xl">{p.points_earned}</span>
                  <span className="text-xs">pts</span>
                </div>
              ) : (
                <span className="text-beige text-xs font-display uppercase">En attente</span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
