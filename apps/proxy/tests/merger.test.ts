import { describe, it, expect } from 'vitest'
import { mergeMatchData } from '../src/services/merger'
import type { OFMatch } from '../src/services/openfootball'

const ofMatch: OFMatch = {
  num: 1,
  date: '2026-06-11',
  time: '21:00',
  team1: { name: 'Mexico', code: 'MEX' },
  team2: { name: 'South Africa', code: 'RSA' },
}

const liveMatch = {
  matchId: 'live-1',
  home: 'MEX',
  away: 'RSA',
  date: '2026-06-11',
  homeScore: 2,
  awayScore: 1,
  status: 'finished' as const,
}

describe('mergeMatchData', () => {
  it('enriches of match with live score', () => {
    const result = mergeMatchData([ofMatch], [liveMatch])
    expect(result[0].score?.ft).toEqual([2, 1])
    expect(result[0].status).toBe('finished')
  })

  it('returns upcoming status when no live data', () => {
    const result = mergeMatchData([ofMatch], [])
    expect(result[0].status).toBe('upcoming')
  })
})
