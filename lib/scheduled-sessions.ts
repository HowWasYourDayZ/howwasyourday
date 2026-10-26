import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import { sendPushToUser } from '@/lib/push'
import { sendScheduledSessionEmail } from '@/lib/notify'
import { formatGBP } from '@/lib/money'
import {
  INSTANT_BLOCK_BEFORE_MINS, LISTENER_NO_SHOW_MINS, SEEKER_NO_SHOW_MINS,
  SEEKER_NO_SHOW_REFUND_SHARE, formatUkDateTime, generateSlots, type AvailabilityWindow,
} from '@/lib/scheduling'

// Server-side lifecycle of scheduled sessions (PROJECT.md §8.4):
//   scheduled → active      both people joined (start_scheduled_session RPC)
//   scheduled → cancelled   cancelled by either side, or a no-show — refunded here
// Every transition is a conditional UPDATE on status = 'scheduled', so a refund
// can never run twice (the same rule as instant requests).

type Sb = SupabaseClient
export type ScheduledRow = {
  id: string; seeker_id: string; listener_id: string; status: string
  duration_mins: number; session_type: string; amount_held: number | string
  scheduled_start_at: string; seeker_joined_at: string | null; listener_joined_at: string | null
  reminder_24h_sent_at?: string | null; reminder_15m_sent_at?: string | null
}

export const SCHEDULED_COLUMNS =
  'id, seeker_id, listener_id, status, duration_mins, session_type, amount_held, scheduled_start_at, seeker_joined_at, listener_joined_at, reminder_24h_sent_at, reminder_15m_sent_at'

const SITE = 'https://www.howwasyourday.live'

async function notify(sb: Sb, userId: string, title: string, body: string, url: string, tag: string) {
  await sb.from('notifications').insert({ user_id: userId, type: 'scheduled_session', title, body, action_url: url })
    .then(() => {}, e => logger.warn('scheduled: notification insert failed', { error: String(e) }))
  try {
    await sendPushToUser(sb, userId, { title, body, url, tag, ttlSecs: 30 * 60 })
  } catch (e) {
    logger.warn('scheduled: push failed', { error: String(e) })
  }
}

async function emailOf(sb: Sb, userId: string): Promise<string | null> {
  const { data } = await sb.from('users').select('email').eq('id', userId).maybeSingle()
  return (data as { email?: string | null } | null)?.email ?? null
}

/**
 * Cancel a scheduled session and refund `share` (0..1) of the held amount.
 * Returns false if it was no longer 'scheduled' (someone else got there first).
 */
export async function cancelScheduled(sb: Sb, s: ScheduledRow, reason: string, share: number): Promise<boolean> {
  const now = new Date().toISOString()
  const { data: claimed } = await sb.from('sessions')
    .update({ status: 'cancelled', cancel_reason: reason, ended_at: now, responded_at: now })
    .eq('id', s.id).eq('status', 'scheduled')
    .select('id').maybeSingle()
  if (!claimed) return false

  const refund = Math.round(Number(s.amount_held) * Math.min(1, Math.max(0, share)))
  if (refund > 0) {
    const { error } = await sb.rpc('credit_wallet', { p_user_id: s.seeker_id, p_amount: refund })
    if (error) {
      logger.error('scheduled: refund failed — RECONCILIATION NEEDED', { sessionId: s.id, seekerId: s.seeker_id, refund, error: error.message })
    } else {
      await sb.from('wallet_transactions').insert({
        user_id: s.seeker_id, amount: refund, type: 'refund', session_id: s.id,
        description: reason === 'listener_no_show' ? 'Refund — listener did not join'
          : reason === 'listener_cancelled' ? 'Refund — listener cancelled the booking'
          : reason === 'seeker_no_show' ? 'Refund — session not joined'
          : 'Refund — booking cancelled',
      }).then(({ error: txErr }) => { if (txErr) logger.error('scheduled: refund ledger insert failed (audit gap)', { sessionId: s.id }) })
    }
  }
  if (refund < Number(s.amount_held)) {
    // A partial refund needs the kept share paid out through settlement — not
    // built yet (all refund shares are 1 by default, lib/scheduling.ts).
    logger.error('scheduled: partial refund kept money without settlement — owner decision pending', { sessionId: s.id, refund })
  }

  const when = formatUkDateTime(s.scheduled_start_at)
  const money = refund > 0 ? ` ${formatGBP(refund)} is back in your wallet.` : ''
  if (reason === 'listener_cancelled' || reason === 'listener_no_show') {
    await notify(sb, s.seeker_id, 'Your booked session was cancelled',
      `${reason === 'listener_no_show' ? 'Your listener did not join' : 'Your listener cancelled'} the session on ${when}.${money}`,
      '/browse', `hwyd-sched-${s.id}`)
  } else if (reason === 'seeker_cancelled_scheduled') {
    await notify(sb, s.listener_id, 'A booked session was cancelled', `The session on ${when} was cancelled by the seeker.`, '/dashboard', `hwyd-sched-${s.id}`)
  } else if (reason === 'seeker_no_show') {
    await notify(sb, s.seeker_id, 'You missed your booked session', `The session on ${when} was not joined.${money}`, '/sessions', `hwyd-sched-${s.id}`)
  }
  return true
}

