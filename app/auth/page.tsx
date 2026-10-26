'use client'
import { useState, useRef, useEffect, useCallback, useId } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

// Phone sign-in via the MSG91 OTP Widget.
//
// India's DLT regime blocks the "Supabase generates the OTP, a carrier delivers
// it" path (needs a DLT template → needs an active GST How Was Your Day no longer has —
// see CLAUDE.md). MSG91's only no-DLT product is the OTP Widget, where MSG91
// generates AND verifies the OTP and hands the browser a short-lived token.
//
// This page drives the widget with exposeMethods:true so the UI stays ours
// (window.sendOtp / verifyOtp), then posts the token to /api/auth/phone-widget,
// which verifies it server-side with MSG91 and mints a real Supabase session.
// Supabase never sees this OTP, so the session is minted server-side — see the
// route for the full trust model.

// Supported countries — must match MSG91 "Country Wise Restriction" allowed list.
// UK-only launch (PROJECT.md §14): +44 mobiles only. Digit count is the national
// number WITHOUT the leading 0 (stripped in digits()). To open another country,
// add it here and in MSG91.
const COUNTRIES = [
  { code: 'GB', name: 'United Kingdom', dialCode: '44',  flag: '🇬🇧', minDigits: 10, maxDigits: 10 },
] as const

type Country = typeof COUNTRIES[number]
const DEFAULT_COUNTRY: Country = COUNTRIES[0]

const WIDGET_ID  = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || ''
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH || ''
// The widget's OTP length is set in the MSG91 dashboard; keep this in sync.
const OTP_LEN = Math.max(4, Math.min(8, Number(process.env.NEXT_PUBLIC_MSG91_OTP_LENGTH) || 6))
const widgetConfigured = Boolean(WIDGET_ID && TOKEN_AUTH)
// Google sign-in (PROJECT.md §8.1): on once the Google provider is set up in
// Supabase Auth (client id/secret there, redirect URL /auth/callback).
const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true'
const OAUTH_ERRORS: Record<string, string> = {
  google: 'Google sign-in did not complete. Please try again.',
  consent: 'Please tick both boxes before continuing with Google.',
  suspended: 'This account has been suspended. Please contact support.',
}

