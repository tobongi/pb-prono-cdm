'use client'
import { useQuery } from '@tanstack/react-query'
import type { Match } from '@/lib/api'

async function fetchMatchesClient(): Promise<Match[]> {
  const res = await fetch('/api/matches')
  if (!res.ok) throw new Error('fetch failed')
  return (await res.json()).matches
}

export function useLiveMatches() {
  return useQuery({
    queryKey: ['matches'],
    queryFn: fetchMatchesClient,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}