// Mark one side as joined and start the session once both are in.
export async function joinScheduled(sb: Sb, s: ScheduledRow, side: 'seeker' | 'listener'): Promise<'active' | 'waiting'> {
  const col = side === 'seeker' ? 'seeker_joined_at' : 'listener_joined_at'
  if (!s[col]) {
    await sb.from('sessions').update({ [col]: new Date().toISOString() }).eq('id', s.id).eq('status', 'scheduled').is(col, null)
  }
  const { data: started, error } = await sb.rpc('start_scheduled_session', { p_session_id: s.id })
  if (error) {
    // e.g. sessions_*_one_active: one of them is still in another live session.
    logger.warn('scheduled: start failed', { sessionId: s.id, error: error.message })
    return 'waiting'
  }
  return started ? 'active' : 'waiting'
}

/**
 * Due work for scheduled sessions — no-shows and reminders. Runs from the
 * cron tick (every ~5 min, .github/workflows/scheduled-tick.yml) and lazily
 * whenever someone opens or joins a booked session.
 */
export async function processScheduled(sb: Sb, onlySessionId?: string): Promise<{ noShows: number; reminders: number }> {
  const now = Date.now()
  let noShows = 0, reminders = 0

  // 1. No-shows: started more than LISTENER/SEEKER_NO_SHOW_MINS ago, still not active.
  let q = sb.from('sessions').select(SCHEDULED_COLUMNS).eq('status', 'scheduled')
    .lte('scheduled_start_at', new Date(now - LISTENER_NO_SHOW_MINS * 60_000).toISOString()).limit(200)
  if (onlySessionId) q = q.eq('id', onlySessionId)
  const { data: late } = await q
  for (const s of (late ?? []) as ScheduledRow[]) {
    const mins = (now - Date.parse(s.scheduled_start_at)) / 60_000
    // Re-check the time here too: never cancel a booking that hasn't reached its no-show point.
    if (!(mins >= LISTENER_NO_SHOW_MINS)) continue
    if (!s.listener_joined_at) {
      if (await cancelScheduled(sb, s, 'listener_no_show', 1)) noShows++
    } else if (!s.seeker_joined_at && mins >= SEEKER_NO_SHOW_MINS) {
      if (await cancelScheduled(sb, s, 'seeker_no_show', SEEKER_NO_SHOW_REFUND_SHARE)) noShows++
    }
    else if (s.seeker_joined_at && s.listener_joined_at && mins >= s.duration_mins) {
      // Both joined but it never started (e.g. one was still in another live
      // session) and the booked time is over: refund in full.
      if (await cancelScheduled(sb, s, 'start_failed', 1)) noShows++
    }
  }
  if (onlySessionId) return { noShows, reminders }

  // 2. Reminders: 24 hours and 15 minutes before. Claimed with a conditional
  //    UPDATE so two ticks never send the same reminder twice.
  const plan: { col: 'reminder_24h_sent_at' | 'reminder_15m_sent_at'; within: number; label: string }[] = [
    { col: 'reminder_24h_sent_at', within: 24 * 60, label: 'tomorrow' },
    { col: 'reminder_15m_sent_at', within: 15, label: 'in 15 minutes' },
  ]
  for (const r of plan) {
    const { data: due } = await sb.from('sessions').select(SCHEDULED_COLUMNS).eq('status', 'scheduled')
      .is(r.col, null)
      .gt('scheduled_start_at', new Date(now).toISOString())
      .lte('scheduled_start_at', new Date(now + r.within * 60_000).toISOString())
      .limit(200)
    for (const s of (due ?? []) as ScheduledRow[]) {
      const { data: claimed } = await sb.from('sessions').update({ [r.col]: new Date().toISOString() })
        .eq('id', s.id).eq('status', 'scheduled').is(r.col, null).select('id').maybeSingle()
      if (!claimed) continue
      // A 24h reminder for a booking made less than a day ahead would be noise.
      if (r.col === 'reminder_24h_sent_at' && Date.parse(s.scheduled_start_at) - now < 2 * 60 * 60_000) continue
      const when = formatUkDateTime(s.scheduled_start_at)
      const url = `/session/${s.id}?duration=${s.duration_mins}&type=${s.session_type}`
      for (const userId of [s.seeker_id, s.listener_id]) {
        await notify(sb, userId, `Your session is ${r.label}`, `${s.duration_mins}-minute ${s.session_type} session on ${when} (UK time). The session page opens 5 minutes before.`, url, `hwyd-sched-rem-${s.id}`)
        const email = await emailOf(sb, userId)
        if (email) await sendScheduledSessionEmail({ to: email, kind: 'reminder', when, durationMins: s.duration_mins, sessionType: s.session_type, url: SITE + url, sessionId: s.id })
      }
      reminders++
    }
  }
  return { noShows, reminders }
}

