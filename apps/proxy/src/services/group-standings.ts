import { getGroups } from './openfootball'
import { getLiveMatches } from './worldcup-live'
import { matchKey } from '../lib/normalize'

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

export async function getGroupStandings(): Promise<GroupStanding[]> {
  const [groups, { matches: liveMatches }] = await Promise.all([
    getGroups(),
    getLiveMatches(),
  ])

  const liveIndex = new Map(
    liveMatches.map(m => [matchKey(m.date, m.home, m.away), m])
  )

  return groups.map(group => {
    const standings = new Map<string, TeamStanding>()

    for (const team of group.teams) {
      standings.set(team.code, {
        name: team.name, code: team.code,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0,
      })
    }

    for (const match of group.matches) {
      const key = matchKey(match.date, match.team1.name, match.team2.name)
      const live = liveIndex.get(key)
      const score = live?.status === 'finished'
        ? [live.homeScore, live.awayScore]
        : match.score?.ft

      if (!score) continue

      const [hg, ag] = score
      const ht = standings.get(match.team1.code)
      const at = standings.get(match.team2.code)
      if (!ht || !at) continue

      ht.played++; at.played++
      ht.gf += hg; ht.ga += ag; ht.gd = ht.gf - ht.ga
      at.gf += ag; at.ga += hg; at.gd = at.gf - at.ga

      if (hg > ag) { ht.won++; ht.pts += 3; at.lost++ }
      else if (ag > hg) { at.won++; at.pts += 3; ht.lost++ }
      else { ht.drawn++; at.drawn++; ht.pts++; at.pts++ }
    }

    const sorted = [...standings.values()].sort((a, b) =>
      b.pts - a.pts || b.gd - a.gd || b.gf - a.gf
    )

    return { name: group.name, standings: sorted }
  })
}
