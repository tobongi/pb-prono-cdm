'use client'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { ErrorBoundary } from './error-boundary'
import { MatchCard } from './match-card'
import type { Match } from '@/lib/api'

interface Props {
  match: Match
  userPrediction?: { home: number; away: number }
}

export function MatchCardWrapper({ match, userPrediction }: Props) {
  const router = useRouter()
  const locale = useLocale()
  return (
    <ErrorBoundary
      fallback={
        <div className="rounded-xl bg-bg-card/50 p-4 text-center text-cream/30 text-sm font-body">
          Match indisponible
        </div>
      }
    >
      <MatchCard
        match={match}
        userPrediction={userPrediction}
        onPress={() => router.push(`/${locale}/pronos/${match.num}`)}
      />
    </ErrorBoundary>
  )
}
