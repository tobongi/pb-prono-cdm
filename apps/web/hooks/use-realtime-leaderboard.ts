'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LeaderboardEntry } from '@/components/leaderboard-table'

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch('/api/leaderboard')
  if (!res.ok) return []
  const data = await res.json()
  return data.entries ?? []
}

export function useRealtimeLeaderboard(initial: LeaderboardEntry[]) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initial)
  const [isLive, setIsLive] = useState(false)

  const refresh = useCallback(async () => {
    const updated = await fetchLeaderboard()
    if (updated.length > 0) setEntries(updated)
  }, [])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'predictions',
        },
        () => {
          // A prediction was updated — refresh the leaderboard
          refresh()
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refresh])

  return { entries, isLive }
}
