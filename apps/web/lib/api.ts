const PROXY = process.env.NEXT_PUBLIC_PROXY_URL ?? 'http://localhost:3001'

export interface Match {
  num: number
  date: string
  time?: string
  team1: { name: string; code: string }
  team2: { name: string; code: string }
  score?: { ft: [number, number] }
  group?: string
  round?: string
  status?: 'upcoming' | 'live' | 'finished'
  minute?: number
  liveHomeScore?: number
  liveAwayScore?: number
}

export interface Group {
  name: string
  teams: Array<{ name: string; code: string }>
  matches: Match[]
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${PROXY}/api/matches`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}

export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch(`${PROXY}/api/groups`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch groups')
  const data = await res.json()
  return data.groups
}
