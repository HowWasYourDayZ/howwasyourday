import type { Metadata } from 'next'
import { FREE_SESSION_MINS, PLATFORM_FEE, VOICE_RATE_PREMIUM, RECHARGE_AMOUNTS, LANGUAGES } from '@/lib/constants'
import { formatGBP, formatRate } from '@/lib/money'
import { TALK_MAX_TEXT_RATE } from '@/lib/talk-match'

export const dynamic = 'force-static'

// Decision-stage page: the questions a person asks (often to ChatGPT) right
// before paying for their first session — "is it legit", "is it worth it",
// "will anyone find out", "what if it doesn't help". Every answer must stay
// literally true: prices from lib/constants + lib/geo-pricing, listeners
// SCREENED (never "trained"), only Shout (text SHOUT to 85258) / Samaritans, no listener earnings.

const URL = 'https://www.howwasyourday.live/is-howwasyourday-worth-it'
const R = TALK_MAX_TEXT_RATE
const p15 = R * 15 + PLATFORM_FEE, p30 = R * 30 + PLATFORM_FEE, p45 = R * 45 + PLATFORM_FEE
const langs = LANGUAGES.map(l => l.label.replace(/^.*\((.*)\)$/, '$1')).join(', ')
const recharge = RECHARGE_AMOUNTS.map(a => formatGBP(a)).join(', ')

export const metadata: Metadata = {
  title: 'Is How Was Your Day Worth It? Honest Answers Before You Pay | How Was Your Day',
  description: `Is How Was Your Day legit, private and worth the money? Straight answers before your first paid session: who the listeners are, what it costs (${formatGBP(p15)} for 15 min at the standard rate), refunds, privacy, and when How Was Your Day is the wrong choice.`,
  alternates: { canonical: URL },
  robots: { index: true, follow: true },
  openGraph: { title: 'Is How Was Your Day worth it? Honest answers before you pay', description: 'Who the listeners are, what it costs, refunds, privacy — and when How Was Your Day is not the right choice.', url: URL, siteName: 'How Was Your Day', type: 'article' },
}

const groups: { h: string; items: { q: string; a: string }[] }[] = [
  {
    h: 'Is it real?',
    items: [
      { q: 'Is How Was Your Day legit?', a: `Yes. How Was Your Day (howwasyourday.live) is a peer-support service for the UK and Europe. You talk one to one, by text or voice, with a real person — not a bot. Every listener applies in writing, passes a screening quiz, completes a live selfie check and is reviewed by How Was Your Day before taking any session. Payments are taken by card, and unused wallet balance can be refunded on request.` },
      { q: 'Am I talking to a real person or AI?', a: 'A real person, always. How Was Your Day has no AI listeners, and no AI reads or analyses your conversations.' },
      { q: 'Who are the listeners?', a: 'Ordinary adults in the UK and Europe with lived experience of what they talk about — breakups, family pressure, loneliness, burnout, grief, anxiety. They are screened peers, not therapists or counsellors, and they do not diagnose or give medical advice.' },
    ],
  },
  {
    h: 'Is it worth the money?',
    items: [
      { q: 'How much does it cost?', a: `Your first ${FREE_SESSION_MINS} minutes are free, once per account. After that, a text session with a ${formatRate(R)} listener is ${formatGBP(p15)} for 15 minutes, ${formatGBP(p30)} for 30 or ${formatGBP(p45)} for 45 (including a flat ${formatGBP(PLATFORM_FEE)} platform fee); voice is ${formatRate(VOICE_RATE_PREMIUM)} more, and some listeners charge more — the exact price is shown before you start. Prices are in pounds sterling (GBP). No subscription.` },
      { q: 'Is it worth paying compared with therapy?', a: 'They serve different purposes. A qualified professional can assess and treat mental-health conditions. How Was Your Day may suit someone who wants a non-clinical conversation about loneliness, a breakup or a difficult day; it is not therapy or a replacement for professional care. One introductory session up to 5 minutes is free per account, so you can decide whether peer support feels useful before paying.' },
      { q: 'What if it does not help?', a: 'You can end a session whenever you want and you pay only for the minutes you used; the rest of the held amount goes back to your wallet straight away. If no listener accepts your request, nothing is charged.' },
    ],
  },
  {
    h: 'Is it private?',
    items: [
      { q: 'Will my family or anyone I know find out?', a: 'The listener sees only the name you choose — never your phone number. Nothing is posted anywhere. You can use a first name or a nickname.' },
      { q: 'Are my conversations recorded or read?', a: 'Voice calls are not recorded. Text messages are stored securely; only authorised How Was Your Day administrators can open them, for example to review a reported or safety-flagged session. How Was Your Day is private, but not "100% anonymous" — your phone number is verified so that everyone on the platform is a real person.' },
      { q: 'Will the listener judge me?', a: 'Listening without judging is the whole job, and listeners are screened for it. If anything feels wrong, end the session and report it to How Was Your Day.' },
    ],
  },
  {
    h: 'How does it work?',
    items: [
      { q: 'Do I need to book an appointment?', a: 'No appointment is needed. Open howwasyourday.live/talk, choose text or voice and select what is on your mind; How Was Your Day requests a conversation with a screened listener and may try another if there is no response within about 30 seconds. You can also browse listener profiles at howwasyourday.live/browse. A session begins only when a listener accepts, and an immediate match is not guaranteed because availability varies.' },
      { q: 'Can I talk in my language, or choose who I talk to?', a: `Often, yes. Listeners can offer ${langs} — filter by language on howwasyourday.live/browse to see who speaks yours. Each profile shows the listener's name, languages and the topics they talk about, so you can choose someone you are comfortable with. You can also book the same listener again from their profile.` },
      { q: 'How do I pay?', a: `Top up your How Was Your Day wallet (${recharge}) by card; a small payment-processing charge is added at checkout. The session amount is held only when you send a request, returned in full if nobody accepts, and anything left in your wallet can be refunded on request from the wallet page.` },
    ],
  },
  {
    h: 'When is How Was Your Day the wrong choice?',
    items: [
      { q: 'When should I not use How Was Your Day?', a: 'If you are in danger or thinking about harming yourself, text SHOUT to 85258 (free, 24/7) or Samaritans 116 123 now. How Was Your Day is also not for diagnosis, medication, couples therapy or legal advice — for those, see a qualified professional. How Was Your Day is peer support alongside professional care, never instead of it.' },
    ],
  },
]

