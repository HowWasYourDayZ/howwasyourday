import type { Metadata } from 'next'
import AuthRedirect from '@/app/components/AuthRedirect'
import { BUILD } from '@/lib/build'
import { formatGBP } from '@/lib/money'
import { PLATFORM_FEE, DEFAULT_LISTENER_RATE, SESSION_DURATIONS } from '@/lib/constants'

// Home page — the minimal overview (owner decision 2026-11-06, confirmed after a swap
// back-and-forth). The full story lives on /about. Brand + voice: PROJECT.md §1a. Keep every claim literally true (CLAUDE.md):
// text or voice only, 8/16/32 minutes, listeners screened, no earnings talk on this page.
const [M1, M2, M3] = SESSION_DURATIONS
const P1 = formatGBP(DEFAULT_LISTENER_RATE * M1 + PLATFORM_FEE)

export const metadata: Metadata = {
  title: 'How Was Your Day — Talk It Through With a Real Person | UK',
  description: `Had a day? Talk it through with a real person who listens, by text or voice. 8 minutes is enough — ${P1} at the standard rate. Screened peer listeners for adults in the UK. Not therapy.`,
  alternates: { canonical: 'https://www.howwasyourday.live' },
}

// Topic → /browse?topic= (tags in app/browse/page.tsx).
const TOPICS: [string, string][] = [
  ['Everyday life', 'general'], ['Work and career', 'career'], ['Relationships', 'relationships'],
  ['Family', 'relationships'], ['Loneliness', 'loneliness'], ['Life transitions', 'general'],
  ['Personal growth', 'selfesteem'], ['General conversation', 'general'], ['Celebrations', 'general'],
]

const CSS = `
.mn{--sun:#E8743B;--ember:#B85520;--ember-d:#9E4719;--peach:#FFF6EF;--apricot:#FBE3D2;--line:#F2DFD1;--ink:#3B2F2A;--muted:#6E5B50;
  font-family:Nunito,sans-serif;color:var(--ink);background:#FFFCF9;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.mn *{box-sizing:border-box;margin:0;padding:0}
.mn a{text-decoration:none;color:inherit}
.mn :focus-visible{outline:3px solid var(--sun);outline-offset:3px;border-radius:12px}
.mn svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex-shrink:0}
.mn-wrap{max-width:1060px;margin:0 auto;padding:0 20px}
.mn-narrow{max-width:880px}

.mn-top{border-bottom:1px solid var(--line);background:rgba(255,252,249,.9)}
.mn-nav{display:flex;align-items:center;justify-content:space-between;height:72px;gap:12px}
.mn-nav img{height:38px;width:auto;display:block}
.mn-nav nav{display:flex;align-items:center;gap:4px}
.mn-link{white-space:nowrap;font-size:14.5px;font-weight:700;color:var(--muted)!important;padding:9px 12px;border-radius:12px}
.mn-link:hover{color:var(--ink)!important;background:var(--peach)}
.mn-btn{white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:800;font-size:15.5px;padding:13px 30px;border:1.5px solid transparent;transition:background .15s,border-color .15s;text-align:center}
.mn-btn.p{background:var(--ember);color:#fff!important}
.mn-btn.p:hover{background:var(--ember-d)}
.mn-btn.g{background:transparent;color:var(--ember)!important;border-color:rgba(184,85,32,.3)}
.mn-btn.g:hover{border-color:var(--ember);background:#fff}
.mn-btn.w{background:#fff;color:var(--ember)!important}
.mn-btn.w:hover{background:var(--peach)}
.mn-btn.s{padding:9px 20px;font-size:14px}
@media(max-width:440px){.mn-hide-sm{display:none}}
@media(max-width:520px){.mn-nav img{height:32px}.mn-link{padding:8px 7px;font-size:13.5px}.mn-btn.s{padding:8px 14px;font-size:13.5px}}

.mn-hero{text-align:center;padding:88px 0 120px;background:radial-gradient(ellipse 60% 55% at 50% 30%,#FFF0E5 0%,rgba(255,252,249,0) 70%)}
.mn-pill{display:inline-flex;align-items:center;gap:7px;background:var(--peach);border:1px solid var(--line);color:var(--ember);font-weight:700;font-size:13.5px;padding:6px 14px;border-radius:999px;margin-bottom:26px}
.mn-pill svg{width:15px;height:15px}
.mn-h1{font-size:clamp(46px,7.5vw,72px);font-weight:800;line-height:1.04;letter-spacing:-1.5px;margin-bottom:24px}
.mn-h1 span{color:var(--sun);display:block}
.mn-lead{font-size:clamp(17px,2vw,19px);line-height:1.6;color:var(--muted);max-width:540px;margin:0 auto 32px}
.mn-ctas{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:22px}
.mn-note{font-size:13.5px;color:var(--muted)}

.mn-sec{padding:88px 0}
.mn-sec.alt{background:var(--peach);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.mn-head{text-align:center;max-width:560px;margin:0 auto 44px}
.mn-h2{font-size:clamp(28px,3.6vw,36px);font-weight:800;line-height:1.2;letter-spacing:-.5px;margin-bottom:12px}
.mn-sub{font-size:16px;line-height:1.6;color:var(--muted)}
.mn-grid{display:grid;gap:18px}
@media(min-width:760px){.mn-grid{grid-template-columns:repeat(3,1fr)}}
.mn-card{position:relative;background:#fff;border:1px solid var(--line);border-radius:18px;padding:28px 26px}
.mn-card.c{text-align:center}
.mn-num{position:absolute;top:20px;right:24px;font-size:30px;font-weight:300;color:#D9B8A3}
.mn-ico{width:44px;height:44px;border-radius:12px;background:var(--apricot);color:var(--ember);display:flex;align-items:center;justify-content:center;margin-bottom:18px}
.mn-card.c .mn-ico{border-radius:50%;margin:0 auto 16px}
.mn-card h3{font-size:18px;font-weight:800;margin-bottom:8px}
.mn-card p{font-size:14.5px;line-height:1.6;color:var(--muted)}

.mn-topics{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:720px;margin:0 auto}
.mn-topic{background:#fff;border:1px solid var(--line);border-radius:999px;padding:9px 18px;font-size:14.5px;font-weight:700;color:var(--ink);transition:border-color .15s,color .15s}
.mn-topic:hover{border-color:var(--sun);color:var(--ember)}

.mn-safe{display:grid;gap:28px}
@media(min-width:760px){.mn-safe{grid-template-columns:repeat(3,1fr)}}
.mn-safe div{display:flex;gap:14px;align-items:flex-start}
.mn-safe .mn-ico{width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid var(--line);margin:0}
.mn-safe h3{font-size:17px;font-weight:800;margin-bottom:6px}
.mn-safe p{font-size:14.5px;line-height:1.6;color:var(--muted)}

.mn-band{background:var(--ember);color:#fff;border-radius:26px;padding:60px 28px;text-align:center;max-width:860px;margin:0 auto}
.mn-band .mn-star{color:#FFD2B3;display:flex;justify-content:center;margin-bottom:16px}
.mn-band .mn-star svg{width:28px;height:28px}
.mn-band .mn-sub{color:#FFE9DB;max-width:560px;margin:0 auto 28px}
.mn-final{text-align:center;padding:24px 0 72px}
.mn-final .mn-sub{margin-bottom:28px}

.mn-disc{max-width:600px;margin:0 auto;text-align:center;font-size:13px;line-height:1.7;color:var(--muted);padding:0 20px 56px}
.mn-disc a{color:#B71C1C!important;font-weight:800}

.mn-foot{border-top:1px solid var(--line);padding:28px 0 32px}
.mn-foot-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px}
.mn-foot-brand{display:flex;align-items:center;gap:10px;font-size:13.5px;color:var(--muted)}
.mn-foot-brand img{height:28px;width:auto}
.mn-foot nav{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:13.5px;font-weight:600}
.mn-foot nav a{color:var(--muted)!important}
.mn-foot nav a:hover{color:var(--ember)!important}
.mn-copy{width:100%;text-align:center;font-size:12.5px;color:#8A766B;padding-top:20px}
`

