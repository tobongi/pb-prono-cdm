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

interface OFRaw {
  rounds: Array<{ matches: OFMatch[] }>
  groups: OFGroup[]
}

async function fetchRaw(): Promise<OFRaw> {
  const cached = getCache<OFRaw>('of:raw')
  if (cached && !cached.stale) return cached.data

  const res = await fetch(`${BASE}/worldcup.json`)
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status}`)
  const data = await res.json() as OFRaw
  setCache('of:raw', data, TTL)
  return data
}

export async function getMatches(): Promise<OFMatch[]> {
  const data = await fetchRaw()
  return data.rounds.flatMap(r => r.matches)
}

export async function getGroups(): Promise<OFGroup[]> {
  const data = await fetchRaw()
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