// MSG91 exposes these on window once initSendOTP() runs with exposeMethods:true.
declare global {
  interface Window {
    initSendOTP?: (config: unknown) => void
    sendOtp?: (identifier: string, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void
    verifyOtp?: (otp: string, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void
    retryOtp?: (channel: string | null, success?: (d: unknown) => void, failure?: (e: unknown) => void, identifier?: string) => void
  }
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--teal:#B85520;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--light:#FFF6EF;}
  body{font-family:Nunito,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;
    background:radial-gradient(ellipse 90% 55% at 0% 0%, #FDE6D6 0%, #FFF1E6 22%, #FFFFFF 58%) fixed;}
  a{text-decoration:none;color:inherit;}
  .page{min-height:100vh;display:flex;flex-direction:column;max-width:420px;margin:0 auto;padding:0 20px;}
  .topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 0;}
  .back{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,0.8);border:1.5px solid var(--border);cursor:pointer;font-size:18px;color:var(--navy);display:flex;align-items:center;justify-content:center;}
  .logo{height:36px;width:auto;display:block;}
  .spacer{width:40px;}
  .content{flex:1;padding:32px 0;}
  .step-icon{width:60px;height:60px;border-radius:20px;background:var(--navy);display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:24px;}
  h1{font-size:28px;font-weight:900;color:var(--navy);line-height:1.2;margin-bottom:10px;}
  .subtitle{font-size:15px;color:var(--gray);font-weight:500;line-height:1.6;margin-bottom:32px;}
  .label{font-size:13px;font-weight:800;color:var(--navy);margin-bottom:8px;display:block;}
  .phone-wrap{display:flex;align-items:center;background:white;border:2px solid var(--border);border-radius:14px;transition:border-color 0.2s;margin-bottom:8px;}
  .phone-wrap:focus-within{border-color:var(--navy);}
  .country-btn-wrap{position:relative;border-right:2px solid var(--border);flex-shrink:0;border-radius:12px 0 0 12px;overflow:visible;}
  .country-btn{display:flex;align-items:center;gap:4px;background:transparent;border:none;outline:none;padding:14px 28px 14px 14px;font-family:Nunito,sans-serif;font-weight:800;font-size:15px;color:var(--navy);cursor:pointer;white-space:nowrap;-webkit-tap-highlight-color:transparent;border-radius:12px 0 0 12px;}
  .country-btn:focus-visible{box-shadow:inset 0 0 0 2px var(--orange);}
  .country-btn .flag{font-size:18px;line-height:1;}
  .country-btn .dial{font-size:14px;font-weight:800;color:var(--gray);}
  .country-caret{position:absolute;right:8px;top:50%;transform:translateY(-50%);pointer-events:none;font-size:10px;color:var(--gray);}
  .country-panel{position:absolute;top:calc(100% + 4px);left:0;z-index:200;background:white;border:2px solid var(--border);border-radius:14px;box-shadow:0 8px 32px rgba(59,47,42,0.14);min-width:220px;max-height:280px;overflow-y:auto;padding:6px;}
  .country-panel::-webkit-scrollbar{width:4px;}
  .country-panel::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}
  .country-option{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;font-family:Nunito,sans-serif;font-size:14px;font-weight:700;color:var(--navy);white-space:nowrap;background:none;border:none;width:100%;text-align:left;}
  .country-option:hover,.country-option:focus{background:var(--light);outline:none;}
  .country-option.selected{background:var(--light);color:var(--teal);}
  .country-option .opt-flag{font-size:18px;line-height:1;}
  .country-option .opt-dial{color:var(--gray);font-weight:800;font-size:13px;min-width:38px;}
  .country-option .opt-name{flex:1;}
  .phone-prefix{padding:14px 14px 14px 16px;font-weight:800;font-size:16px;color:var(--gray);border-right:2px solid var(--border);white-space:nowrap;}
  .phone-input{flex:1;padding:14px 16px;font-family:Nunito,sans-serif;font-size:16px;font-weight:700;color:var(--navy);border:none;outline:none;background:transparent;border-radius:0 12px 12px 0;}
  .phone-input::placeholder{color:#E9CDB9;font-weight:500;}
  .text-input{width:100%;padding:14px 16px;font-family:Nunito,sans-serif;font-size:16px;font-weight:700;color:var(--navy);border:2px solid var(--border);border-radius:14px;outline:none;background:white;transition:border-color 0.2s;margin-bottom:8px;}
  .text-input:focus{border-color:var(--navy);}
  .text-input::placeholder{color:#E9CDB9;font-weight:500;}
  .otp-row{display:flex;gap:10px;justify-content:center;margin-bottom:8px;}
  .otp-box{width:48px;height:56px;border:2px solid var(--border);border-radius:14px;font-family:Nunito,sans-serif;font-size:22px;font-weight:900;color:var(--navy);text-align:center;background:white;outline:none;transition:all 0.2s;}
  .otp-box:focus{border-color:var(--orange);background:#FFFAF6;}
  .btn{width:100%;padding:16px;font-family:Nunito,sans-serif;font-size:16px;font-weight:800;color:white;background:var(--orange);border:none;border-radius:50px;cursor:pointer;transition:all 0.2s;margin-top:24px;box-shadow:0 4px 20px rgba(232,116,59,0.3);}
  .btn-google{display:flex;align-items:center;justify-content:center;gap:10px;background:#fff;color:#1F1F1F;border:1.5px solid #DADCE0;box-shadow:none;margin-top:12px;}
  .or-divider{display:flex;align-items:center;gap:12px;margin:20px 0 0;color:#6E5B50;font-size:13px;font-weight:700;}
  .or-divider::before,.or-divider::after{content:'';flex:1;height:1px;background:#F2DFD1;}
  .btn:hover{background:#D0632D;}
  .btn:disabled{opacity:0.5;cursor:not-allowed;}
  .resend-row{text-align:center;margin-top:20px;}
  .resend-btn{background:none;border:none;font-family:Nunito,sans-serif;font-size:14px;font-weight:700;color:var(--teal);cursor:pointer;}
  .resend-count{font-size:14px;color:var(--gray);font-weight:600;}
  .error{color:#E53935;font-size:13px;font-weight:700;margin-top:8px;}
  .tos{font-size:12px;color:var(--gray);font-weight:500;margin-top:12px;line-height:1.5;}
  .tos a{color:var(--teal);}
  .spin{display:inline-block;animation:spin 0.8s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .loading-screen{display:flex;align-items:center;justify-content:center;height:100vh;font-family:Nunito,sans-serif;color:#3B2F2A;font-size:16px;font-weight:600;}
  #msg91-captcha{margin-bottom:12px;}
`

// Prevent open redirect — only allow relative paths we control
function safeRedirect(raw: string | null, fallback: string): string {
  if (!raw) return fallback
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) return raw
  return fallback
}

/** MSG91 hands the verified token back in slightly different shapes; accept all.
 *  Priority order matters: 'access-token' / 'accessToken' / 'token' / 'jwt'
 *  are the real JWT fields. 'message' is a human-readable status string that
 *  MSG91 also sets (e.g. "OTP verified") — always try it LAST so we never
 *  mistake a status message for the actual token. */
function extractToken(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data
  if (typeof data === 'object') {
    const d = data as Record<string, unknown>
    for (const k of ['access-token', 'accessToken', 'token', 'jwt', 'message']) {
      if (typeof d[k] === 'string' && d[k]) return d[k] as string
    }
  }
  return null
}

const errText = (e: unknown): string | null =>
  typeof e === 'string' ? e
  : (e && typeof e === 'object' && typeof (e as { message?: unknown }).message === 'string')
      ? (e as { message: string }).message
  : null

export default function AuthPage() {
  const router = useRouter()
  const sb = createClient()
  const [step, setStep]         = useState<'phone'|'otp'|'name'>('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState<string[]>(Array(OTP_LEN).fill(''))
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError]       = useState('')
  const [countdown, setCountdown] = useState(0)
  const [widgetReady, setWidgetReady] = useState(false)
  const [reviewMode, setReviewMode] = useState(false) // Play reviewer demo number — no SMS
  // 18+ only (Terms). Sent to the server, which refuses sign-in without it. A ref
  // because handleToken is a stable callback that would otherwise see a stale value.
  const [adultConfirmed, setAdultConfirmed] = useState(false)
  // Separate, explicit consent for sensitive (health-related) information —
  // UK/EU GDPR Art. 9(2)(a). Must not be bundled into the Terms checkbox.
  const [sensitiveConsent, setSensitiveConsent] = useState(false)
  const consentRef = useRef(false)
  useEffect(() => { consentRef.current = sensitiveConsent }, [sensitiveConsent])
  const adultRef = useRef(false)
  useEffect(() => { adultRef.current = adultConfirmed }, [adultConfirmed])
  const otpRefs = useRef<(HTMLInputElement|null)[]>([])
  const handledRef = useRef(false)      // guards the final navigation
  const tokenHandledRef = useRef(false) // guards double token delivery (verifyOtp cb + config.success)

  const [isListenerMode, setIsListenerMode] = useState(false)
  // Came from Talk now: the seeker already chose a topic — say this is the last step.
  const [fromTalk, setFromTalk] = useState(false)
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownId = useId()

  // Strip non-digits; no length cap here — validation uses country.minDigits/maxDigits
  // One leading 0 is the national trunk prefix (UK 07…, AU 04…, MY 01…), never
  // part of the international number MSG91 needs.
  const digits = () => phone.replace(/\D/g, '').replace(/^0/, '')
  const isValidPhone = () => {
    const d = digits()
    return d.length >= country.minDigits && d.length <= country.maxDigits
  }

  function getDestination(): string {
    const stored = sessionStorage.getItem('auth_redirect')
    const mode = sessionStorage.getItem('auth_mode')
    // Default fallback — if the user came from a topic page (/browse?topic=X),
    // that topic was stored in sessionStorage.howwasyourday_last_topic by browse/page.tsx.
    // Restoring it here means new users land back on the right filtered view
    // even when the explicit auth_redirect param wasn't set (e.g. clicking a nav
    // "Open app" button rather than a listener card).
    let fallback = mode === 'listener' ? '/dashboard' : '/browse'
    if (mode !== 'listener') {
      try {
        const lastTopic = sessionStorage.getItem('howwasyourday_last_topic')
        if (lastTopic) {
          fallback = `/browse?topic=${encodeURIComponent(lastTopic)}`
          // Also keep a copy for the WelcomeBanner modal — browse/page.tsx clears
          // howwasyourday_last_topic on mount, but the modal reads howwasyourday_intent_topic
          // so it can personalise the CTA label even after the key is gone.
          sessionStorage.setItem('howwasyourday_intent_topic', lastTopic)
        }
      } catch { /* sessionStorage unavailable */ }
    }
    return safeRedirect(stored, fallback)
  }

  // Exchange the widget token for a Supabase session, then route the user.
  const handleToken = useCallback(async (raw: unknown) => {
    const token = extractToken(raw)
    if (!token || tokenHandledRef.current) return
    tokenHandledRef.current = true
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/phone-widget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // country is stored as users.account_country (informational; pricing is
        // the same everywhere). sensitiveDataConsent records the separate explicit
        // consent (UK/EU GDPR Art. 9) ticked on the phone step.
        body: JSON.stringify({ token, country: country.code, ageConfirmed: adultRef.current, sensitiveDataConsent: consentRef.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Could not sign you in. Please try again.')
        tokenHandledRef.current = false
        setLoading(false)
        return
      }
      await afterSignIn()
    } catch {
      setError('Network error. Please check your connection and try again.')
      tokenHandledRef.current = false
      setLoading(false)
    }
  }, [])

  // Google sign-in: record the consent server-side (signed cookie checked by
  // /auth/callback), then hand over to Supabase's Google OAuth (PKCE). The
  // destination stays in sessionStorage across the round trip.
  async function signInWithGoogle() {
    if (!adultConfirmed) { setError('Please confirm you are 18 or older to continue.'); return }
    if (!sensitiveConsent) { setError('Please give your consent to continue.'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/consent-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageConfirmed: true, sensitiveDataConsent: true }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d?.error || 'Could not start Google sign-in. Please try again.')
        setLoading(false)
        return
      }
      const { error: oauthErr } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (oauthErr) { setError('Could not start Google sign-in. Please try again.'); setLoading(false) }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  // Session cookies are now set by the server route. Decide new-vs-returning
  // by asking the server for a profile name (admin read, bypasses RLS).
  async function afterSignIn() {
    let existingName: string | null = null
    try {
      const p = await fetch('/api/auth/profile')
      if (p.ok) existingName = (await p.json())?.name ?? null
    } catch { /* treat as new */ }

    if (!existingName) { setStep('name'); setLoading(false); return }

    const dest = getDestination()
    sessionStorage.removeItem('auth_redirect')
    sessionStorage.removeItem('auth_mode')
    handledRef.current = true
    window.location.assign(dest)
  }

  // Google Play reviewer login (lib/review-login.ts): the demo number gets a
  // fixed code instead of an SMS. Returns true if this number is the demo one.
  async function isReviewNumber(phone: string): Promise<boolean> {
    try {
      const res = await fetch('/api/auth/review-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) return false
      return (await res.json())?.review === true
    } catch { return false }
  }

  // Keep the widget's config callback pointing at the latest handleToken.
  const handleTokenRef = useRef(handleToken)
  useEffect(() => { handleTokenRef.current = handleToken }, [handleToken])

  // Read redirect/mode + resume any existing session.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    const mode = params.get('mode')
    if (redirect) sessionStorage.setItem('auth_redirect', redirect)
    if (mode) sessionStorage.setItem('auth_mode', mode)
    if (mode === 'listener') setIsListenerMode(true)
    if (redirect?.startsWith('/talk')) setFromTalk(true)
    const oauthError = params.get('error')
    if (oauthError && OAUTH_ERRORS[oauthError]) setError(OAUTH_ERRORS[oauthError])
    const fromGoogle = params.get('oauth') === '1'

    sb.auth.getUser().then(({ data: { user } }) => {
      if (user && fromGoogle && !handledRef.current) {
        // Back from Google (/auth/callback): same new-vs-returning step as phone.
        setLoading(true)
        setChecking(false)
        afterSignIn()
        return
      }
      if (user && !handledRef.current) {
        handledRef.current = true
        const dest = safeRedirect(sessionStorage.getItem('auth_redirect'), mode === 'listener' ? '/dashboard' : '/browse')
        sessionStorage.removeItem('auth_redirect')
        router.replace(dest)
        return
      }
      setChecking(false)
    }).catch(() => setChecking(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Load MSG91's widget script once and initialise it.
  useEffect(() => {
    if (!widgetConfigured || typeof window === 'undefined') return
    if (window.initSendOTP) { setWidgetReady(true); return }

    const configuration = {
      widgetId: WIDGET_ID,
      tokenAuth: TOKEN_AUTH,
      exposeMethods: true, // drive the UI ourselves; also hides MSG91's popup
      captchaRenderId: 'msg91-captcha',
      success: (d: unknown) => { handleTokenRef.current(d) }, // token can arrive here…
      failure: (e: unknown) => { setError(errText(e) || 'Verification failed. Please try again.') },
    }

    const urls = ['https://verify.msg91.com/otp-provider.js', 'https://verify.phone91.com/otp-provider.js']
    let i = 0
    let cancelled = false
    const attempt = () => {
      if (cancelled) return
      const s = document.createElement('script')
      s.src = urls[i]
      s.async = true
      s.onload = () => {
        if (typeof window.initSendOTP === 'function') {
          window.initSendOTP(configuration)
          setWidgetReady(true)
        }
      }
      s.onerror = () => { i++; if (i < urls.length) attempt() }
      document.head.appendChild(s)
    }
    attempt()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c-1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Close country dropdown on outside click or Escape
  useEffect(() => {
    if (!dropdownOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false) }
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClick) }
  }, [dropdownOpen])

  async function requestOtp() {
    setError('')
    if (!adultConfirmed) { setError('Please confirm you are 18 or older to continue.'); return }
    if (!sensitiveConsent) { setError('Please give your consent to continue.'); return }
    if (!isValidPhone()) {
      const len = country.minDigits === country.maxDigits
        ? `${country.minDigits}-digit`
        : `${country.minDigits}–${country.maxDigits}-digit`
      setError(`Enter a valid ${len} mobile number for ${country.name}`)
      return
    }
    setLoading(true)
    const review = await isReviewNumber(country.dialCode + digits())
    setReviewMode(review)
    if (review) { setLoading(false); setOtp(Array(OTP_LEN).fill('')); setStep('otp'); return }
    setLoading(false)
    if (!widgetReady || typeof window.sendOtp !== 'function') {
      setError('Verification is still loading — give it a second and try again.')
      return
    }
    tokenHandledRef.current = false
    setLoading(true)
    // MSG91 expects the number WITHOUT '+': dialCode + local digits (no leading 0)
    window.sendOtp(
      country.dialCode + digits(),
      () => { setLoading(false); setOtp(Array(OTP_LEN).fill('')); setStep('otp'); setCountdown(30) },
      (err) => { setLoading(false); setError(errText(err) || 'Could not send the code. Please try again.') },
    )
  }

  function verify() {
    setError('')
    const code = otp.join('')
    if (code.length < OTP_LEN) { setError(`Enter the full ${OTP_LEN}-digit code`); return }
    if (reviewMode) { verifyReview(code); return }
    if (typeof window.verifyOtp !== 'function') { setError('Verification not ready. Please try again.'); return }
    setLoading(true)
    window.verifyOtp(
      code,
      (d: unknown) => { handleToken(d) }, // …or here. handleToken de-dupes.
      (err: unknown) => { setLoading(false); setError(errText(err) || 'Incorrect code. Please check and try again.') },
    )
  }

  async function verifyReview(code: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/review-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: country.dialCode + digits(), code, country: country.code, ageConfirmed: adultRef.current, sensitiveDataConsent: consentRef.current }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Incorrect code. Please check and try again.'); setLoading(false); return }
      await afterSignIn()
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  function resend() {
    setError('')
    if (reviewMode) return
    // Re-send via sendOtp (robust) rather than guessing retryOtp's channel code.
    if (typeof window.sendOtp === 'function') {
      window.sendOtp(country.dialCode + digits(), () => setCountdown(30), (err) => setError(errText(err) || 'Could not resend. Please try again.'))
    }
  }

  async function saveName() {
    setError('')
    if (name.trim().length < 2) { setError('Enter at least a first name'); return }
    setLoading(true)
    const { data: { user } } = await sb.auth.getUser()
    if (!user) { setError('Session expired. Please try again.'); setLoading(false); return }

    let saveErrMsg: string | null = null
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) saveErrMsg = (await res.json().catch(() => ({}))).error || 'Could not save your profile. Please try again.'
    } catch { saveErrMsg = 'Network error. Please check your connection and try again.' }
    setLoading(false)
    if (saveErrMsg) { setError(saveErrMsg); return }

    const storedRedirect = sessionStorage.getItem('auth_redirect')
    const mode = sessionStorage.getItem('auth_mode')
    let listenerDest = '/become-listener'
    if (mode === 'listener' && !storedRedirect) {
      try {
        const { data: { user: u } } = await sb.auth.getUser()
        if (u) {
          const appRes = await sb.from('listener_applications').select('id', { count: 'exact', head: true }).eq('user_id', u.id)
          if ((appRes.count ?? 0) > 0) listenerDest = '/dashboard'
        }
      } catch { /* default to /become-listener */ }
    }
    // A brand-new seeker with nowhere specific to go starts at Talk now — the
    // match-first entry — rather than the full listener list.
    const dest = storedRedirect ? getDestination() : mode === 'listener' ? listenerDest : '/talk?src=signup'
    sessionStorage.removeItem('auth_redirect')
    sessionStorage.removeItem('auth_mode')
    sessionStorage.setItem('howwasyourday_welcome_new', '1')
    handledRef.current = true
    window.location.assign(dest)
  }

  function handleOtpChange(i: number, val: string) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next)
    if (val && i < OTP_LEN - 1) otpRefs.current[i+1]?.focus()
    if (next.every(d => d) && next.length === OTP_LEN) {
      setTimeout(() => { if (!loading) document.getElementById('verify-btn')?.click() }, 100)
    }
  }
  function handleOtpKey(i: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i-1]?.focus()
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    const ds = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
    if (ds.length < OTP_LEN) return
    e.preventDefault()
    setOtp(ds.split(''))
    setTimeout(() => { if (!loading) document.getElementById('verify-btn')?.click() }, 100)
  }

  if (checking) {
    return (<><style dangerouslySetInnerHTML={{ __html: S }} /><div className="loading-screen">Checking your session…</div></>)
  }

  if (!widgetConfigured && !googleEnabled) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: S }} />
        <div className="page">
          <div className="topbar"><a href="/" className="back">←</a><img className="logo" src="/brand/logo.png" alt="How Was Your Day" /><div className="spacer" /></div>
          <div className="content">
            <div className="step-icon">🔧</div>
            <h1>Sign-in is being set up</h1>
            <p className="subtitle">Sign-in isn&apos;t configured yet. Please check back shortly.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <div className="topbar">
          {step === 'otp'
            ? <button className="back" onClick={() => { setOtp(Array(OTP_LEN).fill('')); setStep('phone'); setError('') }}>←</button>
            : step === 'phone'
              ? <a href="/" className="back">←</a>
              : <div className="spacer" />}
          <img className="logo" src="/brand/logo.png" alt="How Was Your Day" />
          <div className="spacer" />
        </div>

        <div className="content">
          {step === 'phone' && (
            <>
              <div className="step-icon">{isListenerMode ? '🎧' : '📱'}</div>
              <h1>{isListenerMode ? 'Listener sign in' : fromTalk ? 'One last step' : "What's your mobile number?"}</h1>
              <p className="subtitle">
                {isListenerMode
                  ? 'Sign in to your listener dashboard. Same number you registered with.'
                  : fromTalk
                    ? "Confirm your mobile number with a one-time code, and we'll connect you with a listener straight away. Your number is never shown to them."
                    : "We'll send a one-time code to verify. No spam, ever."}
              </p>
              {widgetConfigured && (<>
              <label className="label">Mobile number</label>
              <div className="phone-wrap">
                {/* Custom country code dropdown — emoji flags render properly in a div-based list */}
                <div className="country-btn-wrap" ref={dropdownRef}>
                  <button
                    type="button"
                    className="country-btn"
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    aria-controls={dropdownId}
                    aria-label={`Country: ${country.name} +${country.dialCode}`}
                    onClick={() => setDropdownOpen(o => !o)}
                  >
                    <span className="flag">{country.flag}</span>
                    <span className="dial">+{country.dialCode}</span>
                  </button>
                  <span className="country-caret" aria-hidden="true">▾</span>
                  {dropdownOpen && (
                    <div id={dropdownId} className="country-panel" role="listbox" aria-label="Select country">
                      {COUNTRIES.map(c => (
                        <button
                          key={c.code}
                          type="button"
                          role="option"
                          aria-selected={c.code === country.code}
                          className={`country-option${c.code === country.code ? ' selected' : ''}`}
                          onClick={() => {
                            setCountry(c)
                            setPhone('')  // clear number when country changes — avoid length mismatches
                            setError('')
                            setDropdownOpen(false)
                          }}
                        >
                          <span className="opt-flag">{c.flag}</span>
                          <span className="opt-dial">+{c.dialCode}</span>
                          <span className="opt-name">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  className="phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={country.maxDigits + 4} // room for a leading 0 and spaces; digits() + isValidPhone() enforce the real length
                  placeholder={country.code === 'GB' ? '07700 900123' : '…'}
                  autoFocus
                  aria-label="Mobile number"
                  value={digits()}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && requestOtp()}
                />
              </div>
              {/* MSG91's invisible-captcha renders here when required. */}
              <div id="msg91-captcha" />
              </>)}
              {error && <p className="error">{error}</p>}
              <label className="tos" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left' }}>
                <input type="checkbox" checked={adultConfirmed} onChange={e => setAdultConfirmed(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: '#B85520' }} />
                <span>I am 18 or older. How Was Your Day is for adults only. I agree to the <a href="/terms">Terms</a> and have read the <a href="/privacy">Privacy Policy</a>.</span>
              </label>
              <label className="tos" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', textAlign: 'left' }}>
                <input type="checkbox" checked={sensitiveConsent} onChange={e => setSensitiveConsent(e.target.checked)} style={{ width: 18, height: 18, marginTop: 1, flexShrink: 0, accentColor: '#B85520' }} />
                <span>I explicitly consent to How Was Your Day processing what I share about my wellbeing and mental health in conversations, so the service can work and keep people safe. I can withdraw this consent at any time by deleting my account (<a href="/privacy#sensitive">how we use it</a>).</span>
              </label>
              {widgetConfigured && (
                <button className="btn" onClick={requestOtp} disabled={loading || !isValidPhone() || !adultConfirmed || !sensitiveConsent}>
                  {loading ? <span className="spin">⟳</span> : !widgetReady ? 'Loading…' : 'Send OTP →'}
                </button>
              )}
              {googleEnabled && (
                <>
                  {widgetConfigured && <div className="or-divider" aria-hidden="true"><span>or</span></div>}
                  <button type="button" className="btn btn-google" onClick={signInWithGoogle} disabled={loading || !adultConfirmed || !sensitiveConsent}>
                    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                    Continue with Google
                  </button>
                  <p className="fine-print" style={{ fontSize: 12, color: '#6E5B50', textAlign: 'center', marginTop: 8 }}>
                    We only use your Google email to recover your account and send booking emails. Listeners see only the first name you choose.
                    {widgetConfigured && ' Signing in with Google and with your phone creates two separate accounts.'}
                  </p>
                </>
              )}
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="step-icon">🔐</div>
              <h1>Enter the code</h1>
              <p className="subtitle">Sent to +{country.dialCode} {digits()}</p>
              <div className="otp-row" onPaste={handleOtpPaste}>
                {otp.map((d,i) => (
                  <input key={i} ref={el => { otpRefs.current[i] = el }} className="otp-box"
                    type="text" inputMode="numeric" maxLength={1} value={d} autoFocus={i===0}
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    aria-label={`Code digit ${i + 1}`}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKey(i, e)} />
                ))}
              </div>
              {error && <p className="error" style={{textAlign:'center'}}>{error}</p>}
              <button id="verify-btn" className="btn" onClick={verify} disabled={loading || otp.join('').length < OTP_LEN}>
                {loading ? <span className="spin">⟳</span> : 'Verify & continue →'}
              </button>
              <div className="resend-row">
                {countdown > 0
                  ? <span className="resend-count">Resend in {countdown}s</span>
                  : <button className="resend-btn" onClick={resend}>Resend OTP</button>}
              </div>
            </>
          )}

          {step === 'name' && (
            <>
              <div className="step-icon">👋</div>
              <h1>What should we call you?</h1>
              <p className="subtitle">{isListenerMode ? 'Just a first name. This is what seekers will see on your profile.' : 'Just a first name. This is what listeners will see.'}</p>
              <label className="label">Your first name</label>
              <input className="text-input" type="text" placeholder="e.g. Priya" autoFocus
                aria-label="Your first name"
                value={name} onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()} />
              {error && <p className="error">{error}</p>}
              <button className="btn" onClick={saveName} disabled={loading || name.trim().length < 2}>
                {loading ? <span className="spin">⟳</span> : "Let's go →"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
