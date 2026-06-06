import { Flag } from './flag'
import type { Match } from '@/lib/api'

interface MatchCardProps {
  match: Match
  userPrediction?: { home: number; away: number }
  onPress?: () => void
}

export function MatchCard({ match, userPrediction, onPress }: MatchCardProps) {
  const isLive = match.status === 'live'
  const isFinished = match.status === 'finished'

  return (
    <div
      className="bg-bg-card rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:bg-olive/30 transition-colors"
      onClick={onPress}
    >
      <div className="flex items-center justify-between text-xs text-beige uppercase tracking-widest">
        <span>{match.group ?? match.round}</span>
        <span>{match.time}</span>
        {isLive && (
          <span className="flex items-center gap-1 text-live font-display text-sm">
            <span className="w-2 h-2 rounded-full bg-live animate-live" />
            EN DIRECT {match.minute}&apos;
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1 w-[40%]">
          <Flag code={match.team1.code} size="lg" />
          <span className="font-display text-lg text-cream">{match.team1.code}</span>
          <span className="text-xs text-beige">{match.team1.name}</span>
        </div>

        <div className="text-cream font-display text-2xl">
          {isFinished && match.score
            ? `${match.score.ft[0]} – ${match.score.ft[1]}`
            : isLive && match.liveHomeScore !== undefined
            ? `${match.liveHomeScore} – ${match.liveAwayScore}`
            : 'VS'}
        </div>

        <div className="flex flex-col items-center gap-1 w-[40%]">
          <Flag code={match.team2.code} size="lg" />
          <span className="font-display text-lg text-cream">{match.team2.code}</span>
          <span className="text-xs text-beige">{match.team2.name}</span>
        </div>
      </div>

      {userPrediction && (
        <div className="border-t border-olive pt-2 text-center text-sm text-beige">
          Ton prono : {userPrediction.home} – {userPrediction.away}
        </div>
      )}
    </div>
  )
}
