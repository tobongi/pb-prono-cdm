'use client'
import { useQuery } from '@tanstack/react-query'

async function fetchGroupsClient() {
  const res = await fetch('/api/groups')
  if (!res.ok) throw new Error('fetch failed')
  return res.json() // { groups: [...], stale: boolean }
}

export function useLiveGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroupsClient,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  })
}
