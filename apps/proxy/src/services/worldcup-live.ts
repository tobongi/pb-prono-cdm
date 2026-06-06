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
    const raw = await res.json() as Record<string, unknown>
    const games = Array.isArray(raw?.games) ? raw.games as Record<string, unknown>[] : []
    if (games.length === 0 && raw?.games !== undefined) {
      console.warn('[worldcup-live] unexpected API shape:', JSON.stringify(raw).slice(0, 200))
    }
    const matches: LiveMatch[] = games.map((g: Record<string, unknown>) => ({
      matchId: String(g.id),
      home: String(g.homeTeam),
      away: String(g.awayTeam),
      date: String(g.date).slice(0, 10),
      homeScore: Number(g.homeGoals ?? 0),
      awayScore: Number(g.awayGoals ?? 0),
      status: ['FINISHED', 'AWARDED'].includes(String(g.status ?? '')) ? 'finished'
            : ['IN_PLAY', 'PAUSED', 'HALFTIME'].includes(String(g.status ?? '')) ? 'live'
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
