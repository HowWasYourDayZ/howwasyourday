// ALL money amounts are integer PENCE (GBP) — see lib/money.ts.
export const PLATFORM_FEE       = 100  // flat £1 per paid session added on top of listener rate (paid by seeker) — unchanged by the service fee below
// How Was Your Day's service fee on listener earnings, deducted from the listener's
// share at settlement (lib/session-billing.ts). The seeker's charge
// (amountHeld) and the flat PLATFORM_FEE above are completely unaffected.
//
// RULE: a session's fee rate is LOCKED when the session starts (started_at),
// looked up in this schedule — not whatever rate is deployed at settlement.
// So a session that starts under one rate and settles after a change keeps
// its original rate, and re-running settlement later gives the same answer.
// To change the rate: ADD a new entry at the top with the go-live time (UTC)
// — never edit or delete past entries. Newest first.
// NOTE: user-facing copy that states hard-coded numbers must be updated
// alongside it — see the surface list in CLAUDE.md.
const SERVICE_FEE_SCHEDULE: ReadonlyArray<{ from: number; rate: number }> = [
  { from: Date.parse('2026-09-24T05:15:00Z'), rate: 0.40 }, // 40% deploy (commit b90fc5a, pushed 05:12 UTC)
  { from: Date.parse('2026-09-14T13:20:00Z'), rate: 0.15 }, // 15% deploy (pushed 13:18 UTC)
  { from: -Infinity,                          rate: 0    },
]
// The rate for sessions starting now.
export const LISTENER_SERVICE_FEE_RATE = SERVICE_FEE_SCHEDULE[0].rate
// Rate in force at `at` (a session's started_at). Missing/invalid → current rate.
export function serviceFeeRateAt(at?: string | null): number {
  const t = at ? Date.parse(at) : NaN
  if (!Number.isFinite(t)) return LISTENER_SERVICE_FEE_RATE
  return (SERVICE_FEE_SCHEDULE.find(e => t >= e.from) ?? SERVICE_FEE_SCHEDULE[SERVICE_FEE_SCHEDULE.length - 1]).rate
}
// Payment-processor fee, borne by the seeker at top-up time. The wallet is
// credited the selected tier; the gross charge includes this fee.
// TODO(whop): set to Whop's actual fee once the Whop integration replaces Razorpay.
export const GATEWAY_FEE_RATE   = 0.03
export const grossRechargeAmount = (amount: number) => Math.ceil(amount * (1 + GATEWAY_FEE_RATE))
export const MIN_LISTENER_RATE  = 10   // pence/min (10p)
export const MAX_LISTENER_RATE  = 500  // pence/min (£5) — enforced by lp_rate_range (migration 073)
export const DEFAULT_LISTENER_RATE = 40 // pence/min (40p) — listener_profiles.rate_per_min default
// Text/voice pricing (2026-09-24). Only the TEXT rate is stored
// (listener_profiles.rate_per_min); voice is always text + VOICE_RATE_PREMIUM,
// so voice > text holds structurally and no migration is needed.
// Kill switch: set NEXT_PUBLIC_VOICE_PRICING=false and redeploy → one rate for
// both modes again. Read by both client and server (inlined at build), so the
// price shown and the price charged always agree.
export const VOICE_PRICING_ENABLED = process.env.NEXT_PUBLIC_VOICE_PRICING !== 'false'
export const VOICE_RATE_PREMIUM    = 10 // pence/min (10p)
// Sessions booked before this (the voice-pricing deploy) never paid the premium.
export const VOICE_PRICING_FROM    = Date.parse('2026-09-24T04:55:00Z')
export const sessionRatePerMin = (textRate: number, type: 'text' | 'voice') =>
  type === 'voice' && VOICE_PRICING_ENABLED ? textRate + VOICE_RATE_PREMIUM : textRate
export const FREE_SESSION_MINS  = 5
// Each user gets N free 5-min trials (N = MAX_FREE_TRIALS, now 1 — so one per
// account in practice), at most ONE per listener (so they can try the
// product before paying). Reduced 5 → 3 (2026-08-11) → 2 → 1 (2026-09-13):
// multiple free trials let users satisfy casual "need to vent" needs without
// ever reaching the paywall — at 2 trials, 101/104 free users never recharged.
// 1 trial preserves a genuine try-before-you-buy moment while making the
// paywall decision unavoidable after the first session.
// NOTE: any user-facing copy stating the number must be updated alongside this
// (app/browse/page.tsx nudge, app/session/[id]/page.tsx conversion screen,
// homepage FAQ, /faq, city page FAQs, layout Service schema, public/llms.txt).
export const MAX_FREE_TRIALS    = 1
export const SESSION_DURATIONS  = [5, 15, 30, 45] as const
// How long a seeker's session REQUEST stays open waiting for the listener to
// accept, before it auto-cancels and refunds the seeker. This is the single
// source of truth — the seeker waiting screen, the listener dashboard countdown,
// the listener catch-up guard, the accept-too-late check, and the stale-pending
// cleanup all read it, so they can never drift out of sync.
export const REQUEST_RESPONSE_WINDOW_SECS = 180 // 3 minutes
export const REQUEST_RESPONSE_WINDOW_MS   = REQUEST_RESPONSE_WINDOW_SECS * 1000

