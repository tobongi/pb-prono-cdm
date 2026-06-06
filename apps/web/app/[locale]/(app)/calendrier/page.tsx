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
      <h1 className="font-display text-3xl text-cream mb-6 uppercase">Calendrier</h1>
      <MatchesLive initialMatches={matches} />
    </main>
  )
}
