'use client'
import { useState, useMemo } from 'react'
import { useLiveMatches } from '@/hooks/use-live-matches'
import { MatchCardWrapper } from './match-card-wrapper'
import type { Match } from '@/lib/api'

interface MatchesLiveProps {
  initialMatches: Match[]
}

function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function MatchesLive({ initialMatches }: MatchesLiveProps) {
  const { data, isError } = useLiveMatches(initialMatches)
  const [query, setQuery] = useState('')

  const matches: Match[] = data ?? []

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return matches
    return matches.filter(m =>
      normalize(m.team1.name).includes(q) ||
      normalize(m.team2.name).includes(q) ||
      normalize(m.team1.code).includes(q) ||
      normalize(m.team2.code).includes(q)
    )
  }, [matches, query])

  if (matches.length === 0) {
    return (
      <p className="text-center text-cream/50 py-20">
        {isError
          ? 'Calendrier temporairement indisponible.'
          : 'Chargement…'}
      </p>
    )
  }

  const byDate = filtered.reduce<Record<string, Match[]>>((acc, m) => {
    acc[m.date] = [...(acc[m.date] ?? []), m]
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-beige/50 text-base pointer-events-none">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="France, BRA, Maroc…"
          className="w-full bg-bg-card text-cream font-body text-sm pl-9 pr-9 py-3 rounded-xl border border-olive/40 focus:border-gold focus:outline-none placeholder:text-beige/30 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-beige/50 hover:text-cream transition-colors text-sm"
            aria-label="Effacer"
          >
            ✕
          </button>
        )}
      </div>

      {/* No results */}
      {query && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🏳️</p>
          <p className="text-cream/60 font-display text-lg uppercase">Aucun match trouvé</p>
          <p className="text-beige/40 text-sm mt-1">Essaie un autre pays ou code FIFA</p>
        </div>
      )}

      {/* Match list by date */}
      <div className="space-y-8">
        {Object.entries(byDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, dayMatches]) => (
            <section key={date}>
              <h2 className="font-display text-lg text-gold uppercase tracking-wide mb-3 px-1">
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
    </div>
  )
}
