import { PLATFORM_FEE, MIN_LISTENER_RATE, DEFAULT_LISTENER_RATE } from '@/lib/constants'
import { formatGBP, formatRate } from '@/lib/money'

// What seekers pay — the pricing RULES (every amount in pence, lib/money.ts).
// There is no live listener data yet, so this quotes the rules (minimum rate,
// default rate), never an invented "typical" price. Once listeners are live,
// refresh a dated snapshot here from the "Live visibility audit" → listeners.rates.
// Seeker prices only — never present these as listener earnings (CLAUDE.md).
export const PRICE_SNAPSHOT = {
  asOf: 'launch (October 2026)',
  minRate: MIN_LISTENER_RATE,         // pence/min, lowest rate a listener can set
  defaultRate: DEFAULT_LISTENER_RATE, // pence/min, a new listener's starting rate
} as const

export const seeker15 = (ratePerMin: number) => ratePerMin * 15 + PLATFORM_FEE

export const PRICE_RANGE_LINE =
  `Each listener sets their own per-minute price (from ${formatRate(PRICE_SNAPSHOT.minRate)}); a paid session adds a flat ${formatGBP(PLATFORM_FEE)} platform fee. ` +
  `At the standard ${formatRate(PRICE_SNAPSHOT.defaultRate)}, 15 minutes of text costs ${formatGBP(seeker15(PRICE_SNAPSHOT.defaultRate))}.`