// Line icons (24px grid, stroke = currentColor).
const ICONS: Record<string, string> = {
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  ear: '<path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"/>',
  phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
}
const I = ({ n }: { n: string }) => <svg viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICONS[n] }} />

export default function Home() {
  return (
    <div className="mn">
      <AuthRedirect />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div className="mn-top">
        <div className="mn-wrap mn-nav">
          <a href="/" aria-label="How Was Your Day — home"><img src="/brand/logo.png" alt="How Was Your Day" width={122} height={38} /></a>
          <nav aria-label="Main">
            <a className="mn-link" href="/about">About</a>
            <a className="mn-link mn-hide-sm" href="/become-a-peer-supporter">Become a Listener</a>
            <a className="mn-btn p s" href="/auth">Sign In</a>
          </nav>
        </div>
      </div>

      <header className="mn-hero">
        <div className="mn-wrap">
          <p className="mn-pill"><I n="shield" /> A safe, private place to talk</p>
          <h1 className="mn-h1">How was <span>your day?</span></h1>
          <p className="mn-lead">
            Whatever your day has been like, there&apos;s someone here to listen. Kind, patient people — ready to hear you,
            without judgement.
          </p>
          <div className="mn-ctas">
            <a className="mn-btn p" href="/browse">Find Someone to Listen <I n="arrow" /></a>
            <a className="mn-btn g" href="/become-a-peer-supporter">Become a Listener</a>
          </div>
          <p className="mn-note">From as little as {M1} minutes · Text or voice · You stay in control</p>
        </div>
      </header>

      <main>
        <section className="mn-sec" aria-labelledby="steps">
          <div className="mn-wrap mn-narrow">
            <div className="mn-head">
              <h2 id="steps" className="mn-h2">Someone to listen, in three gentle steps</h2>
              <p className="mn-sub">No sign-up forms about your feelings. No intake questionnaires. Just choose someone and start talking.</p>
            </div>
            <div className="mn-grid">
              <div className="mn-card"><span className="mn-num">1</span><div className="mn-ico"><I n="chat" /></div><h3>Find your listener</h3><p>Browse kind people by topic, language, price and availability. Read their profiles and pick whoever feels right.</p></div>
              <div className="mn-card"><span className="mn-num">2</span><div className="mn-ico"><I n="clock" /></div><h3>Choose how &amp; how long</h3><p>Text chat or voice call, for {M1}, {M2} or {M3} minutes. You see the exact price before anything is charged.</p></div>
              <div className="mn-card"><span className="mn-num">3</span><div className="mn-ico"><I n="ear" /></div><h3>Feel heard</h3><p>Talk freely with someone who listens without judgement. Rate your listener afterwards and come back any time.</p></div>
            </div>
          </div>
        </section>

        <section className="mn-sec alt" aria-labelledby="ways">
          <div className="mn-wrap mn-narrow">
            <div className="mn-head"><h2 id="ways" className="mn-h2">Talk the way that feels right</h2></div>
            <div className="mn-grid">
              <div className="mn-card c"><div className="mn-ico"><I n="chat" /></div><h3>Text Chat</h3><p>A private, real-time written conversation. Take your time, find your words.</p></div>
              <div className="mn-card c"><div className="mn-ico"><I n="phone" /></div><h3>Voice Call</h3><p>A private audio call when hearing a warm voice makes all the difference.</p></div>
              <div className="mn-card c"><div className="mn-ico"><I n="calendar" /></div><h3>Now or later</h3><p>Talk to someone who&apos;s online right now, or book a time that suits you.</p></div>
            </div>
          </div>
        </section>

        <section className="mn-sec" aria-labelledby="today">
          <div className="mn-wrap">
            <div className="mn-head">
              <h2 id="today" className="mn-h2">Whatever today held</h2>
              <p className="mn-sub">Some days are difficult. Some days are ordinary. Some days you simply want to share something good. Listeners welcome all of it.</p>
            </div>
            <div className="mn-topics">
              {TOPICS.map(([label, tag]) => (
                <a key={label} className="mn-topic" href={`/browse?topic=${tag}`}>{label}</a>
              ))}
            </div>
          </div>
        </section>

        <section className="mn-sec alt" aria-labelledby="safe">
          <div className="mn-wrap mn-narrow">
            <div className="mn-head"><h2 id="safe" className="mn-h2">Feeling safe is the point</h2></div>
            <div className="mn-safe">
              <div><span className="mn-ico"><I n="shield" /></span><span><h3>Verified listeners</h3><p>Every listener is reviewed and approved before they can take sessions. Identity selfie, 18+ and a screening quiz on listening and boundaries.</p></span></div>
              <div><span className="mn-ico"><I n="lock" /></span><span><h3>Private by design</h3><p>Sessions are between you and your listener. Voice calls are never recorded, and listeners only see the first name you choose.</p></span></div>
              <div><span className="mn-ico"><I n="heart" /></span><span><h3>Listening, not therapy</h3><p>This is compassionate listening — companionship and attention, not counselling, diagnosis or treatment.</p></span></div>
            </div>
          </div>
        </section>

        <section className="mn-sec" aria-labelledby="listen">
          <div className="mn-wrap">
            <div className="mn-band">
              <div className="mn-star"><I n="star" /></div>
              <h2 id="listen" className="mn-h2">Good at listening? Be there for someone.</h2>
              <p className="mn-sub">Choose your hours and be there for people who need someone to talk to. Apply in a few minutes — we&apos;ll review your profile and welcome you in.</p>
              <a className="mn-btn w" href="/become-a-peer-supporter">Become a Listener</a>
            </div>
          </div>
        </section>

        <section className="mn-final" aria-labelledby="ready">
          <div className="mn-wrap">
            <h2 id="ready" className="mn-h2">Everyone deserves to feel heard.</h2>
            <p className="mn-sub">Someone is here whenever you&apos;re ready.</p>
            <a className="mn-btn p" href="/browse">Find Someone to Listen <I n="arrow" /></a>
          </div>
        </section>

        <p className="mn-disc">
          How Was Your Day offers supportive listening, not counselling, psychotherapy, medical care or emergency intervention.
          If you&apos;re in immediate danger, call <a href="tel:999">999</a>. You can ring <a href="tel:116123">Samaritans on 116 123</a> or
          text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a>, free, any time.
        </p>
      </main>

      <footer className="mn-foot">
        <div className="mn-wrap mn-foot-in">
          <div className="mn-foot-brand"><img src="/brand/logo.png" alt="How Was Your Day" width={90} height={28} /> · Everyone deserves to feel heard.</div>
          <nav aria-label="Footer">
            <a href="/about">About us</a>
            <a href="/safeguarding">Safety</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookies</a>
          </nav>
          <p className="mn-copy">© {new Date().getFullYear()} How Was Your Day. All rights reserved.{BUILD && <> · build {BUILD}</>}</p>
        </div>
      </footer>
    </div>
  )
}
