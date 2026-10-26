import { NextRequest, NextResponse } from 'next/server'
import { JOIN_OPENS_MINS_BEFORE } from '@/lib/scheduling'
import { joinScheduled, processScheduled, SCHEDULED_COLUMNS, type ScheduledRow } from '@/lib/scheduled-sessions'
import { loadOwnSession } from '@/lib/scheduled-auth'

// POST /api/sessions/[id]/join — a participant opened a booked session. Records
// that they're here; the session goes 'active' (timer starts) once both have
// joined. Also settles a no-show for this session if it's due. The session page
// calls this every ~15s while waiting.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const r = await loadOwnSession(params.id)
  if ('error' in r) return r.error
  let s = r.s
  if (s.status === 'scheduled') {
    await processScheduled(r.sb, s.id)
    const { data } = await r.sb.from('sessions').select(SCHEDULED_COLUMNS).eq('id', s.id).maybeSingle()
    if (data) s = data as ScheduledRow
  }
  if (s.status !== 'scheduled') return NextResponse.json({ status: s.status })
  const opensAt = Date.parse(s.scheduled_start_at) - JOIN_OPENS_MINS_BEFORE * 60_000
  if (Date.now() < opensAt) {
    return NextResponse.json({ status: 'scheduled', opensAt: new Date(opensAt).toISOString(), startAt: s.scheduled_start_at })
  }
  const result = await joinScheduled(r.sb, s, r.side)
  return NextResponse.json({ status: result === 'active' ? 'active' : 'scheduled', waitingFor: result === 'active' ? null : r.side === 'seeker' ? 'listener' : 'seeker', startAt: s.scheduled_start_at })
}
