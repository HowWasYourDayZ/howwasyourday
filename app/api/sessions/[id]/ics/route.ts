import { NextRequest, NextResponse } from 'next/server'
import { buildIcs } from '@/lib/scheduling'
import { loadOwnSession } from '@/lib/scheduled-auth'

// GET /api/sessions/[id]/ics — calendar file for a booked session (participants
// only). Neutral title, no names or topic (PROJECT.md §8.4).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const r = await loadOwnSession(params.id)
  if ('error' in r) return r.error
  if (!r.s.scheduled_start_at) return NextResponse.json({ error: 'Not a booked session' }, { status: 400 })
  const origin = new URL(req.url).origin
  const ics = buildIcs({
    sessionId: r.s.id, startIso: r.s.scheduled_start_at, durationMins: r.s.duration_mins,
    joinUrl: `${origin}/session/${r.s.id}?duration=${r.s.duration_mins}&type=${r.s.session_type}`,
  })
  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="how-was-your-day-session.ics"',
      'Cache-Control': 'no-store',
    },
  })
}