/**
 * Does this listener have a booking that an instant session of `mins` minutes
 * starting now would run into? (INSTANT_BLOCK_BEFORE_MINS before a booking
 * until it ends.) Used by instant booking, Talk now and accept.
 */
export async function listenerHasBookingSoon(sb: Sb, listenerId: string, mins: number): Promise<boolean> {
  const now = Date.now()
  const { data } = await sb.from('sessions').select('scheduled_start_at, duration_mins')
    .eq('listener_id', listenerId).eq('status', 'scheduled')
    .lte('scheduled_start_at', new Date(now + (mins + INSTANT_BLOCK_BEFORE_MINS) * 60_000).toISOString())
    .gte('scheduled_start_at', new Date(now - 60 * 60_000).toISOString())
    .limit(5)
  return (data ?? []).some(r => {
    const start = Date.parse(r.scheduled_start_at as string)
    const end = start + Number(r.duration_mins) * 60_000
    return now < end && now + (mins + INSTANT_BLOCK_BEFORE_MINS) * 60_000 > start
  })
}

// Listener ids (of a list) with a booking coming up soon — for Talk now / browse.
export async function listenersWithBookingSoon(sb: Sb, listenerIds: string[], mins: number): Promise<Set<string>> {
  if (listenerIds.length === 0) return new Set()
  const now = Date.now()
  const { data } = await sb.from('sessions').select('listener_id, scheduled_start_at, duration_mins')
    .in('listener_id', listenerIds).eq('status', 'scheduled')
    .lte('scheduled_start_at', new Date(now + (mins + INSTANT_BLOCK_BEFORE_MINS) * 60_000).toISOString())
    .gte('scheduled_start_at', new Date(now - 60 * 60_000).toISOString())
  const out = new Set<string>()
  for (const r of data ?? []) {
    const start = Date.parse(r.scheduled_start_at as string)
    if (now < start + Number(r.duration_mins) * 60_000) out.add(r.listener_id as string)
  }
  return out
}

/**
 * Bookable slots for a listener — THE rule shared by the slot list and booking
 * (booking re-checks the requested time against this, then the RPC re-checks
 * overlaps under a lock). Returns null if the listener can't be booked.
 */
export async function loadListenerSlots(sb: Sb, listenerId: string, durationMins: number): Promise<string[] | null> {
  const { data: lp } = await sb.from('listener_profiles').select('user_id')
    .eq('user_id', listenerId).eq('is_approved', true).eq('is_active', true).eq('is_suspended', false).maybeSingle()
  if (!lp) return null
  const today = new Date().toISOString().slice(0, 10)
  const [{ data: windows, error }, { data: blocked }, { data: booked }] = await Promise.all([
    sb.from('listener_availability').select('weekday, start_min, end_min').eq('listener_id', listenerId),
    sb.from('listener_blocked_dates').select('day').eq('listener_id', listenerId).gte('day', today),
    sb.from('sessions').select('scheduled_start_at, duration_mins').eq('listener_id', listenerId).eq('status', 'scheduled')
      .gte('scheduled_start_at', new Date(Date.now() - 60 * 60_000).toISOString()),
  ])
  if (error) return []
  return generateSlots({
    windows: (windows ?? []) as AvailabilityWindow[],
    blockedDates: new Set((blocked ?? []).map(b => b.day as string)),
    busy: (booked ?? []).map(b => {
      const start = Date.parse(b.scheduled_start_at as string)
      return { start, end: start + Number(b.duration_mins) * 60_000 }
    }),
    durationMins,
  })
}
