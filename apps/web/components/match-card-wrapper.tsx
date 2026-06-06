import { ErrorBoundary } from './error-boundary'
import { MatchCard } from './match-card'
import type { Match } from '@/lib/api'

interface Props {
  match: Match
  userPrediction?: any
  onPress?: () => void
}

export function MatchCardWrapper(props: Props) {
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-xl bg-bg-card/50 p-4 text-center text-cream/30 text-sm font-body">
          Match indisponible
        </div>
      }
    >
      <MatchCard {...props} />
    </ErrorBoundary>
  )
}
