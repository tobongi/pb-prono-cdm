import { setCache, getCache } from '../lib/cache'

const BASE = process.env.WORLDCUP_API_URL ?? 'http://localhost:3002'
const TTL = 30_000 // 30s

export interface LiveMatch {
  matchId: string
  home: string
  away: string
  date: string
  homeScore: number
  awayScore: number
  status: 'upcoming' | 'live' | 'finished'
  minute?: number
}

export async function getLiveMatches(): Promise<{ matches: LiveMatch[]; stale: boolean }> {
  const cached = getCache<LiveMatch[]>('live:matches')
  if (cached && !cached.stale) return { matches: cached.data, stale: false }

  try {
    const res = await fetch(`${BASE}/get/games`, { signal: AbortSignal.timeout(3000) })
    if (!res.ok) throw new Error('live api error')
    const raw = await res.json()
    const matches: LiveMatch[] = raw.games.map((g: Record<string, unknown>) => ({
      matchId: String(g.id),
      home: String(g.homeTeam),
      away: String(g.awayTeam),
      date: String(g.date).slice(0, 10),
      homeScore: Number(g.homeGoals ?? 0),
      awayScore: Number(g.awayGoals ?? 0),
      status: g.status === 'FINISHED' ? 'finished'
            : g.status === 'IN_PLAY' ? 'live'
            : 'upcoming',
      minute: g.minute ? Number(g.minute) : undefined,
    }))
    setCache('live:matches', matches, TTL)
    return { matches, stale: false }
  } catch {
    if (cached) return { matches: cached.data, stale: true }
    return { matches: [], stale: true }
  }
}
