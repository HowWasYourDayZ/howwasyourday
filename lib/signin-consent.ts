import crypto from 'crypto'

// Google sign-in leaves our site for Google, so the consent the user gave on
// /auth (18+ and Terms, plus the separate UK GDPR Art. 9 explicit consent) can't
// travel in a POST body like the phone flow's. Instead /api/auth/consent-intent
// stores it in a short-lived, HMAC-signed, httpOnly cookie, and /auth/callback
// refuses to finish a Google sign-in without a valid one.

export const CONSENT_COOKIE = 'hwyd_signin_consent'
export const CONSENT_MAX_AGE_SECS = 15 * 60

function secret(): string | null {
  const s = process.env.SESSION_PASSWORD_SECRET
  return s && s.length >= 16 ? s : null
}

function sign(payload: string, key: string): string {
  return crypto.createHmac('sha256', key).update('signin-consent:' + payload).digest('base64url')
}

// Returns the cookie value, or null if the server has no secret (fail closed).
export function makeConsentCookie(now = Date.now()): string | null {
  const key = secret()
  if (!key) return null
  const payload = `v1.${now}`
  return `${payload}.${sign(payload, key)}`
}

// True only for a cookie we signed within the last CONSENT_MAX_AGE_SECS.
export function verifyConsentCookie(value: string | undefined | null, now = Date.now()): boolean {
  const key = secret()
  if (!key || !value) return false
  const parts = value.split('.')
  if (parts.length !== 3 || parts[0] !== 'v1') return false
  const payload = `${parts[0]}.${parts[1]}`
  const expected = sign(payload, key)
  const a = Buffer.from(parts[2]), b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  const ts = Number(parts[1])
  return Number.isFinite(ts) && now - ts >= 0 && now - ts <= CONSENT_MAX_AGE_SECS * 1000
}
