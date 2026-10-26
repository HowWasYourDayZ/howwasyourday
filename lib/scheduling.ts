import { ukOffsetMs } from '@/lib/uk-time'
import { SESSION_DURATIONS } from '@/lib/constants'

// Scheduled sessions (PROJECT.md §8.4). Supabase is the system of record; all
// times are stored in UTC and shown/entered in UK time (Europe/London, BST-aware).
// These are the proposed defaults from PROJECT.md — change them here only.

export const SLOT_STEP_MINS          = 15   // slots start on :00 / :15 / :30 / :45
export const BOOKING_BUFFER_MINS     = 10   // gap a listener keeps between booked sessions
export const MIN_LEAD_MINS           = 120  // book at least 2 hours ahead
export const BOOKING_HORIZON_DAYS    = 14   // and at most 14 days ahead
export const JOIN_OPENS_MINS_BEFORE  = 5    // the session page opens 5 min before the start
export const LISTENER_NO_SHOW_MINS   = 5    // listener not joined 5 min after start → refund
export const SEEKER_NO_SHOW_MINS     = 10   // seeker not joined 10 min after start → cancelled
export const SEEKER_FREE_CANCEL_MINS = 120  // seeker cancels ≥2 h before → full refund
export const INSTANT_BLOCK_BEFORE_MINS = 15 // no instant requests this close to a booking
export const MAX_WINDOWS_PER_DAY     = 6
// Refund shares for late cancellations / no-shows. 1 = full refund. The owner
// has not decided a partial charge yet (PROJECT.md §8.4); anything below 1
// would also need the kept share paid to the listener through settlement.
export const SEEKER_LATE_CANCEL_REFUND_SHARE = 1
export const SEEKER_NO_SHOW_REFUND_SHARE     = 1

export type AvailabilityWindow = { weekday: number; start_min: number; end_min: number } // ISO weekday, UK local minutes
export type BusyInterval = { start: number; end: number } // epoch ms

const DAY_MS = 86_400_000

// UK local calendar parts for an instant.
export function ukParts(at: Date): { y: number; m: number; d: number; weekday: number; minutes: number; dateKey: string } {
  const local = new Date(at.getTime() + ukOffsetMs(at))
  const y = local.getUTCFullYear(), m = local.getUTCMonth() + 1, d = local.getUTCDate()
  const wd = local.getUTCDay() // 0 = Sunday
  return {
    y, m, d,
    weekday: wd === 0 ? 7 : wd,
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
    dateKey: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
  }
}

// UK local date + minutes-from-midnight → UTC instant. Handles BST: the offset
// is looked up for the guessed instant, then checked once more.
export function ukLocalToUtc(y: number, m: number, d: number, minutes: number): Date {
  const naive = Date.UTC(y, m - 1, d, 0, minutes)
  let t = naive - ukOffsetMs(new Date(naive))
  t = naive - ukOffsetMs(new Date(t))
  return new Date(t)
}

export function validateWindows(raw: unknown): { ok: true; windows: AvailabilityWindow[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) return { ok: false, error: 'windows must be a list' }
  if (raw.length > 7 * MAX_WINDOWS_PER_DAY) return { ok: false, error: 'Too many time windows' }
  const windows: AvailabilityWindow[] = []
  for (const w of raw) {
    const weekday = Number((w as AvailabilityWindow)?.weekday)
    const start = Number((w as AvailabilityWindow)?.start_min)
    const end = Number((w as AvailabilityWindow)?.end_min)
    if (![weekday, start, end].every(Number.isInteger)) return { ok: false, error: 'Invalid time window' }
    if (weekday < 1 || weekday > 7) return { ok: false, error: 'Invalid day' }
    if (start < 0 || end > 1440 || start >= end) return { ok: false, error: 'Each window must end after it starts' }
    if (start % SLOT_STEP_MINS || end % SLOT_STEP_MINS) return { ok: false, error: `Times must be on a ${SLOT_STEP_MINS}-minute boundary` }
    if (end - start < SESSION_DURATIONS[0]) return { ok: false, error: `Each window must be at least ${SESSION_DURATIONS[0]} minutes` }
    windows.push({ weekday, start_min: start, end_min: end })
  }
  for (let d = 1; d <= 7; d++) {
    const day = windows.filter(w => w.weekday === d).sort((a, b) => a.start_min - b.start_min)
    if (day.length > MAX_WINDOWS_PER_DAY) return { ok: false, error: 'Too many windows on one day' }
    for (let i = 1; i < day.length; i++) {
      if (day[i].start_min < day[i - 1].end_min) return { ok: false, error: 'Time windows on the same day overlap' }
    }
  }
  return { ok: true, windows }
}

