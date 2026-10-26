import type { Metadata } from 'next'
import AuthRedirect from '@/app/components/AuthRedirect'
import HomeStickyCta from '@/app/components/HomeStickyCta'
import { formatGBP } from '@/lib/money'
import {
  PLATFORM_FEE, DEFAULT_LISTENER_RATE, SESSION_DURATIONS, VOICE_PRICING_ENABLED, VOICE_RATE_PREMIUM,
} from '@/lib/constants'
import type { TalkTopicId } from '@/lib/talk-match'

// Home page. Brand + voice: PROJECT.md §1a (orange and white, "8 minutes is enough").
// Prices are the RULE at the standard rate (CLAUDE.md): listener rate × minutes + £1.
//
// UX: the brand name is a question, so the main call to action is ANSWERING it — each
// answer opens Talk now with that topic chosen (/talk?topic=…). Talk now still shows the
// exact price before any listener is asked. Secondary path: browse listeners / book a time.
const price = (mins: number) => formatGBP(DEFAULT_LISTENER_RATE * mins + PLATFORM_FEE)
const [M1, M2, M3] = SESSION_DURATIONS
const P1 = price(M1)
const FEE = formatGBP(PLATFORM_FEE)
const talk = (q: string) => `/talk?${q}`

// How the day went → Talk now topic (lib/talk-match.ts TALK_TOPICS).
const ANSWERS: { label: string; emoji: string; topic: TalkTopicId }[] = [
  { label: 'Stressful', emoji: '💼', topic: 'work' },
  { label: 'Lonely', emoji: '🌙', topic: 'lonely' },
  { label: 'Overthinking it', emoji: '🌀', topic: 'anxious' },
  { label: 'Relationship stuff', emoji: '💔', topic: 'relationship' },
  { label: 'Family stuff', emoji: '🏠', topic: 'family' },
]

export const metadata: Metadata = {
  title: 'How Was Your Day — Talk It Through With a Real Person | UK',
  description: `Had a day? Talk it through with a real person who listens, by text or voice. 8 minutes is enough — ${P1} at the standard rate. Screened peer listeners for adults in the UK. Not therapy.`,
  alternates: { canonical: 'https://www.howwasyourday.live' },
}

const FAQ: { q: string; a: string }[] = [
  { q: 'What is How Was Your Day?', a: 'A UK peer support service. You talk one to one, by text or voice, with a real person who has been screened to listen well. It is not therapy, counselling or a chatbot — it is a human conversation about whatever is on your mind.' },
  { q: 'Is 8 minutes really enough?', a: `Often, yes. Eight minutes is long enough to say what is on your mind and feel heard, and short enough to fit into a lunch break or the walk home. If you want longer, choose ${M2} or ${M3} minutes.` },
  { q: 'How much does it cost?', a: `Each listener sets their own price per minute, plus a flat ${FEE} per session. At the standard rate, ${M1} minutes is ${price(M1)}, ${M2} minutes ${price(M2)} and ${M3} minutes ${price(M3)}${VOICE_PRICING_ENABLED ? `; voice is ${VOICE_RATE_PREMIUM}p a minute more` : ''}. You always see the price before you start, and there is no subscription.` },
  { q: 'What happens when I tap an answer?', a: 'You sign in with Google (first time only), see the exact price, and confirm. Only then do we ask a listener who is online. If nobody can pick up, you are not charged.' },
  { q: 'Who are the listeners?', a: 'Adults in the UK with lived experience of things like loneliness, relationships, work pressure, grief or big life changes. Every listener passes an identity selfie check, a screening quiz on listening, boundaries and when to point someone to urgent help, and a review by our team. They are peers, not therapists.' },
  { q: 'Is it private?', a: 'Listeners only see the first name you choose — never your phone number or email. Voice calls are not recorded. You can end a session, block or report someone at any time.' },
  { q: 'Can I book for later instead?', a: 'Yes. Open a listener\'s profile and pick a time from their weekly hours (UK time). The price is held when you book, and you get a reminder before it starts.' },
  { q: 'What if I am in crisis?', a: 'How Was Your Day is not an emergency service. If you are in danger, call 999. You can ring Samaritans free on 116 123 or text SHOUT to 85258, any time of day or night.' },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
}

