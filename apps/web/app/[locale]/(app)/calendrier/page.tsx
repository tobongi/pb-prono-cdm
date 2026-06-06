import { fetchMatches } from '@/lib/api'
import { MatchesLive } from '@/components/matches-live'

export default async function CalendrierPage() {
  let matches: Awaited<ReturnType<typeof fetchMatches>> = []
  try {
    matches = await fetchMatches()
  } catch {
    matches = []
  }

  // Find next upcoming date
  const today = new Date().toISOString().slice(0,10)
  const nextMatch = matches.find(m => m.date >= today && m.status !== 'finished')
  const nextDateStr = nextMatch
    ? new Date(nextMatch.date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long'
      }).toUpperCase()
    : ''

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-8">
        <p className="text-beige text-xs uppercase tracking-widest mb-1">À TOI DE JOUER</p>
        {nextDateStr && (
          <h1 className="font-display text-4xl text-cream uppercase">{nextDateStr}</h1>
        )}
      </div>
      <MatchesLive initialMatches={matches} />
    </main>
  )
}