// Listener presence (lib/listener-presence.ts). A listener with no heartbeat for
// STALE_HEARTBEAT_MINS goes offline. STALE is load-bearing: see PROJECT.md §8.2.3.
// AWAY_WITH_ALERTS_MINS: a listener whose phone can get a request alert stays
// online that long without heartbeats (How Was Your Day in the background, screen
// locked). 240 until 2026-10-16, then switched off (15 for everyone), back on
// at 60 from 2026-10-19 (owner decision) — away listeners are asked last by
// Talk now and go offline on their first unanswered request.
export const STALE_HEARTBEAT_MINS  = 15
export const AWAY_WITH_ALERTS_MINS = 60
// A How Was Your Day tab closing (pagehide, not bfcache) ages the listener's heartbeat so
// they go offline LEAVE_GRACE_SECS later unless another How Was Your Day tab / a reload
// heart-beats first (every 60–90s). Must stay well above the heartbeat interval.
export const LEAVE_GRACE_SECS = 180
export const RECHARGE_AMOUNTS   = [500, 1000, 2000, 5000] as const // pence: £5 / £10 / £20 / £50
export const MIN_RECHARGE       = 500    // pence (£5) — custom top-up floor
export const MAX_RECHARGE       = 20_000 // pence (£200) — custom top-up ceiling
export const UUID_RE            = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// Crisis lines shown across the site (UK launch). Only these — see PROJECT.md §12.
export const CRISIS_RESOURCES   = {
  SAMARITANS: { name: 'Samaritans', number: '116 123',            href: 'tel:116123' },
  SHOUT:      { name: 'Shout',      number: 'text SHOUT to 85258', href: 'sms:85258' },
  EMERGENCY:  { name: 'Emergency',  number: '999 / 112',          href: 'tel:112' },
} as const

export const LANGUAGES = [
  { id: 'english',    label: 'English' },
  { id: 'welsh',      label: 'Cymraeg (Welsh)' },
  { id: 'irish',      label: 'Gaeilge (Irish)' },
  { id: 'french',     label: 'Français (French)' },
  { id: 'german',     label: 'Deutsch (German)' },
  { id: 'spanish',    label: 'Español (Spanish)' },
  { id: 'italian',    label: 'Italiano (Italian)' },
  { id: 'portuguese', label: 'Português (Portuguese)' },
  { id: 'dutch',      label: 'Nederlands (Dutch)' },
  { id: 'polish',     label: 'Polski (Polish)' },
  { id: 'romanian',   label: 'Română (Romanian)' },
  { id: 'greek',      label: 'Ελληνικά (Greek)' },
  { id: 'swedish',    label: 'Svenska (Swedish)' },
  { id: 'urdu',       label: 'اردو (Urdu)' },
  { id: 'punjabi',    label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { id: 'arabic',     label: 'العربية (Arabic)' },
] as const

export type LanguageId = typeof LANGUAGES[number]['id']

// ── Message reactions ───────────────────────────────────────────────────────
// Deliberately a SHORT, SUPPORTIVE-ONLY set.
//
// A thumbs-down (or any negative reaction) is intentionally excluded: How Was Your Day is
// an emotional-support product, and letting someone react negatively to another
// person's vulnerable message is a wellbeing risk, not a feature. Ambiguous
// reactions (e.g. a crying face, which can read as pity) are excluded for the
// same reason. What remains maps to the things a listener or seeker actually
// wants to express without interrupting the conversation:
//   ❤️ I care / that matters   🙏 thank you   🫂 sending a hug   😊 warmth
// This list is mirrored by a CHECK constraint in migration 051 so it cannot drift.
export const MESSAGE_REACTIONS = ['❤️', '🙏', '🫂', '😊'] as const
export type MessageReaction = typeof MESSAGE_REACTIONS[number]

// ── Listener age (month + year only — never the day, for privacy) ───────────
// Minimum age to be a listener; How Was Your Day is an adults-only platform.
export const MIN_LISTENER_AGE = 18
// Oldest birth year we offer in the dropdown (keeps the list finite/sane).
export const MAX_LISTENER_AGE = 90

// Browse age-range filter buckets. `max: 200` on the last bucket means "and up".
export const AGE_RANGES = [
  { id: '18-29', label: '18–29', min: 18, max: 29 },
  { id: '30-39', label: '30–39', min: 30, max: 39 },
  { id: '40-49', label: '40–49', min: 40, max: 49 },
  { id: '50-59', label: '50–59', min: 50, max: 59 },
  { id: '60+',   label: '60+',   min: 60, max: 200 },
] as const

export type AgeRangeId = typeof AGE_RANGES[number]['id']

export const MONTHS = [
  { id: 1, label: 'January' },   { id: 2,  label: 'February' }, { id: 3,  label: 'March' },
  { id: 4, label: 'April' },     { id: 5,  label: 'May' },      { id: 6,  label: 'June' },
  { id: 7, label: 'July' },      { id: 8,  label: 'August' },   { id: 9,  label: 'September' },
  { id: 10, label: 'October' },  { id: 11, label: 'November' }, { id: 12, label: 'December' },
] as const

// Compute age (whole years) from month+year precision only. Returns null if the
// inputs are missing/invalid. Uses month-level precision — the birthday is
// treated as the 1st of the birth month.
export function ageFromBirth(year?: number | null, month?: number | null): number | null {
  if (!year || !month || month < 1 || month > 12) return null
  const now = new Date()
  let age = now.getFullYear() - year
  if ((now.getMonth() + 1) < month) age -= 1
  return age >= 0 && age <= 130 ? age : null
}

// Map a birth month+year to its AGE_RANGES bucket id, or null if unknown.
export function ageRangeId(year?: number | null, month?: number | null): AgeRangeId | null {
  const age = ageFromBirth(year, month)
  if (age === null) return null
  return AGE_RANGES.find(r => age >= r.min && age <= r.max)?.id ?? null
}
