import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import { CONSENT_COOKIE, CONSENT_MAX_AGE_SECS, makeConsentCookie } from '@/lib/signin-consent'

// POST /api/auth/consent-intent — called by /auth right before "Continue with
// Google". Records (in a signed cookie) that the user confirmed 18+ / Terms and
// gave the separate explicit consent; /auth/callback checks it. See
// lib/signin-consent.ts.
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(`consent-intent:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
  }
  const body = await req.json().catch(() => ({}))
  if (body?.ageConfirmed !== true) {
    return NextResponse.json({ error: 'Please confirm you are 18 or older to continue.', code: 'age_not_confirmed' }, { status: 400 })
  }
  if (body?.sensitiveDataConsent !== true) {
    return NextResponse.json({ error: 'Please give your consent to continue.', code: 'consent_not_given' }, { status: 400 })
  }
  const value = makeConsentCookie()
  if (!value) {
    logger.error('consent-intent: SESSION_PASSWORD_SECRET missing — Google sign-in disabled')
    return NextResponse.json({ error: 'Sign-in is temporarily unavailable. Please use your phone number.' }, { status: 503 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set(CONSENT_COOKIE, value, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: CONSENT_MAX_AGE_SECS,
  })
  return res
}
