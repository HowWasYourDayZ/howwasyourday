'use client'
import { usePathname } from 'next/navigation'
import { openCookieSettings } from './CookieConsent'

// Pages with their own footer (home) or full-screen flows get none.
function hideOn(pathname: string): boolean {
  if (['/talk', '/auth', '/contact'].includes(pathname)) return true
  if (pathname.startsWith('/session/') || pathname.startsWith('/messages/')) return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  if (pathname.startsWith('/history/') && pathname !== '/history') return true
  return false
}
// Signed-in app screens get only the crisis line.
const APP_SCREENS = ['/browse', '/dashboard', '/wallet', '/history', '/profile', '/notifications', '/sessions']
const isAppScreen = (p: string) => APP_SCREENS.some(s => p === s || p.startsWith(s + '/'))

const CSS = `.site-footer{font-family:Nunito,sans-serif;background:#FFF6EF;border-top:1.5px solid #F2DFD1;color:#6E5B50;padding:28px 20px calc(84px + env(safe-area-inset-bottom,0px));}
.site-footer-inner{max-width:720px;margin:0 auto;text-align:center}
.sf-help{font-size:16px;font-weight:900;color:#3B2F2A;margin:0 0 6px}
.sf-sub{font-size:13.5px;font-weight:600;color:#6E5B50;line-height:1.6;margin:0 0 14px}
.sf-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:18px}
.sf-btn{display:inline-flex;align-items:center;gap:6px;font-size:13.5px;font-weight:800;text-decoration:none;padding:10px 20px;border-radius:50px}
.sf-btn-primary{background:#B85520;color:#fff}.sf-btn-ghost{background:#fff;color:#B85520;border:1.5px solid #B85520}
.sf-crisis{font-size:12.5px;font-weight:600;color:#6E5B50;line-height:1.6;background:#fff;border:1.5px solid #F2DFD1;border-radius:12px;padding:10px 14px;margin:0 0 16px}
.sf-crisis strong{color:#3B2F2A}.sf-crisis a{color:#B71C1C;font-weight:800;text-decoration:none}
.sf-links{display:flex;flex-wrap:wrap;gap:6px 16px;justify-content:center;margin-bottom:12px}
.sf-links a{font-size:13px;font-weight:700;color:#B85520;text-decoration:none}
.sf-links.sf-small a{font-size:12px;color:#6E5B50}
.sf-copy{font-size:11.5px;font-weight:600;color:#8A766B;margin:8px 0 0}
@media(max-width:380px){.sf-actions{flex-direction:column}.sf-btn{justify-content:center}}`

function Crisis({ style }: { style?: React.CSSProperties }) {
  return (
    <p className="sf-crisis" style={style}>
      🆘 <strong>In crisis or at risk?</strong> Call <a href="tel:999">999</a>, ring{' '}
      <a href="tel:116123">Samaritans on 116 123</a> or text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> (free, 24/7).
      How Was Your Day is peer support, not emergency or clinical care.
    </p>
  )
}

export default function SiteFooter() {
  const pathname = usePathname()
  if (hideOn(pathname)) return null
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {isAppScreen(pathname) ? (
        <footer className="site-footer" role="contentinfo" style={{ paddingTop: 16 }}>
          <div className="site-footer-inner"><Crisis style={{ marginBottom: 0 }} /></div>
        </footer>
      ) : (
        <footer className="site-footer" role="contentinfo">
          <div className="site-footer-inner">
            {pathname !== '/' && (<>
              <p className="sf-help">How was your day?</p>
              <p className="sf-sub">Talk it through with a real person who listens — by text or voice. 8 minutes is enough.</p>
              <div className="sf-actions">
                <a className="sf-btn sf-btn-primary" href="/talk?src=footer">Talk to someone now</a>
                <a className="sf-btn sf-btn-ghost" href="/browse">Browse listeners</a>
              </div>
            </>)}
            <Crisis />
            <nav className="sf-links" aria-label="About How Was Your Day">
              <a href="/how-it-works">How it works</a><a href="/pricing">Pricing</a><a href="/faq">FAQ</a>
              <a href="/about">About</a><a href="/trust">Trust &amp; safety</a><a href="/safeguarding">Safeguarding</a>
              <a href="/become-a-peer-supporter">Become a peer supporter</a><a href="/contact">Contact</a>
            </nav>
            <nav className="sf-links sf-small" aria-label="Guides">
              <a href="/peer-support">What is peer support?</a><a href="/peer-support-vs-therapy">Peer support vs therapy</a>
              <a href="/talk-to-a-real-person-online">Talk to a real person online</a><a href="/someone-to-talk-to-when-lonely">Someone to talk to when lonely</a>
              <a href="/talk-to-human-instead-of-chatgpt">A human, not AI</a><a href="/daily-check-in">Daily check-in</a>
            </nav>
            <nav className="sf-links sf-small" aria-label="Legal">
              <a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cookies">Cookies</a>
              <a href="/cookies" onClick={e => { e.preventDefault(); openCookieSettings() }}>Cookie settings</a>
            </nav>
            <p className="sf-copy">© {new Date().getFullYear()} How Was Your Day · howwasyourday.live · Peer support for adults in the UK</p>
          </div>
        </footer>
      )}
    </>
  )
}
