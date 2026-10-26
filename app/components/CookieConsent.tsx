'use client'
import { useEffect, useState } from 'react'

// Cookie consent (UK PECR / EU ePrivacy + GDPR). Only strictly necessary
// storage (sign-in, security, this choice) is used without asking. Google
// Analytics is NOT loaded until the visitor clicks "Accept analytics", and
// "Reject" is offered with equal prominence. The choice is kept in a
// first-party cookie for 6 months and can be changed any time from the footer
// ("Cookie settings" → openCookieSettings()). See /cookies.

const KEY = 'hwyd_cookie_consent' // 'granted' | 'denied'
const MAX_AGE_SECS = 182 * 24 * 60 * 60
const OPEN_EVENT = 'hwyd:cookie-settings'

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; __hwydGa?: boolean }

function readChoice(): 'granted' | 'denied' | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${KEY}=(granted|denied)`))
  return (m?.[1] as 'granted' | 'denied' | undefined) ?? null
}

function writeChoice(v: 'granted' | 'denied') {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${KEY}=${v}; Max-Age=${MAX_AGE_SECS}; Path=/; SameSite=Lax${secure}`
}

function loadAnalytics(gaId: string) {
  const w = window as W
  if (w.__hwydGa) return
  w.__hwydGa = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
  document.head.appendChild(s)
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag() { w.dataLayer!.push(arguments) } // eslint-disable-line prefer-rest-params
  w.gtag('js', new Date())
  w.gtag('config', gaId, { page_path: location.pathname })
}

// Remove Google Analytics cookies (_ga, _ga_<id>) for this host and its parent domain.
function clearAnalyticsCookies() {
  const host = location.hostname
  const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')]
  for (const c of document.cookie.split('; ')) {
    const name = c.split('=')[0]
    if (!/^_ga(_|$)/.test(name)) continue
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ''}`
    }
  }
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export default function CookieConsent({ gaId }: { gaId?: string }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let choice: 'granted' | 'denied' | null = null
    try { choice = readChoice() } catch { /* cookies blocked — treat as no choice */ }
    if (choice === 'granted' && gaId) loadAnalytics(gaId)
    else if (choice === null && gaId) setOpen(true)
    const show = () => setOpen(true)
    window.addEventListener(OPEN_EVENT, show)
    return () => window.removeEventListener(OPEN_EVENT, show)
  }, [gaId])

  function decide(v: 'granted' | 'denied') {
    const had = (() => { try { return readChoice() } catch { return null } })()
    try { writeChoice(v) } catch { /* ignore */ }
    setOpen(false)
    if (v === 'granted' && gaId) loadAnalytics(gaId)
    if (v === 'denied') {
      clearAnalyticsCookies()
      // gtag can't be unloaded from a running page — reload so it is gone.
      if (had === 'granted') location.reload()
    }
  }

  if (!open) return null
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="cc-title" aria-describedby="cc-desc"
      style={{ position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 10000, maxWidth: 560, margin: '0 auto', background: '#fff', color: '#3B2F2A', border: '1.5px solid #F2DFD1', borderRadius: 18, boxShadow: '0 10px 40px rgba(59,47,42,.18)', padding: '16px 18px', fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <p id="cc-title" style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 15 }}>Cookies on How Was Your Day</p>
      <p id="cc-desc" style={{ margin: '0 0 12px', fontSize: 13.5, lineHeight: 1.55, color: '#4A3C34', fontWeight: 600 }}>
        We use essential cookies to keep you signed in and the site secure. With your permission we&apos;d also like to use
        Google Analytics cookies to understand how the site is used. We never send what you write, your name or your phone number
        to analytics. <a href="/cookies" style={{ color: '#B85520', fontWeight: 800 }}>Cookie details</a>
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" onClick={() => decide('denied')}
          style={{ flex: '1 1 140px', padding: '11px 14px', borderRadius: 50, border: '2px solid #3B2F2A', background: '#fff', color: '#3B2F2A', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Reject analytics
        </button>
        <button type="button" onClick={() => decide('granted')}
          style={{ flex: '1 1 140px', padding: '11px 14px', borderRadius: 50, border: '2px solid #3B2F2A', background: '#3B2F2A', color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Accept analytics
        </button>
      </div>
    </div>
  )
}
