import type { Metadata } from 'next'
import CookieSettingsButton from './CookieSettingsButton'

export const metadata: Metadata = {
  title: 'Cookie Policy — How Was Your Day',
  description: 'The cookies and similar storage How Was Your Day uses, why, and how to change your choice.',
  alternates: { canonical: 'https://www.howwasyourday.live/cookies' },
}

const S = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--cream:#FFFAF6;}
  body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--navy);-webkit-font-smoothing:antialiased;}
  a{color:var(--orange);text-decoration:none;}
  .page{max-width:720px;margin:0 auto;padding:24px 20px 80px;}
  .back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--gray);margin-bottom:28px;}
  h1{font-size:28px;font-weight:900;margin-bottom:8px;}
  .updated{font-size:13px;color:var(--gray);font-weight:500;margin-bottom:24px;}
  h2{font-size:17px;font-weight:800;margin:28px 0 10px;}
  p{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:10px;}
  .tbl{width:100%;border-collapse:collapse;font-size:13px;color:#4A3C34;margin:8px 0 14px;}
  .tbl th,.tbl td{border-bottom:1px solid var(--border);padding:8px 6px;text-align:left;vertical-align:top;}
  .tbl th{color:var(--navy);font-weight:800;}
  .wrap{overflow-x:auto;}
  .cs-btn{margin:6px 0 10px;padding:11px 18px;border-radius:50px;border:2px solid var(--navy);background:var(--navy);color:#fff;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;}
`

const essential: [string, string, string, string][] = [
  ['sb-…-auth-token', 'Cookie', 'Keeps you signed in (Supabase authentication).', 'Until you sign out; refreshed while you use the site'],
  ['hwyd_cookie_consent', 'Cookie', 'Remembers whether you accepted or rejected analytics cookies.', '6 months'],
  ['auth_redirect, auth_mode', 'Session storage', 'Returns you to the right page after signing in.', 'Until you close the tab'],
  ['howwasyourday_intent_topic, howwasyourday_last_topic', 'Session / local storage', 'Remembers the topic you picked for Talk now.', 'Until cleared'],
  ['howwasyourday_onboarded, howwasyourday_welcome_new, howwasyourday_listener_agreed', 'Local storage', 'Remembers that you have seen a welcome or agreement screen, so it is not shown again.', 'Until cleared'],
  ['lounge_last_seen_…, lounge_launch_v1_seen_…', 'Local storage', 'Remembers which listener-lounge messages you have already seen.', 'Until cleared'],
]

const analytics: [string, string, string, string][] = [
  ['_ga, _ga_<id>', 'Cookie (Google Analytics)', 'Counts visits and how pages are used, so we can improve the site. Only set if you click “Accept analytics”.', 'Up to 2 years'],
]

function Table({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="wrap"><table className="tbl">
      <thead><tr><th>Name</th><th>Type</th><th>Purpose</th><th>How long</th></tr></thead>
      <tbody>{rows.map(r => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  )
}

export default function CookiesPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <a href="/" className="back">← Back to How Was Your Day</a>
        <h1>Cookie Policy</h1>
        <p className="updated">Last updated: 25 October 2026</p>

        <p>Cookies are small files stored on your device. We also use similar browser storage (local and session storage). Under UK and EU law (PECR and the ePrivacy Directive) we can use storage that is <strong>strictly necessary</strong> to provide the service you ask for without your consent; anything else needs your permission first.</p>

        <h2>Your choice</h2>
        <p>Analytics cookies are off until you accept them. You can change your mind at any time — rejecting them later deletes the Google Analytics cookies we can reach.</p>
        <CookieSettingsButton />

        <h2>Strictly necessary</h2>
        <p>These make sign-in, sessions, payments and security work. They cannot be switched off, but you can delete them in your browser (you will be signed out).</p>
        <Table rows={essential} />

        <h2>Analytics (only with your consent)</h2>
        <p>We never send chat content, names or phone numbers to analytics. Google may process this data outside the UK/EEA under the safeguards described in our <a href="/privacy">Privacy Policy</a>.</p>
        <Table rows={analytics} />

        <h2>No advertising cookies</h2>
        <p>We do not use advertising or cross-site tracking cookies, and we do not sell your data.</p>

        <h2>Questions</h2>
        <p>See our <a href="/privacy">Privacy Policy</a> or use the <a href="/contact">contact form</a>.</p>
      </div>
    </>
  )
}
