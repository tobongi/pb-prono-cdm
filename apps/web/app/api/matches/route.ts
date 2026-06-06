import { fetchMatches } from '@/lib/api'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const matches = await fetchMatches()
    return NextResponse.json({ matches })
  } catch {
    return NextResponse.json({ matches: [] }, { status: 502 })
  }
}
