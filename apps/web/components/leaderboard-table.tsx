'use client'

export interface LeaderboardEntry {
  id: string
  pseudo: string
  avatar_url: string | null
  total_points: number
  rank: number
  correct_count: number
  exact_count: number
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const medalEmoji: Record<number, string> = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const userEntry = entries.find(e => e.id === currentUserId)
  const userInTop = entries.slice(0, 50).some(e => e.id === currentUserId)

  return (
    <div className="flex flex-col gap-1">
      {entries.map(entry => {
        const isUser = entry.id === currentUserId

        return (
          <div
            key={entry.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
              isUser ? 'bg-gold/20 border border-gold' : 'bg-bg-card'
            }`}
          >
            <span className="font-display text-lg w-8 text-center text-muted flex-shrink-0">
              {medalEmoji[entry.rank] ?? `${entry.rank}.`}
            </span>

            <div className="w-8 h-8 rounded-full bg-olive overflow-hidden flex-shrink-0">
              {entry.avatar_url && (
                <img
                  src={entry.avatar_url}
                  alt={entry.pseudo}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <span className={`flex-1 font-display truncate ${isUser ? 'text-gold' : 'text-cream'}`}>
              {isUser ? `${entry.pseudo} (toi)` : entry.pseudo}
            </span>

            <span className={`font-display text-xl flex-shrink-0 ${isUser ? 'text-gold' : 'text-cream'}`}>
              {entry.total_points} pts
            </span>
          </div>
        )
      })}

      {userEntry && !userInTop && (
        <>
          <div className="text-center text-muted text-xs py-2">─── Tu es ici ───</div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/20 border border-gold">
            <span className="font-display text-lg w-8 text-center text-muted flex-shrink-0">
              {userEntry.rank}.
            </span>
            <div className="w-8 h-8 rounded-full bg-olive overflow-hidden flex-shrink-0">
              {userEntry.avatar_url && (
                <img
                  src={userEntry.avatar_url}
                  alt={userEntry.pseudo}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="flex-1 font-display text-gold truncate">
              {userEntry.pseudo} (toi)
            </span>
            <span className="font-display text-xl text-gold flex-shrink-0">
              {userEntry.total_points} pts
            </span>
          </div>
        </>
      )}
    </div>
  )
}
