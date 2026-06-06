import { NextResponse } from 'next/server'

const PROXY = process.env.PROXY_URL ?? 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${PROXY}/api/groups`, { next: { revalidate: 30 } })
    if (!res.ok) throw new Error('proxy error')
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ groups: [], stale: true }, { status: 502 })
  }
}