const CSS = `
.hw{--sun:#E8743B;--ember:#B85520;--ember-d:#9E4719;--peach:#FFF6EF;--apricot:#FBE3D2;--line:#F2DFD1;--ink:#3B2F2A;--muted:#6E5B50;
  font-family:Nunito,sans-serif;color:var(--ink);background:#fff;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.hw *{box-sizing:border-box;margin:0;padding:0}
.hw a{text-decoration:none}
.hw a:not(.hw-btn):not(.hw-ans){color:inherit}
.hw-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.hw :focus-visible{outline:3px solid var(--sun);outline-offset:3px;border-radius:12px}

/* nav */
.hw-nav{display:flex;align-items:center;justify-content:space-between;height:76px}
.hw-nav img{height:44px;width:auto;display:block}
.hw-nav-links{display:flex;align-items:center;gap:22px}
.hw-nav-links a.t{font-size:14.5px;font-weight:800;color:var(--muted);display:none}
.hw-nav-links a.t:hover{color:var(--ember)}
@media(min-width:760px){.hw-nav-links a.t{display:inline}}

/* buttons */
.hw-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:999px;font-weight:900;font-size:16px;padding:15px 26px;transition:transform .15s,background .15s,box-shadow .15s,border-color .15s;border:2px solid transparent;cursor:pointer;text-align:center}
.hw-btn-p{background:var(--ember);color:#fff;box-shadow:0 8px 24px rgba(184,85,32,.25)}
.hw-btn-p:hover{background:var(--ember-d);transform:translateY(-1px)}
.hw-btn-g{background:#fff;color:var(--ember);border-color:var(--line)}
.hw-btn-g:hover{border-color:var(--ember)}
.hw-btn-s{padding:10px 18px;font-size:14px}
.hw-btn small{font-weight:700;opacity:.85;font-size:13px}

/* hero */
.hw-hero{background:radial-gradient(ellipse 80% 70% at 85% 0%,#FFE9DA 0%,rgba(255,246,239,.6) 45%,#fff 75%)}
.hw-hero-grid{display:grid;gap:40px;padding:28px 0 56px;align-items:center}
@media(min-width:960px){.hw-hero-grid{grid-template-columns:1.15fr .85fr;padding:48px 0 72px}}
.hw-h1{font-size:clamp(46px,8.4vw,80px);line-height:.98;font-weight:900;letter-spacing:-1.8px;margin-bottom:16px}
.hw-h1 span{color:var(--sun)}
.hw-lead{font-size:clamp(18px,2.3vw,22px);font-weight:700;line-height:1.45;color:var(--muted);max-width:540px;margin-bottom:26px}
.hw-lead b{color:var(--ink)}
.hw-ask{font-size:13px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--ember);margin-bottom:12px}
.hw-answers{display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:560px}
@media(min-width:560px){.hw-answers{grid-template-columns:1fr 1fr 1fr}}
.hw-ans{display:flex;align-items:center;gap:10px;background:#fff;border:2px solid var(--line);border-radius:18px;padding:14px 14px;font-weight:900;font-size:15.5px;color:var(--ink);transition:border-color .15s,transform .15s,box-shadow .15s;min-height:56px}
.hw-ans:hover{border-color:var(--sun);transform:translateY(-2px);box-shadow:0 10px 24px rgba(232,116,59,.14)}
.hw-ans .e{font-size:22px;line-height:1}
.hw-ans.main{grid-column:1/-1;background:var(--ember);border-color:var(--ember);color:#fff;justify-content:space-between;font-size:17px;padding:16px 20px;box-shadow:0 10px 26px rgba(184,85,32,.28)}
.hw-ans.main:hover{background:var(--ember-d);border-color:var(--ember-d)}
.hw-ans.main small{font-weight:800;font-size:13.5px;opacity:.9;white-space:nowrap}
.hw-reass{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:16px;font-size:13.5px;font-weight:800;color:var(--muted)}
.hw-reass span:before{content:'✓ ';color:var(--sun)}
.hw-alt{margin-top:18px;font-size:15px;font-weight:700;color:var(--muted)}
.hw-alt a{color:var(--ember)!important;font-weight:900;border-bottom:2px solid var(--apricot)}

/* example chat */
.hw-card{background:#fff;border:1.5px solid var(--line);border-radius:28px;padding:22px;box-shadow:0 24px 60px rgba(59,47,42,.10);max-width:420px;width:100%;justify-self:center}
.hw-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
.hw-who{display:flex;gap:10px;align-items:center}
.hw-av{width:40px;height:40px;border-radius:50%;background:var(--apricot);display:flex;align-items:center;justify-content:center;font-weight:900;color:var(--ember)}
.hw-who b{display:block;font-size:15px}.hw-who small{font-size:12px;color:var(--muted);font-weight:700}
.hw-timer{position:relative;width:58px;height:58px}
.hw-timer svg{transform:rotate(-90deg)}
.hw-timer span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:var(--ember)}
.hw-ring{stroke-dasharray:157;stroke-dashoffset:0;animation:hwRing 16s linear infinite}
@keyframes hwRing{to{stroke-dashoffset:157}}
.hw-msgs{display:flex;flex-direction:column;gap:10px}
.hw-m{max-width:82%;padding:11px 15px;border-radius:18px;font-size:14.5px;line-height:1.5;font-weight:600;opacity:0;animation:hwIn .5s ease forwards}
.hw-m.l{background:var(--peach);border-bottom-left-radius:6px}
.hw-m.r{background:var(--ember);color:#fff;align-self:flex-end;border-bottom-right-radius:6px}
.hw-m:nth-child(1){animation-delay:.2s}.hw-m:nth-child(2){animation-delay:1.1s}.hw-m:nth-child(3){animation-delay:2s}.hw-m:nth-child(4){animation-delay:2.9s}
@keyframes hwIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.hw-m{opacity:1;animation:none}.hw-ring{animation:none}}
.hw-card-foot{margin-top:16px;padding-top:14px;border-top:1px dashed var(--line);font-size:12.5px;color:var(--muted);font-weight:700;text-align:center}
@media(max-width:959px){.hw-card{display:none}}

/* trust strip */
.hw-strip{border-top:1.5px solid var(--line);border-bottom:1.5px solid var(--line);background:#fff}
.hw-strip-in{display:grid;grid-template-columns:repeat(2,1fr);gap:14px 18px;padding:18px 0}
@media(min-width:860px){.hw-strip-in{grid-template-columns:repeat(4,1fr)}}
.hw-strip-in div{display:flex;gap:10px;align-items:flex-start;font-size:14px;font-weight:700;color:var(--muted);line-height:1.4}
.hw-strip-in b{display:block;color:var(--ink);font-size:14.5px}
.hw-strip-in i{font-style:normal;font-size:20px;line-height:1.1}

/* sections */
.hw-sec{padding:72px 0}
.hw-sec.peach{background:var(--peach)}
.hw-eye{font-size:13px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:var(--ember);margin-bottom:10px}
.hw-h2{font-size:clamp(28px,4.4vw,42px);line-height:1.12;font-weight:900;letter-spacing:-.6px;margin-bottom:14px}
.hw-h2 span{color:var(--sun)}
.hw-p{font-size:17px;line-height:1.7;color:var(--muted);font-weight:600;max-width:640px}
.hw-cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px;align-items:center}

/* 8 minutes */
.hw-eight{display:grid;gap:28px;align-items:center}
@media(min-width:900px){.hw-eight{grid-template-columns:.7fr 1.3fr;gap:36px}}
.hw-big8{font-size:clamp(120px,22vw,220px);font-weight:900;line-height:.85;color:var(--sun);letter-spacing:-6px}
.hw-big8 small{display:block;font-size:22px;letter-spacing:0;color:var(--ink);margin-top:10px}

/* two ways */
.hw-ways{display:grid;gap:16px;margin-top:32px}
@media(min-width:760px){.hw-ways{grid-template-columns:1fr 1fr}}
.hw-way{background:#fff;border:1.5px solid var(--line);border-radius:24px;padding:28px;display:flex;flex-direction:column}
.hw-way .ico{width:52px;height:52px;border-radius:16px;background:var(--apricot);display:flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px}
.hw-way h3{font-size:22px;font-weight:900;margin-bottom:8px}
.hw-way p{font-size:15.5px;line-height:1.65;color:var(--muted);font-weight:600;margin-bottom:10px}
.hw-way ol{list-style:decimal;margin:4px 0 22px 22px;padding-left:4px;font-size:15px;line-height:1.8;color:var(--muted);font-weight:700}
.hw-way .hw-btn{margin-top:auto;align-self:flex-start}

/* pricing */
.hw-prices{display:grid;gap:16px;margin-top:32px}
@media(min-width:760px){.hw-prices{grid-template-columns:repeat(3,1fr)}}
.hw-price{background:#fff;border:1.5px solid var(--line);border-radius:24px;padding:28px;position:relative;display:flex;flex-direction:column}
.hw-price.f{border:2.5px solid var(--sun);box-shadow:0 18px 40px rgba(232,116,59,.14)}
.hw-badge{position:absolute;top:-13px;left:24px;background:var(--sun);color:#fff;font-size:12px;font-weight:900;padding:5px 12px;border-radius:999px}
.hw-price .min{font-size:15px;font-weight:900;color:var(--ember)}
.hw-price .amt{font-size:44px;font-weight:900;letter-spacing:-1px;margin:6px 0 4px}
.hw-price .nm{font-size:17px;font-weight:900;margin-bottom:6px}
.hw-price p{font-size:14.5px;color:var(--muted);line-height:1.6;font-weight:600;margin-bottom:20px}
.hw-price .hw-btn{margin-top:auto}
.hw-small{font-size:14px;color:var(--muted);line-height:1.7;font-weight:600;margin-top:20px;max-width:760px}

/* trust */
.hw-grid3{display:grid;gap:16px;margin-top:32px}
@media(min-width:760px){.hw-grid3{grid-template-columns:repeat(3,1fr)}}
.hw-tile{background:#fff;border:1.5px solid var(--line);border-radius:22px;padding:26px}
.hw-ico{width:48px;height:48px;border-radius:14px;background:var(--apricot);display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:16px}
.hw-tile h3{font-size:19px;font-weight:900;margin-bottom:8px}
.hw-tile p{font-size:15px;line-height:1.65;color:var(--muted);font-weight:600}
.hw-crisis{margin-top:28px;background:#FFF4F2;border:1.5px solid #F6D3CC;border-radius:20px;padding:20px 22px;font-size:15px;line-height:1.7;font-weight:600}
.hw-crisis strong{color:#8E2A1B}.hw-crisis a{color:#B71C1C!important;font-weight:900}

/* faq */
.hw-faq{max-width:780px;margin-top:28px;border-top:1.5px solid var(--line)}
.hw-faq details{border-bottom:1.5px solid var(--line);padding:18px 4px}
.hw-faq summary{cursor:pointer;font-size:17px;font-weight:900;list-style:none;display:flex;justify-content:space-between;gap:16px}
.hw-faq summary::-webkit-details-marker{display:none}
.hw-faq summary:after{content:'+';color:var(--sun);font-size:22px;line-height:1}
.hw-faq details[open] summary:after{content:'–'}
.hw-faq p{margin-top:10px;font-size:15.5px;line-height:1.7;color:var(--muted);font-weight:600}

/* final */
.hw-final{background:linear-gradient(135deg,#E8743B 0%,#C95C26 100%);border-radius:32px;padding:52px 24px;text-align:center;color:#fff}
.hw-final h2{font-size:clamp(30px,5vw,48px);font-weight:900;letter-spacing:-.6px;margin-bottom:10px}
.hw-final p{font-size:18px;font-weight:700;margin-bottom:24px}
.hw-final .hw-answers{margin:0 auto;max-width:640px}
.hw-final .hw-ans{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.35);color:#fff}
.hw-final .hw-ans:hover{background:rgba(255,255,255,.24);border-color:#fff;box-shadow:none}
.hw-final .hw-ans.main{background:#fff;border-color:#fff;color:var(--ember-d)}
.hw-final .hw-ans.main:hover{background:#FFF6EF}

/* mobile sticky start bar */
.hw-sticky{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;align-items:center;justify-content:space-between;gap:12px;
  background:#fff;border:1.5px solid var(--line);border-radius:20px;padding:10px 10px 10px 16px;box-shadow:0 14px 40px rgba(59,47,42,.18);
  transform:translateY(140%);transition:transform .25s ease;pointer-events:none}
.hw-sticky.on{transform:none;pointer-events:auto}
.hw-sticky b{display:block;font-size:15px;font-weight:900}
.hw-sticky span{font-size:12.5px;font-weight:700;color:var(--muted)}
.hw-sticky a{background:var(--ember);color:#fff!important;font-weight:900;font-size:15px;padding:12px 18px;border-radius:999px;white-space:nowrap}
@media(min-width:900px){.hw-sticky{display:none}}
`

