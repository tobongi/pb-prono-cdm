import { matchKey } from '../lib/normalize'
import type { OFMatch } from './openfootball'
import type { LiveMatch } from './worldcup-live'

export interface MergedMatch extends OFMatch {
  status: 'upcoming' | 'live' | 'finished'
  liveHomeScore?: number
  liveAwayScore?: number
  minute?: number
}

export function mergeMatchData(ofMatches: OFMatch[], liveMatches: LiveMatch[]): MergedMatch[] {
  const liveIndex = new Map<string, LiveMatch>()
  for (const lm of liveMatches) {
    const key = matchKey(lm.date, lm.home, lm.away)
    liveIndex.set(key, lm)
  }

  return ofMatches.map(m => {
    // Try lookup by team name first, then fall back to team code
    const keyByName = matchKey(m.date, m.team1.name, m.team2.name)
    const keyByCode = matchKey(m.date, m.team1.code, m.team2.code)
    const live = liveIndex.get(keyByName) ?? liveIndex.get(keyByCode)

    if (!live) return { ...m, status: 'upcoming' as const }

    return {
      ...m,
      status: live.status,
      liveHomeScore: live.homeScore,
      liveAwayScore: live.awayScore,
      minute: live.minute,
      score: live.status === 'finished'
        ? { ft: [live.homeScore, live.awayScore] as [number, number] }
        : m.score,
    }
  })
}
