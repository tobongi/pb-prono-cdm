'use client'
import { useRealtimeLeaderboard } from '@/hooks/use-realtime-leaderboard'
import { LeaderboardTable } from './leaderboard-table'
import type { LeaderboardEntry } from './leaderboard-table'

interface LeaderboardLiveProps {
  initialEntries: LeaderboardEntry[]
  currentUserId?: string
}

export function LeaderboardLive({ initialEntries, currentUserId }: LeaderboardLiveProps) {
  const { entries, isLive } = useRealtimeLeaderboard(initialEntries)

  return (
    <div>
      {/* Live indicator */}
      <div className="flex items-center gap-2 mb-4 px-4">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            isLive ? 'bg-green-500 animate-pulse' : 'bg-cream/30'
          }`}
        />
        <span className="text-xs text-cream/50 font-body">
          {isLive ? 'Mis à jour en direct' : 'Connexion...'}
        </span>
      </div>
      <LeaderboardTable entries={entries} currentUserId={currentUserId} />
    </div>
  )
}