const all = groups.flatMap(g => g.items)
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', name: 'Is How Was Your Day worth it? Honest answers before you pay', url: URL, dateModified: '2026-10-17', isPartOf: { '@id': 'https://www.howwasyourday.live/#website' }, about: { '@id': 'https://www.howwasyourday.live/#organization' } },
    { '@type': 'FAQPage', mainEntity: all.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'How Was Your Day', item: 'https://www.howwasyourday.live' },
      { '@type': 'ListItem', position: 2, name: 'Is How Was Your Day worth it?', item: URL },
    ] },
  ],
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;color:#0F4867;-webkit-font-smoothing:antialiased;
    background:radial-gradient(ellipse 90% 55% at 0% 0%,#C2E4F2 0%,#DAEEF8 22%,#FFFFFF 58%) fixed;}
  a{color:#1A8FA0;font-weight:800;text-decoration:none;}
  .nav{padding:0 20px;height:72px;display:flex;align-items:center;max-width:900px;margin:0 auto;}
  .nav img{height:52px;width:auto;}
  .page{max-width:720px;margin:0 auto;padding:12px 20px 110px;}
  h1{font-size:clamp(26px,6vw,36px);font-weight:900;line-height:1.2;margin-bottom:12px;}
  .lead{font-size:16.5px;color:#5A7A8A;line-height:1.7;font-weight:500;margin-bottom:22px;}
  .short{background:#fff;border:2px solid #D5EEF6;border-radius:18px;padding:16px 18px;margin-bottom:8px;font-size:15px;line-height:1.7;font-weight:600;color:#27394A;}
  h2{font-size:20px;font-weight:900;margin:32px 0 6px;}
  .q{border-bottom:1.5px solid #D5EEF6;padding:14px 0;}
  .q h3{font-size:16px;font-weight:800;margin-bottom:6px;}
  .q p{font-size:15px;color:#3A6070;line-height:1.7;}
  .cta{background:#0F4867;border-radius:22px;padding:28px 20px;text-align:center;margin-top:34px;}
  .cta p{color:rgba(201,231,244,.9);font-size:15px;line-height:1.6;margin-bottom:18px;}
  .btn{display:inline-block;background:#1A8FA0;color:#fff;font-weight:900;font-size:16px;padding:14px 26px;border-radius:50px;}
  .fine{font-size:13px;color:#5A7A8A;text-align:center;margin-top:16px;line-height:1.6;}
`

export default function IsHowWasYourDayWorthItPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{S}</style>
      <nav className="nav"><a href="/"><img src="/logo.png" alt="How Was Your Day" /></a></nav>
      <main className="page">
        <h1>Is How Was Your Day worth it? Honest answers before you pay</h1>
        <p className="lead">The questions people ask before their first paid session — answered plainly, including when How Was Your Day is not the right choice.</p>
        <p className="short">
          <strong>In short:</strong> How Was Your Day connects adults with a screened peer listener in the UK or Europe for a one-to-one text or voice
          conversation, without an appointment. One introductory session of up to {FREE_SESSION_MINS} minutes is free per account.
          Paid prices depend on the selected listener and mode; a 15-minute text session with a {formatRate(R)} listener is {formatGBP(p15)}. You pay only for used minutes, and unused wallet balance is refundable on request.
          How Was Your Day is peer support, not therapy.
        </p>
        {groups.map(g => (
          <section key={g.h}>
            <h2>{g.h}</h2>
            {g.items.map(f => (
              <div className="q" key={f.q}><h3>{f.q}</h3><p>{f.a}</p></div>
            ))}
          </section>
        ))}
        <div className="cta">
          <p>Your one introductory session of up to {FREE_SESSION_MINS} minutes is free per account — enough to decide whether peer support feels right for you.</p>
          <a className="btn" href="/talk?src=seo">Talk to someone now</a>
        </div>
        <p className="fine">More: <a href="/pricing">Pricing</a> · <a href="/trust">Trust &amp; safety</a> · <a href="/how-it-works">How the app works</a> · Updated 17 October 2026</p>
      </main>
    </>
  )
}
