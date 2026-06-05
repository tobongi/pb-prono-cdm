import { TEAM_ALIASES } from './team-aliases'

export function normalizeTeam(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
  return TEAM_ALIASES[base] ?? base
}

export function matchKey(date: string, home: string, away: string): string {
  return `${date}|${normalizeTeam(home)}|${normalizeTeam(away)}`
}
