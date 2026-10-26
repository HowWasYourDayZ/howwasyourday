import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { UUID_RE, SESSION_DURATIONS, PLATFORM_FEE, DEFAULT_LISTENER_RATE, serviceFeeRateAt } from '@/lib/constants'
import { quoteSession } from '@/lib/geo-pricing'
import { checkRateLimit } from '@/lib/rate-limit'
import { suspensionStatus } from '@/lib/suspension'
import { logger } from '@/lib/logger'
import { sendScheduledSessionEmail } from '@/lib/notify'
import { sendPushToUser } from '@/lib/push'
import { BOOKING_BUFFER_MINS, buildIcs, formatUkDateTime } from '@/lib/scheduling'
import { loadListenerSlots } from '@/lib/scheduled-sessions'

const SITE = 'https://www.howwasyourday.live'

// POST /api/sessions/schedule — book a session for a future time
// (PROJECT.md §8.4). Body: { listenerId, durationMins, sessionType, startAt }.
// The price is held from the wallet now; book_scheduled_session (migration 077)
// does the overlap check + wallet hold in one locked transaction.
export async function POST(req: NextRequest) {
  try {
    const { data: { user } } = await createServerSupabaseClient().auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!checkRateLimit(`schedule:${user.id}`, 6, 60_000)) {
      return NextResponse.json({ error: 'Too many requests. Please wait.' }, { status: 429 })
    }

    const body = await req.json().catch(() => ({}))
    const listenerId = String(body?.listenerId ?? '')
    const durationMins = Number(body?.durationMins)
    const sessionType = body?.sessionType === 'voice' ? 'voice' : body?.sessionType === 'text' ? 'text' : null
    const startAt = typeof body?.startAt === 'string' ? new Date(body.startAt) : null
    if (!UUID_RE.test(listenerId)) return NextResponse.json({ error: 'Invalid listener' }, { status: 400 })
    if (listenerId === user.id) return NextResponse.json({ error: 'cannot_book_self', message: 'You cannot book your own listener profile.' }, { status: 400 })
    if (!(SESSION_DURATIONS as readonly number[]).includes(durationMins)) return NextResponse.json({ error: 'Invalid session duration' }, { status: 400 })
    if (!sessionType) return NextResponse.json({ error: 'Invalid session type' }, { status: 400 })
    if (!startAt || Number.isNaN(startAt.getTime())) return NextResponse.json({ error: 'Invalid start time' }, { status: 400 })

    const sb = createAdminClient()
    const status = await suspensionStatus(sb, user.id)
    if (status === 'error') return NextResponse.json({ error: 'Could not check your account right now. Please try again.' }, { status: 503 })
    if (status === 'suspended') return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 })

    // The requested time must be one of the listener's offered slots.
    const slots = await loadListenerSlots(sb, listenerId, durationMins)
    if (slots === null) return NextResponse.json({ error: 'listener_unavailable', message: 'This listener is not taking bookings.' }, { status: 404 })
    const startIso = startAt.toISOString()
    if (!slots.includes(startIso)) {
      return NextResponse.json({ error: 'slot_unavailable', message: 'That time is no longer available. Please pick another.' }, { status: 409 })
    }

    const { data: lp } = await sb.from('listener_profiles').select('rate_per_min, voice_disabled, custom_service_fee_rate').eq('user_id', listenerId).maybeSingle()
    const row = lp as { rate_per_min?: number; voice_disabled?: boolean; custom_service_fee_rate?: number | null } | null
    if (sessionType === 'voice' && row?.voice_disabled) {
      return NextResponse.json({ error: 'voice_disabled', message: 'This listener only takes text sessions.' }, { status: 400 })
    }
    const { rate, total } = quoteSession(Number(row?.rate_per_min ?? DEFAULT_LISTENER_RATE), sessionType, durationMins, false)
    // Service fee locked at booking (same as instant: PROJECT.md §5).
    const feeRate = row?.custom_service_fee_rate ?? serviceFeeRateAt(new Date().toISOString())

    const { data: sessionId, error: rpcErr } = await sb.rpc('book_scheduled_session', {
      p_seeker_id: user.id,
      p_listener_id: listenerId,
      p_session_type: sessionType,
      p_duration_mins: durationMins,
      p_amount_held: total,
      p_platform_fee: PLATFORM_FEE,
      p_rate_per_min: Math.round(rate),
      p_service_fee_rate: feeRate,
      p_start_at: startIso,
      p_buffer_mins: BOOKING_BUFFER_MINS,
      p_agora_channel: `lo_${crypto.randomUUID()}`,
    })
    if (rpcErr) {
      const m = rpcErr.message || ''
      if (m.includes('insufficient_balance')) return NextResponse.json({ error: 'insufficient_balance', required: total }, { status: 400 })
      if (m.includes('slot_taken') || m.includes('slot_in_past')) return NextResponse.json({ error: 'slot_unavailable', message: 'That time was just taken. Please pick another.' }, { status: 409 })
      if (m.includes('seeker_overlap')) return NextResponse.json({ error: 'seeker_overlap', message: 'You already have a session booked at that time.' }, { status: 409 })
      logger.error('schedule: booking RPC failed', { error: m })
      return NextResponse.json({ error: 'Could not book this session. Please try again.' }, { status: 500 })
    }

    const { error: txErr } = await sb.from('wallet_transactions').insert({
      user_id: user.id, amount: total, type: 'debit', session_id: sessionId,
      description: `${durationMins}-min ${sessionType} session (booked)`,
    })
    if (txErr) logger.error('schedule: wallet_transactions insert failed (audit gap)', { sessionId, error: txErr.message })

    // Confirmations: in-app + push to both, email (+ .ics) where we have one.
    const when = formatUkDateTime(startIso)
    const path = `/session/${sessionId}?duration=${durationMins}&type=${sessionType}`
    const ics = buildIcs({ sessionId: String(sessionId), startIso, durationMins, joinUrl: SITE + path })
    const confirm = async (uid: string, title: string, text: string, url: string) => {
      await sb.from('notifications').insert({ user_id: uid, type: 'scheduled_session', title, body: text, action_url: url }).then(() => {}, () => {})
      await sendPushToUser(sb, uid, { title, body: text, url, tag: `hwyd-sched-${sessionId}`, ttlSecs: 60 * 60 }).catch(() => {})
      const { data: u } = await sb.from('users').select('email').eq('id', uid).maybeSingle()
      const email = (u as { email?: string | null } | null)?.email
      if (email) await sendScheduledSessionEmail({ to: email, kind: 'confirmation', when, durationMins, sessionType, url: SITE + path, sessionId: String(sessionId), ics })
    }
    await confirm(user.id, 'Session booked', `${durationMins}-minute ${sessionType} session on ${when} (UK time).`, '/sessions')
    await confirm(listenerId, 'New booked session', `A ${durationMins}-minute ${sessionType} session was booked for ${when} (UK time).`, '/dashboard')

    return NextResponse.json({ sessionId, total, startAt: startIso })
  } catch (err) {
    logger.error('schedule: unexpected error', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
