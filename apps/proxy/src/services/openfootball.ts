import { setCache, getCache } from '../lib/cache'
import { matchKey } from '../lib/normalize'

// Correct repo name is world-cup.json (with dash)
const BASE = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026'
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

// Raw data from openfootball/world-cup.json
// teams are plain strings, no nested objects, no rounds wrapper
interface OFRawMatch {
  round: string
  date: string
  time?: string
  team1: string
  team2: string
  group?: string
  ground?: string
  score?: { ft: [number, number] }
}

interface OFRaw {
  name: string
  matches: OFRawMatch[]
}

// FIFA 3-letter codes keyed by the team name as it appears in openfootball data
const TEAM_CODES: Record<string, string> = {
  'Algeria': 'ALG',
  'Argentina': 'ARG',
  'Australia': 'AUS',
  'Austria': 'AUT',
  'Belgium': 'BEL',
  'Bosnia & Herzegovina': 'BIH',
  'Brazil': 'BRA',
  'Canada': 'CAN',
  'Cape Verde': 'CPV',
  'Colombia': 'COL',
  'Croatia': 'CRO',
  'Czech Republic': 'CZE',
  'Curaçao': 'CUW',
  'DR Congo': 'COD',
  'Ecuador': 'ECU',
  'Egypt': 'EGY',
  'England': 'ENG',
  'France': 'FRA',
  'Germany': 'GER',
  'Ghana': 'GHA',
  'Haiti': 'HAI',
  'Iran': 'IRN',
  'Iraq': 'IRQ',
  'Ivory Coast': 'CIV',
  'Japan': 'JPN',
  'Jordan': 'JOR',
  'Mexico': 'MEX',
  'Morocco': 'MAR',
  'Netherlands': 'NED',
  'New Zealand': 'NZL',
  'Norway': 'NOR',
  'Panama': 'PAN',
  'Paraguay': 'PAR',
  'Portugal': 'POR',
  'Qatar': 'QAT',
  'Saudi Arabia': 'KSA',
  'Scotland': 'SCO',
  'Senegal': 'SEN',
  'South Africa': 'RSA',
  'South Korea': 'KOR',
  'Spain': 'ESP',
  'Sweden': 'SWE',
  'Switzerland': 'SUI',
  'Tunisia': 'TUN',
  'Turkey': 'TUR',
  'USA': 'USA',
  'Uruguay': 'URU',
  'Uzbekistan': 'UZB',
}

function resolveTeam(name: string): OFTeam {
  const fallback = name.replace(/[^A-Z]/g, '').slice(0, 3).toUpperCase() || 'TBD'
  const code = TEAM_CODES[name] ?? fallback
  return { name, code }
}

let _matchCache: OFMatch[] | null = null
let _groupCache: OFGroup[] | null = null

async function fetchRaw(): Promise<OFRaw> {
  const cached = getCache<OFRaw>('of:raw')
  if (cached && !cached.stale) return cached.data

  const res = await fetch(`${BASE}/worldcup.json`)
  if (!res.ok) throw new Error(`openfootball fetch failed: ${res.status}`)
  const data = await res.json() as OFRaw
  setCache('of:raw', data, TTL)
  // Bust in-memory caches when raw data refreshes
  _matchCache = null
  _groupCache = null
  return data
}

export async function getMatches(): Promise<OFMatch[]> {
  if (_matchCache) return _matchCache
  const data = await fetchRaw()

  _matchCache = data.matches.map((m, i): OFMatch => ({
    num: i + 1,
    date: m.date,
    time: m.time,
    team1: resolveTeam(m.team1),
    team2: resolveTeam(m.team2),
    score: m.score,
    group: m.group,
    round: m.round,
  }))
  return _matchCache
}

export async function getGroups(): Promise<OFGroup[]> {
  if (_groupCache) return _groupCache
  const matches = await getMatches()

  // Only group stage matches have a "Group X" label
  const groupMatches = matches.filter(m => m.group?.startsWith('Group '))

  const groupMap = new Map<string, { teamsMap: Map<string, OFTeam>; matches: OFMatch[] }>()

  for (const m of groupMatches) {
    const gName = m.group!
    if (!groupMap.has(gName)) groupMap.set(gName, { teamsMap: new Map(), matches: [] })
    const g = groupMap.get(gName)!
    g.teamsMap.set(m.team1.code, m.team1)
    g.teamsMap.set(m.team2.code, m.team2)
    g.matches.push(m)
  }

  _groupCache = Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, { teamsMap, matches: gMatches }]) => ({
      name,
      teams: Array.from(teamsMap.values()),
      matches: gMatches,
    }))

  return _groupCache
}

export function buildMatchIndex(matches: OFMatch[]): Map<string, OFMatch> {
  const index = new Map<string, OFMatch>()
  for (const m of matches) {
    const key = matchKey(m.date, m.team1.name, m.team2.name)
    index.set(key, m)
  }
  return index
}
