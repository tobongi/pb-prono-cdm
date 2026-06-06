import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('leaderboard')
      .select('id, pseudo, avatar_url, total_points, rank, correct_count, exact_count')
      .order('rank', { ascending: true })
      .limit(100)

    if (error) throw error
    return NextResponse.json({ entries: data ?? [] })
  } catch {
    return NextResponse.json({ entries: [] }, { status: 502 })
  }
}