/**
 * Bookable start times (UTC ISO strings) for one listener and one length.
 * A slot is offered when it fits wholly inside an availability window, is not
 * on a blocked UK date, is between MIN_LEAD_MINS and BOOKING_HORIZON_DAYS
 * ahead, and keeps BOOKING_BUFFER_MINS clear of every busy interval.
 */
export function generateSlots(opts: {
  windows: AvailabilityWindow[]
  blockedDates: Set<string>          // 'YYYY-MM-DD' UK dates
  busy: BusyInterval[]               // existing bookings (start..end, no buffer)
  durationMins: number
  now?: Date
}): string[] {
  const now = (opts.now ?? new Date()).getTime()
  const earliest = now + MIN_LEAD_MINS * 60_000
  const latest = now + BOOKING_HORIZON_DAYS * DAY_MS
  const buf = BOOKING_BUFFER_MINS * 60_000
  const len = opts.durationMins * 60_000
  const out: string[] = []
  for (let i = 0; i <= BOOKING_HORIZON_DAYS + 1; i++) {
    const p = ukParts(new Date(now + i * DAY_MS))
    if (opts.blockedDates.has(p.dateKey)) continue
    for (const w of opts.windows.filter(x => x.weekday === p.weekday)) {
      for (let m = w.start_min; m + opts.durationMins <= w.end_min; m += SLOT_STEP_MINS) {
        const start = ukLocalToUtc(p.y, p.m, p.d, m).getTime()
        if (start < earliest || start > latest) continue
        const end = start + len
        if (opts.busy.some(b => start < b.end + buf && end + buf > b.start)) continue
        out.push(new Date(start).toISOString())
      }
    }
  }
  return Array.from(new Set(out)).sort()
}

// "Tue 4 Nov, 7:30 pm" in UK time.
export function formatUkDateTime(iso: string | Date): string {
  return new Date(iso).toLocaleString('en-GB', {
    timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// Calendar file for a booking. Neutral title, no names or topic (PROJECT.md §8.4, §10.9).
export function buildIcs(opts: { sessionId: string; startIso: string; durationMins: number; joinUrl: string }): string {
  const fmt = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = new Date(opts.startIso).getTime()
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//How Was Your Day//Sessions//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${opts.sessionId}@howwasyourday.live`,
    `DTSTAMP:${fmt(Date.now())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(start + opts.durationMins * 60_000)}`,
    'SUMMARY:How Was Your Day session',
    `DESCRIPTION:Your ${opts.durationMins}-minute session. Join here: ${opts.joinUrl}`,
    `URL:${opts.joinUrl}`,
    'BEGIN:VALARM', 'TRIGGER:-PT15M', 'ACTION:DISPLAY', 'DESCRIPTION:How Was Your Day session in 15 minutes', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ]
  return lines.join('\r\n') + '\r\n'
}

// Google Calendar "add event" link (no Google API or OAuth scope needed).
export function googleCalendarUrl(opts: { startIso: string; durationMins: number; joinUrl: string }): string {
  const fmt = (t: number) => new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = new Date(opts.startIso).getTime()
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'How Was Your Day session',
    dates: `${fmt(start)}/${fmt(start + opts.durationMins * 60_000)}`,
    details: `Join here: ${opts.joinUrl}`,
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
