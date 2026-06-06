import { fetchMatches } from '@/lib/api'
import { MatchCard } from '@/components/match-card'

export default async function CalendrierPage() {
  let matches: Awaited<ReturnType<typeof fetchMatches>> = []
  try {
    matches = await fetchMatches()
  } catch {
    matches = []
  }

  const byDate = matches.reduce<Record<string, typeof matches>>((acc, m) => {
    acc[m.date] = [...(acc[m.date] ?? []), m]
    return acc
  }, {})

  return (
    <main className="px-4 py-6 pb-24 max-w-lg mx-auto">
      <h1 className="font-display text-3xl text-cream mb-6 uppercase">Calendrier</h1>
      {Object.keys(byDate).length === 0 ? (
        <p className="text-muted text-center py-12">Calendrier non disponible pour l&apos;instant.</p>
      ) : (
        Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, dayMatches]) => (
          <section key={date} className="mb-6">
            <h2 className="text-beige text-sm uppercase tracking-widest mb-3">
              {new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </h2>
            <div className="flex flex-col gap-3">
              {dayMatches.map(m => (
                <MatchCard key={m.num} match={m} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
