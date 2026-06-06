'use client'

import { Flag } from './flag'

interface TeamStanding {
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

interface GroupStandingsProps {
  name: string
  standings: TeamStanding[]
}

export function GroupStandings({ name, standings }: GroupStandingsProps) {
  return (
    <div className="bg-bg-card rounded-xl overflow-hidden">
      <div className="bg-olive px-4 py-2">
        <h3 className="font-display text-lg text-cream uppercase">Groupe {name}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-beige text-xs uppercase border-b border-olive">
            <th className="text-left px-4 py-2">Équipe</th>
            <th className="px-2 py-2">J</th>
            <th className="px-2 py-2">G</th>
            <th className="px-2 py-2">N</th>
            <th className="px-2 py-2">P</th>
            <th className="px-2 py-2">BP</th>
            <th className="px-2 py-2">BC</th>
            <th className="px-2 py-2">Diff</th>
            <th className="px-2 py-2 text-gold">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((t, i) => (
            <tr
              key={t.code}
              className={`border-b border-olive/40 ${i < 2 ? 'text-cream' : 'text-muted'}`}
            >
              <td className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Flag code={t.code} size="sm" />
                  {t.code}
                </div>
              </td>
              <td className="text-center px-2 py-2">{t.played}</td>
              <td className="text-center px-2 py-2">{t.won}</td>
              <td className="text-center px-2 py-2">{t.drawn}</td>
              <td className="text-center px-2 py-2">{t.lost}</td>
              <td className="text-center px-2 py-2">{t.gf}</td>
              <td className="text-center px-2 py-2">{t.ga}</td>
              <td className="text-center px-2 py-2">{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
              <td className="text-center px-2 py-2 font-display text-gold">{t.pts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
