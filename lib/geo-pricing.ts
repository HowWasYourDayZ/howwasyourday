import { PLATFORM_FEE, sessionRatePerMin } from '@/lib/constants'
import { formatGBP } from '@/lib/money'

// Session pricing — one currency (GBP, integer pence) for every seeker in the
// UK and EU. There is no country-based pricing: a session costs the listener's
// per-minute rate × minutes + the flat PLATFORM_FEE, wherever the seeker is.
// (The LeanOn original had India vs overseas "NRI" pricing; it was removed.)

export const HOME_COUNTRY = 'GB'

// Dial code → country, longest code first. Used only to record
// users.account_country from the OTP-verified phone; it never changes a price.
const DIAL_CODES: [string, string][] = [
  ['353', 'IE'], ['351', 'PT'], ['352', 'LU'], ['356', 'MT'], ['357', 'CY'], ['358', 'FI'],
  ['359', 'BG'], ['370', 'LT'], ['371', 'LV'], ['372', 'EE'], ['385', 'HR'], ['386', 'SI'],
  ['420', 'CZ'], ['421', 'SK'],
  ['30', 'GR'], ['31', 'NL'], ['32', 'BE'], ['33', 'FR'], ['34', 'ES'], ['36', 'HU'],
  ['39', 'IT'], ['40', 'RO'], ['43', 'AT'], ['44', 'GB'], ['45', 'DK'], ['46', 'SE'],
  ['48', 'PL'], ['49', 'DE'],
]

/**
 * The account's country, from the OTP-verified phone's dial code (falls back to
 * the stored account_country, then GB). Informational only — pricing is the
 * same everywhere.
 */
export function pricingCountry(phone: string | null | undefined, accountCountry: string | null | undefined): string {
  const d = (phone ?? '').replace(/\D/g, '')
  if (d && (phone ?? '').startsWith('+')) {
    for (const [code, cc] of DIAL_CODES) if (d.startsWith(code)) return cc
  }
  return accountCountry || HOME_COUNTRY
}

/**
 * THE price quote for a session — used by POST /api/sessions (the amount
 * actually held) and /api/talk/candidates (the price shown before booking), so
 * the two can't drift. `textRate` is listener_profiles.rate_per_min (pence).
 * Returns the per-minute rate for this mode (what settlement caps the
 * listener's share at) and the total charged, in pence.
 */
export function quoteSession(textRate: number, sessionType: 'text' | 'voice', durationMins: number, free: boolean) {
  const rate = sessionRatePerMin(textRate, sessionType)
  const total = free ? 0 : rate * durationMins + PLATFORM_FEE
  return { rate, total }
}

// Price label for booking UI: 700 → "£7".
export function getBookingPriceDisplay(pence: number): string {
  return formatGBP(pence)
}
