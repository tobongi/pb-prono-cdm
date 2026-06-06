const PROXY = process.env.PROXY_URL ?? 'http://localhost:3001'

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

export interface TeamStanding {
  name: string
  code: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  pts: number
}

export interface GroupStanding {
  name: string
  standings: TeamStanding[]
}

export async function fetchMatches(): Promise<Match[]> {
  const res = await fetch(`${PROXY}/api/matches`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch matches')
  const data = await res.json()
  return data.matches
}

export async function fetchGroups(): Promise<GroupStanding[]> {
  const res = await fetch(`${PROXY}/api/groups`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch groups')
  const data = await res.json()
  return data.groups
}
