import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { BOOKING_HORIZON_DAYS, validateWindows } from '@/lib/scheduling'

// The signed-in listener's weekly hours for scheduled sessions (UK time) and
// whole days off (PROJECT.md §8.4). Not the online toggle — that is
// /api/listener/availability. Existing bookings are never changed by this.

async function listenerOrError() {
  const { data: { user } } = await createServerSupabaseClient().auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  const admin = createAdminClient()
  const { data: lp } = await admin.from('listener_profiles').select('user_id, is_approved').eq('user_id', user.id).maybeSingle()
  if (!lp) return { error: NextResponse.json({ error: 'Only listeners can set weekly hours.' }, { status: 403 }) }
  return { user, admin }
}

export async function GET() {
  const r = await listenerOrError()
  if ('error' in r) return r.error
  const [{ data: windows, error: wErr }, { data: blocked }] = await Promise.all([
    r.admin.from('listener_availability').select('weekday, start_min, end_min').eq('listener_id', r.user.id).order('weekday').order('start_min'),
    r.admin.from('listener_blocked_dates').select('day').eq('listener_id', r.user.id).gte('day', new Date().toISOString().slice(0, 10)).order('day'),
  ])
  if (wErr) {
    logger.error('schedule GET failed (migration 077 run?)', { error: wErr.message })
    return NextResponse.json({ error: 'Scheduling is not available yet.' }, { status: 503 })
  }
  return NextResponse.json({ windows: windows ?? [], blockedDates: (blocked ?? []).map(b => b.day) })
}

export async function PUT(req: NextRequest) {
  const r = await listenerOrError()
  if ('error' in r) return r.error
  if (!checkRateLimit(`schedule-put:${r.user.id}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many changes. Please wait a moment.' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  const v = validateWindows(body?.windows)
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 })

  const today = new Date().toISOString().slice(0, 10)
  const horizon = new Date(Date.now() + (BOOKING_HORIZON_DAYS + 30) * 86_400_000).toISOString().slice(0, 10)
  const rawDays: unknown[] = Array.isArray(body?.blockedDates) ? body.blockedDates : []
  const days = Array.from(new Set(rawDays.filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && d >= today && d <= horizon)))
  if (days.length > 60) return NextResponse.json({ error: 'Too many days off' }, { status: 400 })

  // Replace both sets. Small tables, one listener — delete + insert is fine.
  const del = await r.admin.from('listener_availability').delete().eq('listener_id', r.user.id)
  if (del.error) return NextResponse.json({ error: 'Could not save your hours.' }, { status: 500 })
  if (v.windows.length) {
    const ins = await r.admin.from('listener_availability').insert(v.windows.map(w => ({ ...w, listener_id: r.user.id })))
    if (ins.error) {
      logger.error('schedule PUT insert failed', { error: ins.error.message })
      return NextResponse.json({ error: 'Could not save your hours.' }, { status: 500 })
    }
  }
  await r.admin.from('listener_blocked_dates').delete().eq('listener_id', r.user.id).gte('day', today)
  if (days.length) await r.admin.from('listener_blocked_dates').insert(days.map(day => ({ listener_id: r.user.id, day })))
  return NextResponse.json({ ok: true, windows: v.windows, blockedDates: days.sort() })
}
