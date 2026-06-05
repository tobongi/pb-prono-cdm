import { setCache, getCache } from '../lib/cache'
import { matchKey } from '../lib/normalize'

const BASE = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026'
const TTL = 24 * 60 * 60 * 1000 // 24h

export interface OFTeam {
  name: string
  code: string
}

export interface OFMatch {
  num: number
  date: string
  time?: string
  team1: OFTeam
  team2: OFTeam
  score?: { ft: [number, number] }
  group?: string
  round?: string
}

export interface OFGroup {
  name: string
  teams: OFTeam[]
  matches: OFMatch[]
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status} ${url}`)
  return res.json() as Promise<T>
}

export async function getMatches(): Promise<OFMatch[]> {
  const cached = getCache<OFMatch[]>('of:matches')
  if (cached && !cached.stale) return cached.data

  const data = await fetchJSON<{ rounds: Array<{ matches: OFMatch[] }> }>(
    `${BASE}/worldcup.json`
  )
  const matches = data.rounds.flatMap(r => r.matches)
  setCache('of:matches', matches, TTL)
  return matches
}

export async function getGroups(): Promise<OFGroup[]> {
  const cached = getCache<OFGroup[]>('of:groups')
  if (cached && !cached.stale) return cached.data

  const data = await fetchJSON<{ groups: OFGroup[] }>(`${BASE}/worldcup.json`)
  setCache('of:groups', data.groups, TTL)
  return data.groups
}

export function buildMatchIndex(matches: OFMatch[]): Map<string, OFMatch> {
  const index = new Map<string, OFMatch>()
  for (const m of matches) {
    const key = matchKey(m.date, m.team1.name, m.team2.name)
    index.set(key, m)
  }
  return index
}
