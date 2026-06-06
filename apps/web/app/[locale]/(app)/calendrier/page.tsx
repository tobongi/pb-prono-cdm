import { fetchMatches } from '@/lib/api'
import { MatchesLive } from '@/components/matches-live'

export default async function CalendrierPage() {
  let matches: Awaited<ReturnType<typeof fetchMatches>> = []
  try {
    matches = await fetchMatches()
  } catch {
    matches = []
  }

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-6">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">À TOI DE JOUER</p>
        <h1 className="font-display text-4xl text-cream uppercase">Matchs</h1>
      </div>
      <MatchesLive initialMatches={matches} />
    </main>
  )
}
