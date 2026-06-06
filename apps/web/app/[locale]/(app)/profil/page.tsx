import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  let userRow: { pseudo: string; avatar_url: string | null; created_at: string } | null = null
  let totalPoints = 0

  if (session) {
    const { data } = await supabase
      .from('users')
      .select('pseudo, avatar_url, created_at')
      .eq('provider_id', session.user.id)
      .single()
    userRow = data

    if (data) {
      const { data: preds } = await supabase
        .from('predictions')
        .select('points_earned')
        .eq('user_id', session.user.id)
      totalPoints = (preds ?? []).reduce((sum: number, p: { points_earned: number | null }) => sum + (p.points_earned ?? 0), 0)
    }
  }

  const rules = [
    { icon: '🎯', title: 'PRONOSTIQUE', desc: 'Choisis ton vainqueur (ou le nul) avant le coup d\'envoi. Les pronos se ferment au début du match.' },
    { icon: '🕐', title: 'VÉRIFICATION', desc: 'Les pronostics sont validés après chaque match. Tes points sont crédités automatiquement.' },
    { icon: '⭐', title: 'GAGNE DES POINTS', desc: 'Score exact = 7 pts. Bon résultat = 3 pts. Les 10 meilleurs gagnent une surprise PB.' },
    { icon: '🏆', title: 'LE CLASSEMENT', desc: 'Chaque bon pronostic compte. Le classement est mis à jour après chaque match.' },
  ]

  return (
    <div className="min-h-screen bg-bg-dark">
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      {/* Profile card */}
      {userRow ? (
        <div className="bg-bg-card rounded-xl p-6 flex items-center gap-4 mb-8">
          {userRow.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userRow.avatar_url} alt="avatar" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-2xl">👤</div>
          )}
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl text-cream uppercase">{userRow.pseudo}</p>
            <p className="text-gold font-display text-lg">{totalPoints} pts</p>
            <p className="text-muted text-xs">Inscrit le {new Date(userRow.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      ) : (
        <div className="bg-bg-card rounded-xl p-8 text-center mb-8">
          <p className="text-muted text-sm mb-4">Non connecté</p>
          <Link href="/fr/login" className="bg-gold text-bg-dark font-display uppercase px-6 py-3 rounded-xl text-sm">
            Se connecter
          </Link>
        </div>
      )}

      {/* Rules section */}
      <p className="text-gold text-[10px] uppercase tracking-widest text-center mb-2">LES RÈGLES</p>
      <h2 className="font-display text-3xl text-cream uppercase text-center mb-6">COMMENT JOUER ?</h2>
      <p className="text-beige text-sm text-center mb-6">PB Prono CDM — le jeu de pronostics signé Poulet Braisé</p>

      <div className="flex flex-col gap-3">
        {rules.map(r => (
          <div key={r.title} className="bg-bg-card rounded-xl p-4 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0 text-xl">
              {r.icon}
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-display text-sm text-cream uppercase tracking-wide">{r.title}</p>
              <p className="text-beige text-sm leading-snug">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
    </div>
  )
}
