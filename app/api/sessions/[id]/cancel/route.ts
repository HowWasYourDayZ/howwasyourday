import { NextRequest, NextResponse } from 'next/server'
import { SEEKER_FREE_CANCEL_MINS, SEEKER_LATE_CANCEL_REFUND_SHARE } from '@/lib/scheduling'
import { cancelScheduled } from '@/lib/scheduled-sessions'
import { loadOwnSession } from '@/lib/scheduled-auth'

// POST /api/sessions/[id]/cancel — cancel a BOOKED session before it starts.
// Seeker: full refund up to SEEKER_FREE_CANCEL_MINS before (later: the late
// share, currently also full). Listener: always a full refund to the seeker,
// and the cancellation is recorded against the listener (cancel_reason).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const r = await loadOwnSession(params.id)
  if ('error' in r) return r.error
  const { s, side } = r
  if (s.status !== 'scheduled') return NextResponse.json({ error: 'not_scheduled', message: 'This session can no longer be cancelled.' }, { status: 409 })
  const start = Date.parse(s.scheduled_start_at)
  if (Date.now() >= start) return NextResponse.json({ error: 'already_started', message: 'This session has already started.' }, { status: 409 })
  const early = Date.now() <= start - SEEKER_FREE_CANCEL_MINS * 60_000
  const ok = side === 'listener'
    ? await cancelScheduled(r.sb, s, 'listener_cancelled', 1)
    : await cancelScheduled(r.sb, s, 'seeker_cancelled_scheduled', early ? 1 : SEEKER_LATE_CANCEL_REFUND_SHARE)
  if (!ok) return NextResponse.json({ error: 'not_scheduled', message: 'This session can no longer be cancelled.' }, { status: 409 })
  return NextResponse.json({ ok: true })
}
