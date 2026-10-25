import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { ensureUserRow } from '@/lib/ensure-user-row'
import { recordSensitiveDataConsent } from '@/lib/consent-record'
import { suspensionStatus } from '@/lib/suspension'
import { CONSENT_COOKIE, verifyConsentCookie } from '@/lib/signin-consent'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// GET /auth/callback — where Google sign-in returns (Supabase OAuth, PKCE).
// 1. Exchange the code for a real Supabase session (cookies set here).
// 2. Refuse unless /auth recorded the 18+ / Terms / Art. 9 consent first
//    (signed cookie, lib/signin-consent.ts) — same rule as the phone flow.
// 3. Refuse suspended accounts.
// 4. Make sure public.users exists. We store the Google EMAIL (account recovery,
//    booking emails) but NOT the Google name or photo: people choose the first
//    name listeners see on /auth (PROJECT.md §8.1, §10.9).
// 5. Back to /auth?oauth=1, which runs the same "new vs returning" step as phone.
export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const back = (q: string) => NextResponse.redirect(new URL(`/auth?${q}`, url.origin))
  const code = url.searchParams.get('code')
  if (url.searchParams.get('error') || !code) return back('error=google')

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  const user = data?.user
  if (error || !user) {
    logger.warn('google callback: code exchange failed', { error: error?.message })
    return back('error=google')
  }

  const jar = cookies()
  const consentOk = verifyConsentCookie(jar.get(CONSENT_COOKIE)?.value)
  try { jar.set({ name: CONSENT_COOKIE, value: '', path: '/', maxAge: 0 }) } catch { /* ignore */ }
  if (!consentOk) {
    await supabase.auth.signOut()
    return back('error=consent')
  }

  const admin = createAdminClient()
  if ((await suspensionStatus(admin, user.id)) === 'suspended') {
    await supabase.auth.signOut()
    return back('error=suspended')
  }

  const { error: rowErr } = await ensureUserRow(admin, { id: user.id, accountCountry: 'GB' })
  if (rowErr) {
    // The session is valid — don't fail the sign-in over the mirror row.
    logger.error('google callback: session minted but users row did not', { userId: user.id })
  } else {
    if (user.email) {
      await admin.from('users').update({ email: user.email }).eq('id', user.id).is('email', null)
        .then(() => {}, e => logger.warn('google callback: email write failed', { error: String(e) }))
    }
    await recordSensitiveDataConsent(admin, user.id)
  }

  logger.info('google callback: signed in', { userId: user.id })
  return back('oauth=1')
}
