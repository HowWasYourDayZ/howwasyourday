import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { googleCalendarUrl } from '@/lib/scheduling'
import { processScheduled } from '@/lib/scheduled-sessions'

export const dynamic = 'force-dynamic'

// GET /api/sessions/upcoming — the signed-in user's booked sessions (as seeker
// or listener), soonest first, with the other person's chosen first name only.
export async function GET() {
  const { data: { user } } = await createServerSupabaseClient().auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const sb = createAdminClient()
  const { data, error } = await sb.from('sessions')
    .select('id, seeker_id, listener_id, duration_mins, session_type, amount_held, scheduled_start_at, listener:users!listener_id(name), seeker:users!seeker_id(name)')
    .eq('status', 'scheduled')
    .or(`seeker_id.eq.${user.id},listener_id.eq.${user.id}`)
    .order('scheduled_start_at', { ascending: true })
    .limit(50)
  if (error) return NextResponse.json({ upcoming: [] })
  // Settle any of these that have become no-shows before showing them.
  const due = (data ?? []).filter(s => Date.parse(s.scheduled_start_at as string) < Date.now() - 5 * 60_000)
  for (const s of due) await processScheduled(sb, s.id as string)
  const origin = 'https://www.howwasyourday.live'
  const upcoming = (data ?? []).filter(s => !due.includes(s)).map(s => {
    const role = s.seeker_id === user.id ? 'seeker' : 'listener'
    const peer = (role === 'seeker' ? s.listener : s.seeker) as { name?: string } | null
    const path = `/session/${s.id}?duration=${s.duration_mins}&type=${s.session_type}`
    return {
      id: s.id, role, peerName: peer?.name ?? (role === 'seeker' ? 'Your listener' : 'A seeker'),
      durationMins: s.duration_mins, sessionType: s.session_type, startAt: s.scheduled_start_at,
      amountHeld: role === 'seeker' ? Number(s.amount_held) : null,
      joinPath: path,
      icsPath: `/api/sessions/${s.id}/ics`,
      googleCalendarUrl: googleCalendarUrl({ startIso: s.scheduled_start_at as string, durationMins: s.duration_mins as number, joinUrl: origin + path }),
    }
  })
  return NextResponse.json({ upcoming })
}
