import type { Metadata } from 'next'
import AuthRedirect from '@/app/components/AuthRedirect'
import { formatGBP } from '@/lib/money'
import { PLATFORM_FEE, DEFAULT_LISTENER_RATE, SESSION_DURATIONS } from '@/lib/constants'

// Home page — deliberately minimal (owner decision 2026-11-06). The full story lives on
// /about. Brand + voice: PROJECT.md §1a. Keep every claim literally true (CLAUDE.md):
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
  font-family:Nunito,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.mn *{box-sizing:border-box;margin:0;padding:0}
.mn a{text-decoration:none;color:inherit}
.mn :focus-visible{outline:3px solid var(--sun);outline-offset:3px;border-radius:12px}
.mn-wrap{max-width:1080px;margin:0 auto;padding:0 20px}

.mn-nav{display:flex;align-items:center;justify-content:space-between;height:80px;gap:12px}
.mn-nav img{height:42px;width:auto;display:block}
.mn-nav nav{display:flex;align-items:center;gap:6px}
.mn-link{font-size:15px;font-weight:800;color:var(--muted)!important;padding:10px 14px;border-radius:999px}
.mn-link:hover{color:var(--ink)!important}
.mn-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-weight:900;font-size:16px;padding:16px 30px;border:2px solid transparent;transition:background .15s,border-color .15s,transform .15s;text-align:center}
.mn-btn:hover{transform:translateY(-1px)}
.mn-btn.p{background:var(--ember);color:#fff!important;box-shadow:0 10px 26px rgba(184,85,32,.24)}
.mn-btn.p:hover{background:var(--ember-d)}
.mn-btn.g{background:#fff;color:var(--ember)!important;border-color:var(--line)}
.mn-btn.g:hover{border-color:var(--ember)}
.mn-btn.s{padding:10px 18px;font-size:14px}
@media(max-width:520px){.mn-nav img{height:34px}.mn-nav .mn-btn.s{padding:9px 14px;font-size:13.5px}.mn-link{padding:8px 8px;font-size:14px}}

.mn-hero{text-align:center;padding:64px 0 88px;background:radial-gradient(ellipse 70% 60% at 50% 0%,#FFEBDD 0%,rgba(255,246,239,.5) 50%,#fff 80%)}
.mn-pill{display:inline-block;background:#fff;border:1.5px solid var(--line);color:var(--ember);font-weight:800;font-size:14px;padding:8px 18px;border-radius:999px;margin-bottom:28px}
.mn-h1{font-size:clamp(52px,10vw,96px);font-weight:900;line-height:.98;letter-spacing:-2px;margin-bottom:26px}
.mn-h1 span{color:var(--sun);display:block}
.mn-lead{font-size:clamp(18px,2.4vw,21px);line-height:1.65;color:var(--muted);font-weight:600;max-width:620px;margin:0 auto 34px}
.mn-ctas{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:22px}
.mn-note{font-size:14px;font-weight:700;color:var(--muted)}

.mn-sec{padding:88px 0}
.mn-sec.peach{background:var(--peach)}
.mn-head{text-align:center;max-width:640px;margin:0 auto 48px}
.mn-h2{font-size:clamp(30px,4.6vw,44px);font-weight:900;line-height:1.12;letter-spacing:-.7px;margin-bottom:14px}
.mn-sub{font-size:17.5px;line-height:1.65;color:var(--muted);font-weight:600}
.mn-grid{display:grid;gap:18px}
@media(min-width:800px){.mn-grid{grid-template-columns:repeat(3,1fr)}}
.mn-card{background:#fff;border:1.5px solid var(--line);border-radius:26px;padding:32px 28px}
.mn-num{width:44px;height:44px;border-radius:50%;background:var(--sun);color:#fff;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.mn-ico{width:52px;height:52px;border-radius:16px;background:var(--apricot);display:flex;align-items:center;justify-content:center;font-size:25px;margin-bottom:20px}
.mn-card h3{font-size:21px;font-weight:900;margin-bottom:10px}
.mn-card p{font-size:16px;line-height:1.65;color:var(--muted);font-weight:600}

.mn-topics{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:820px;margin:0 auto}
.mn-topic{background:#fff;border:1.5px solid var(--line);border-radius:999px;padding:12px 22px;font-size:16px;font-weight:800;color:var(--ink);transition:border-color .15s,transform .15s}
.mn-topic:hover{border-color:var(--sun);transform:translateY(-1px)}

.mn-band{background:linear-gradient(135deg,#FFF1E6 0%,#FFE4D1 100%);border:1.5px solid var(--line);border-radius:32px;padding:56px 28px;text-align:center}
.mn-band .mn-sub{max-width:600px;margin:0 auto 28px}
.mn-final{text-align:center;padding:96px 0}
.mn-final .mn-sub{margin-bottom:30px}

.mn-disc{max-width:780px;margin:0 auto;text-align:center;font-size:14px;line-height:1.7;color:var(--muted);font-weight:600;padding:0 20px 48px}
.mn-disc a{color:#B71C1C!important;font-weight:900}

.mn-foot{border-top:1.5px solid var(--line);padding:32px 0 40px}
.mn-foot-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px}
.mn-foot-brand{display:flex;align-items:center;gap:12px;font-size:14.5px;font-weight:700;color:var(--muted)}
.mn-foot-brand img{height:34px;width:auto}
.mn-foot nav{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:14.5px;font-weight:800}
.mn-foot nav a{color:var(--muted)!important}
.mn-foot nav a:hover{color:var(--ember)!important}
.mn-copy{width:100%;font-size:13px;font-weight:600;color:#8A766B}
`

export default function Home() {
  return (
    <div className="mn">
      <AuthRedirect />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="mn-hero">
        <div className="mn-wrap">
          <div className="mn-nav">
            <a href="/" aria-label="How Was Your Day — home"><img src="/brand/logo.png" alt="How Was Your Day" width={134} height={42} /></a>
            <nav aria-label="Main">
              <a className="mn-btn g s" href="/become-a-peer-supporter">Become a Listener</a>
              <a className="mn-link" href="/auth">Sign In</a>
            </nav>
          </div>

          <div style={{ paddingTop: 40 }}>
            <p className="mn-pill">A safe, private place to talk</p>
            <h1 className="mn-h1">How was <span>your day?</span></h1>
            <p className="mn-lead">
              Whatever your day has been like, there&apos;s someone here to listen. Kind, patient people — ready to hear you,
              without judgement.
            </p>
            <div className="mn-ctas">
              <a className="mn-btn p" href="/browse">Find Someone to Listen</a>
              <a className="mn-btn g" href="/become-a-peer-supporter">Become a Listener</a>
            </div>
            <p className="mn-note">From as little as 8 minutes · Text or voice · You stay in control</p>
          </div>
        </div>
      </header>

      <main>
        <section className="mn-sec" aria-labelledby="steps">
          <div className="mn-wrap">
            <div className="mn-head">
              <h2 id="steps" className="mn-h2">Someone to listen, in three gentle steps</h2>
              <p className="mn-sub">No sign-up forms about your feelings. No intake questionnaires. Just choose someone and start talking.</p>
            </div>
            <div className="mn-grid">
              <div className="mn-card"><div className="mn-num">1</div><h3>Find your listener</h3><p>Browse kind people by topic, language, price and availability. Read their profiles and pick whoever feels right.</p></div>
              <div className="mn-card"><div className="mn-num">2</div><h3>Choose how &amp; how long</h3><p>Text chat or voice call, for {M1}, {M2} or {M3} minutes. You see the exact price before anything is charged.</p></div>
              <div className="mn-card"><div className="mn-num">3</div><h3>Feel heard</h3><p>Talk freely with someone who listens without judgement. Rate your listener afterwards and come back any time.</p></div>
            </div>
          </div>
        </section>

        <section className="mn-sec peach" aria-labelledby="ways">
          <div className="mn-wrap">
            <div className="mn-head"><h2 id="ways" className="mn-h2">Talk the way that feels right</h2></div>
            <div className="mn-grid">
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">💬</div><h3>Text Chat</h3><p>A private, real-time written conversation. Take your time, find your words.</p></div>
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">📞</div><h3>Voice Call</h3><p>A private audio call when hearing a warm voice makes all the difference.</p></div>
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">📅</div><h3>Now or later</h3><p>Talk to someone who&apos;s online right now, or book a time that suits you from a listener&apos;s weekly hours.</p></div>
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

        <section className="mn-sec peach" aria-labelledby="safe">
          <div className="mn-wrap">
            <div className="mn-head"><h2 id="safe" className="mn-h2">Feeling safe is the point</h2></div>
            <div className="mn-grid">
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">✅</div><h3>Verified listeners</h3><p>Every listener is reviewed and approved before they can take sessions — an identity selfie check, confirming they&apos;re 18 or over, and a screening quiz on listening and boundaries.</p></div>
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">🔒</div><h3>Private by design</h3><p>Sessions are between you and your listener. Voice calls are never recorded, and listeners only see the first name you choose.</p></div>
              <div className="mn-card"><div className="mn-ico" aria-hidden="true">🤝</div><h3>Listening, not therapy</h3><p>This is compassionate listening — companionship and attention, not counselling, diagnosis or treatment.</p></div>
            </div>
          </div>
        </section>

        <section className="mn-sec" aria-labelledby="listen">
          <div className="mn-wrap">
            <div className="mn-band">
              <h2 id="listen" className="mn-h2">Good at listening? Be there for someone.</h2>
              <p className="mn-sub">Choose your hours and be there for people who need someone to talk to. Apply in a few minutes — we&apos;ll review your profile and welcome you in.</p>
              <a className="mn-btn p" href="/become-a-peer-supporter">Become a Listener</a>
            </div>
          </div>
        </section>

        <section className="mn-final" aria-labelledby="ready">
          <div className="mn-wrap">
            <h2 id="ready" className="mn-h2">Everyone deserves to feel heard.</h2>
            <p className="mn-sub">Someone is here whenever you&apos;re ready.</p>
            <a className="mn-btn p" href="/browse">Find Someone to Listen</a>
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
          <div className="mn-foot-brand"><img src="/brand/logo.png" alt="How Was Your Day" width={109} height={34} /> · Everyone deserves to feel heard.</div>
          <nav aria-label="Footer">
            <a href="/about">About us</a>
            <a href="/safeguarding">Safety</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/cookies">Cookies</a>
          </nav>
          <p className="mn-copy">© {new Date().getFullYear()} How Was Your Day. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
