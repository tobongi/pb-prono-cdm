import { createClient } from '@/lib/supabase/server'
import { LeaderboardTable } from '@/components/leaderboard-table'

export const revalidate = 60

interface LeaderboardEntry {
  id: string
  pseudo: string
  avatar_url: string | null
  total_points: number
  rank: number
  correct_count: number
  exact_count: number
}

export default async function ClassementPage() {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawEntries } = await (supabase as any)
    .from('leaderboard')
    .select('id, pseudo, avatar_url, total_points, rank, correct_count, exact_count')
    .order('rank', { ascending: true })
    .limit(100)

  const entries: LeaderboardEntry[] = rawEntries ?? []

  let currentUserId: string | undefined
  if (session) {
    const { data: userRow } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', session.user.id)
      .single()
    currentUserId = userRow?.id ?? undefined
  }

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">TOP PRONOSTIQUEURS</p>
        <h1 className="font-display text-4xl text-cream uppercase">CLASSEMENT</h1>
      </div>

      {entries.length === 0 ? (
        <div className="bg-bg-card rounded-xl p-8 text-center">
          <span className="text-4xl">🏆</span>
          <p className="text-cream font-display text-lg mt-4">Aucun participant pour l&apos;instant</p>
          <p className="text-muted text-sm mt-2">Sois le premier à pronostiquer !</p>
        </div>
      ) : (
        <LeaderboardTable entries={entries} currentUserId={currentUserId} />
      )}
    </main>
  )
}
