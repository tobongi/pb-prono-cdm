'use client'
import { useLiveMatches } from '@/hooks/use-live-matches'
import { MatchCardWrapper } from './match-card-wrapper'
import type { Match } from '@/lib/api'

interface MatchesLiveProps {
  initialMatches: Match[]
}

export function MatchesLive({ initialMatches }: MatchesLiveProps) {
  const { data, isError } = useLiveMatches(initialMatches)

  const matches: Match[] = data ?? []

  if (matches.length === 0) {
    return (
      <p className="text-center text-cream/50 py-20">
        {isError
          ? 'Calendrier temporairement indisponible.'
          : 'Chargement…'}
      </p>
    )
  }

  const byDate = matches.reduce<Record<string, Match[]>>((acc, m) => {
    acc[m.date] = [...(acc[m.date] ?? []), m]
    return acc
  }, {})

  return (
    <div className="space-y-8">
      {Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, dayMatches]) => (
          <section key={date}>
            <h2 className="font-display text-lg text-gold uppercase tracking-wide mb-3 px-4">
              {new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h2>
            <div className="space-y-2">
              {dayMatches.map(m => (
                <MatchCardWrapper key={m.num} match={m} />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}