function Answers({ src }: { src: string }) {
  return (
    <div className="hw-answers">
      {ANSWERS.map(a => (
        <a key={a.topic} className="hw-ans" href={talk(`topic=${a.topic}&src=${src}`)}>
          <span className="e" aria-hidden="true">{a.emoji}</span>{a.label}
        </a>
      ))}
      <a className="hw-ans" href={talk(`topic=talk&src=${src}`)}><span className="e" aria-hidden="true">🤷</span>Hard to say</a>
      <a className="hw-ans main" href={talk(`topic=talk&src=${src}`)}>
        <span>I just need to talk →</span><small>{M1} min · {P1}</small>
      </a>
    </div>
  )
}

export default function Home() {
  return (
    <div className="hw">
      <AuthRedirect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="hw-hero">
        <div className="hw-wrap">
          <nav className="hw-nav" aria-label="Main">
            <a href="/" aria-label="How Was Your Day — home"><img src="/brand/logo.png" alt="How Was Your Day" width={141} height={44} /></a>
            <div className="hw-nav-links">
              <a className="t" href="/how-it-works">How it works</a>
              <a className="t" href="/pricing">Pricing</a>
              <a className="t" href="/browse">Listeners</a>
              <a className="hw-btn hw-btn-g hw-btn-s" href="/auth">Sign in</a>
            </div>
          </nav>

          <div className="hw-hero-grid">
            <div>
              <h1 className="hw-h1">How was <span>your day?</span></h1>
              <p className="hw-lead">
                Tell someone who&apos;s actually listening. A real person, by text or voice —{' '}
                <b>8 minutes is enough.</b>
              </p>
              <p className="hw-ask" id="hero-ask">Tap how it was</p>
              <div id="hero-answers" aria-labelledby="hero-ask"><Answers src="home" /></div>
              <p className="hw-reass"><span>You see the price first</span><span>Not charged if nobody picks up</span><span>No subscription</span></p>
              <p className="hw-alt">Want to choose who you talk to, or book a time? <a href="/browse">Browse listeners</a></p>
            </div>

            <div className="hw-card" aria-hidden="true">
              <div className="hw-card-top">
                <div className="hw-who"><div className="hw-av">S</div><div><b>Sam</b><small>Peer listener</small></div></div>
                <div className="hw-timer">
                  <svg width="58" height="58" viewBox="0 0 58 58">
                    <circle cx="29" cy="29" r="25" fill="none" stroke="#FBE3D2" strokeWidth="5" />
                    <circle className="hw-ring" cx="29" cy="29" r="25" fill="none" stroke="#E8743B" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                  <span>8:00</span>
                </div>
              </div>
              <div className="hw-msgs">
                <div className="hw-m l">Hi, I&apos;m Sam. So… how was your day?</div>
                <div className="hw-m r">Honestly? Long. Can I just get something off my chest?</div>
                <div className="hw-m l">Of course. Take your time — I&apos;m listening.</div>
                <div className="hw-m r">Thank you. I didn&apos;t want to put this on my friends.</div>
              </div>
              <p className="hw-card-foot">Illustration · Listeners see only the first name you choose</p>
            </div>
          </div>
        </div>
      </header>

      <section className="hw-strip" aria-label="Why people trust How Was Your Day">
        <div className="hw-wrap hw-strip-in">
          <div><i aria-hidden="true">✅</i><span><b>Screened listeners</b>ID selfie, quiz and review</span></div>
          <div><i aria-hidden="true">🔒</i><span><b>First name only</b>Never your number or email</span></div>
          <div><i aria-hidden="true">🎧</i><span><b>Not recorded</b>Voice calls stay between you</span></div>
          <div><i aria-hidden="true">🇬🇧</i><span><b>UK listeners</b>Prices in pounds</span></div>
        </div>
      </section>

      <main>
        <section className="hw-sec" aria-labelledby="eight">
          <div className="hw-wrap hw-eight">
            <div className="hw-big8" aria-hidden="true">8<small>minutes</small></div>
            <div>
              <p className="hw-eye">Why 8 minutes?</p>
              <h2 id="eight" className="hw-h2">Not every hard day needs an hour. <span>Sometimes it just needs saying out loud.</span></h2>
              <p className="hw-p">
                Eight minutes with someone who is fully listening can take the weight off — before bed, on a lunch break,
                or on the walk home. No waiting list, no forms, no pressure to explain everything.
                It&apos;s {P1} at the standard rate, and you can choose {M2} or {M3} minutes when you need longer.
              </p>
              <div className="hw-cta-row">
                <a className="hw-btn hw-btn-p" href={talk(`mins=${M1}&src=home_eight`)}>Start my 8 minutes</a>
              </div>
            </div>
          </div>
        </section>

        <section className="hw-sec peach" aria-labelledby="ways">
          <div className="hw-wrap">
            <p className="hw-eye">How it works</p>
            <h2 id="ways" className="hw-h2">Two ways to <span>talk</span></h2>
            <div className="hw-ways">
              <div className="hw-way">
                <div className="ico" aria-hidden="true">⚡</div>
                <h3>Talk now</h3>
                <p>For when it&apos;s on your mind right now.</p>
                <ol>
                  <li>Say what it&apos;s about, and pick text or voice</li>
                  <li>See the exact price and confirm</li>
                  <li>We ask a listener who&apos;s online — not charged if nobody picks up</li>
                </ol>
                <a className="hw-btn hw-btn-p" href={talk('src=home_ways')}>Talk to someone now</a>
              </div>
              <div className="hw-way">
                <div className="ico" aria-hidden="true">📅</div>
                <h3>Book a time</h3>
                <p>For when you&apos;d rather plan it, or want someone in particular.</p>
                <ol>
                  <li>Browse listeners and read their stories</li>
                  <li>Pick a slot from their weekly hours (UK time)</li>
                  <li>We remind you 24 hours and 15 minutes before</li>
                </ol>
                <a className="hw-btn hw-btn-g" href="/browse">Browse listeners</a>
              </div>
            </div>
          </div>
        </section>

        <section className="hw-sec" aria-labelledby="pricing">
          <div className="hw-wrap">
            <p className="hw-eye">Pricing</p>
            <h2 id="pricing" className="hw-h2">Simple, honest, <span>in pounds</span></h2>
            <p className="hw-p">Each listener sets their own price per minute, plus a flat {FEE} per session. Prices below are at the standard rate.</p>
            <div className="hw-prices">
              <div className="hw-price f">
                <span className="hw-badge">8 minutes is enough</span>
                <div className="min">{M1} minutes</div><div className="amt">{price(M1)}</div>
                <div className="nm">Quick check-in</div><p>Get it off your chest and feel lighter.</p>
                <a className="hw-btn hw-btn-p" href={talk(`mins=${M1}&src=home_price`)}>Start {M1} minutes</a>
              </div>
              <div className="hw-price">
                <div className="min">{M2} minutes</div><div className="amt">{price(M2)}</div>
                <div className="nm">Talk it through</div><p>Room to unpack what happened.</p>
                <a className="hw-btn hw-btn-g" href={talk(`mins=${M2}&src=home_price`)}>Start {M2} minutes</a>
              </div>
              <div className="hw-price">
                <div className="min">{M3} minutes</div><div className="amt">{price(M3)}</div>
                <div className="nm">Deeper conversation</div><p>For the days that need more time.</p>
                <a className="hw-btn hw-btn-g" href={talk(`mins=${M3}&src=home_price`)}>Start {M3} minutes</a>
              </div>
            </div>
            <p className="hw-small">
              Text prices shown{VOICE_PRICING_ENABLED ? `; voice is ${VOICE_RATE_PREMIUM}p a minute more` : ''}. You top up a wallet and pay per
              session — no subscription, and unused balance can be refunded. You&apos;re only charged if a listener accepts.{' '}
              <a href="/pricing" style={{ color: '#B85520', fontWeight: 900 }}>Full pricing →</a>
            </p>
          </div>
        </section>

        <section className="hw-sec peach" aria-labelledby="trust">
          <div className="hw-wrap">
            <p className="hw-eye">Safe and private</p>
            <h2 id="trust" className="hw-h2">Real people you can <span>trust</span></h2>
            <div className="hw-grid3">
              <div className="hw-tile"><div className="hw-ico">✅</div><h3>Screened listeners</h3><p>An identity selfie check, a screening quiz on listening and boundaries, and a review by our team before anyone can listen.</p></div>
              <div className="hw-tile"><div className="hw-ico">🔒</div><h3>Private by design</h3><p>Listeners see only the first name you choose — never your number or email. Voice calls aren&apos;t recorded.</p></div>
              <div className="hw-tile"><div className="hw-ico">🤝</div><h3>You&apos;re in control</h3><p>End a session whenever you like, and block or report anyone. Reports go straight to our team.</p></div>
            </div>
            <div className="hw-crisis" role="note">
              <strong>How Was Your Day is peer support — not therapy and not an emergency service.</strong>{' '}
              If you are in danger, call <a href="tel:999">999</a>. You can ring <a href="tel:116123">Samaritans on 116 123</a> or
              text <a href="sms:85258?body=SHOUT">SHOUT to 85258</a> — free, any time.{' '}
              <a href="/safeguarding" style={{ color: '#B85520' }}>How we keep people safe →</a>
            </div>
          </div>
        </section>

        <section className="hw-sec" aria-labelledby="faq">
          <div className="hw-wrap">
            <p className="hw-eye">Questions</p>
            <h2 id="faq" className="hw-h2">Good to know</h2>
            <div className="hw-faq">
              {FAQ.map(f => (<details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>))}
            </div>
          </div>
        </section>

        <section className="hw-sec" style={{ paddingTop: 0 }} aria-labelledby="final">
          <div className="hw-wrap">
            <div className="hw-final">
              <h2 id="final">So… how was your day?</h2>
              <p>Tap an answer. Someone&apos;s ready to listen.</p>
              <Answers src="home_final" />
            </div>
          </div>
        </section>
      </main>

      <HomeStickyCta price={P1} mins={M1} />
    </div>
  )
}
