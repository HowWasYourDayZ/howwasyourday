import type { Metadata } from 'next'
import { PLATFORM_FEE, SESSION_DURATIONS, VOICE_RATE_PREMIUM, VOICE_PRICING_ENABLED, MIN_LISTENER_RATE, DEFAULT_LISTENER_RATE } from '@/lib/constants'
import { formatGBP, formatRate } from '@/lib/money'
import { PRICE_RANGE_LINE } from '@/lib/price-snapshot'
import { LISTENING_FACTS } from '@/lib/service-facts'

// The single source of truth for "how much does How Was Your Day cost" — for people,
// Google and AI assistants. Every number is read from lib/constants.ts (pence,
// formatted by lib/money.ts), so this page can't drift from what users are charged.
export const dynamic = 'force-static'

const URL = 'https://www.howwasyourday.live/pricing'
const EXAMPLE_RATE = DEFAULT_LISTENER_RATE // pence/min — the standard starting rate, used as a worked example
const example = (mins: number, voice = false) => (EXAMPLE_RATE + (voice ? VOICE_RATE_PREMIUM : 0)) * mins + PLATFORM_FEE

export const metadata: Metadata = {
  title: 'How Was Your Day Pricing — UK | 8, 16 and 32-minute sessions',
  description: `How much How Was Your Day costs: sessions of ${SESSION_DURATIONS.join(', ')} minutes, priced by each listener per minute in pounds — 8 minutes is ${formatGBP(example(8))} with a ${formatRate(EXAMPLE_RATE)} listener, including the ${formatGBP(PLATFORM_FEE)} platform fee. No subscription.`,
  alternates: { canonical: URL },
  openGraph: { title: 'How Was Your Day Pricing — UK', description: `Pay per session in GBP, from 8 minutes, no subscription. Listener rate × minutes + ${formatGBP(PLATFORM_FEE)}.`, url: URL, siteName: 'How Was Your Day', type: 'website' },
}

const faqs: [string, string][] = [
  ['How much does How Was Your Day cost?', `Each listener sets their own per-minute rate, from ${formatRate(MIN_LISTENER_RATE)}. A paid session costs the listener's rate × the minutes you book, plus a flat ${formatGBP(PLATFORM_FEE)} platform fee. ${PRICE_RANGE_LINE} You see the exact price before you start.`],
  ['Which currency do you charge in?', 'Pounds sterling (GBP), everywhere. If you pay with a euro or other card, your bank converts the amount at its own rate and may add a fee.'],
  ['Is there a free session?', `No. Every session is paid, from ${SESSION_DURATIONS[0]} minutes — the shortest session is the low-cost way to try a listener. You only pay for the minutes you use, nothing if a listener never connects, and there is no subscription or membership fee.`],
  ['Can I book a session for later?', 'Yes. Many listeners publish weekly hours, so you can book a time that suits you. The price is held from your wallet when you book and refunded in full if you cancel at least 2 hours before, or if the listener does not join.'],
  ...(VOICE_PRICING_ENABLED ? [['Is a voice call more expensive than text chat?', `Yes, by ${formatRate(VOICE_RATE_PREMIUM)}. A listener charging ${formatRate(EXAMPLE_RATE)} for text chat charges ${formatRate(EXAMPLE_RATE + VOICE_RATE_PREMIUM)} for a voice call, so 16 minutes of voice costs ${formatGBP(example(16, true))}. If a call drops and you switch to text, the extra for the unused minutes is refunded.`] as [string, string]] : []),
  ['How do I pay?', 'You add money to your How Was Your Day wallet by card and each session is paid from the wallet. You only pay for sessions you book, unused minutes come back to your wallet, and unused balance is refundable on request.'],
  ['How does How Was Your Day compare with therapy costs?', 'How Was Your Day is peer support, not therapy, so it is not a like-for-like comparison. How Was Your Day is for when you want a real person to listen, not for clinical treatment. If you need a professional, speak to your GP or a qualified mental health professional; in the UK, NHS talking therapies are free.'],
]

export default function PricingPage() {
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebPage', '@id': `${URL}#webpage`, url: URL, name: 'How Was Your Day pricing', isPartOf: { '@id': 'https://www.howwasyourday.live/#website' }, dateModified: '2026-10-24' },
    { '@type': 'Service', name: 'How Was Your Day peer support session', serviceType: 'Peer emotional support (text or voice)', provider: { '@id': 'https://www.howwasyourday.live/#organization' }, areaServed: ['GB'],
      offers: [
        ...SESSION_DURATIONS.map(m => ({ '@type': 'Offer', name: `${m}-minute text session at the standard ${formatRate(EXAMPLE_RATE)} rate (each listener sets their own price)`, price: (example(m) / 100).toFixed(2), priceCurrency: 'GBP' })),
      ] },
    { '@type': 'FAQPage', mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'How Was Your Day', item: 'https://www.howwasyourday.live' }, { '@type': 'ListItem', position: 2, name: 'Pricing', item: URL }] },
  ] }
  const cell = 'border-b border-slate-200 px-3 py-3 text-left'
  return <main className="min-h-screen bg-white text-[#3B2F2A]"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <nav className="mb-10 flex items-center justify-between"><a href="/"><img src="/logo.png" alt="How Was Your Day" className="h-11 w-auto" /></a><a href="/browse" className="rounded-full bg-[#B85520] px-5 py-2.5 text-sm font-extrabold text-white">Browse listeners</a></nav>
      <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-[#B85520]">Pricing</p>
      <h1 className="mb-4 text-4xl font-black leading-tight">What How Was Your Day costs</h1>
      <p className="mb-8 text-lg leading-8 text-slate-600">Pay per session — {SESSION_DURATIONS.join(', ')} minutes, now or booked for later — with no subscription. You always see the price before a session starts, and pay only for the minutes you use.</p>

      <section className="mb-8 rounded-3xl border border-slate-200 p-6">
        <h2 className="mb-2 text-2xl font-black">🇬🇧 🇪🇺 UK — one price list, in pounds</h2>
        <p className="mb-4 leading-7 text-slate-600">Each listener sets their own rate per minute. You pay <strong>rate × minutes + {formatGBP(PLATFORM_FEE)}</strong> per paid session{VOICE_PRICING_ENABLED ? <>, and voice calls are <strong>{formatRate(VOICE_RATE_PREMIUM)} more</strong> than text chat</> : null}. Example with a {formatRate(EXAMPLE_RATE)} listener:</p>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr><th className={cell}>Length</th><th className={cell}>💬 Text chat</th>{VOICE_PRICING_ENABLED && <th className={cell}>📞 Voice call</th>}</tr></thead>
          <tbody>
            {SESSION_DURATIONS.map(m => <tr key={m}><td className={cell}>{m} min</td><td className={cell}>{formatGBP(example(m))}</td>{VOICE_PRICING_ENABLED && <td className={cell}>{formatGBP(example(m, true))}</td>}</tr>)}
          </tbody></table></div>
      </section>

      <section className="mb-8 rounded-3xl border border-slate-200 p-6">
        <h2 className="mb-2 text-2xl font-black">Comparing listening services? The facts</h2>
        <p className="mb-4 leading-7 text-slate-600">If you are choosing between apps where someone just listens, these are the things worth checking — here is exactly how How Was Your Day works.</p>
        <div className="overflow-x-auto"><table className="w-full text-sm"><tbody>
          {LISTENING_FACTS.map(([k, v]) => <tr key={k}><th className={cell + ' w-1/3 font-extrabold'}>{k}</th><td className={cell}>{v}</td></tr>)}
        </tbody></table></div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-black">Questions about cost</h2>
        {faqs.map(([q, a]) => <div key={q} className="mb-5"><h3 className="mb-1 text-lg font-extrabold">{q}</h3><p className="leading-7 text-slate-600">{a}</p></div>)}
      </section>

      <section className="rounded-3xl bg-[#3B2F2A] p-7 text-white"><h2 className="mb-2 text-2xl font-black">Start with {SESSION_DURATIONS[0]} minutes</h2><p className="mb-5 text-white/80">Pick a listener whose experience matches yours. Text or voice, private, no appointment.</p><a href="/browse" className="inline-block rounded-full bg-[#E8743B] px-6 py-3 font-extrabold text-white">Browse listeners →</a></section>
      <p className="mt-8 text-xs leading-6 text-slate-500">How Was Your Day provides peer support, not therapy, counselling, diagnosis or emergency care. If you are thinking about harming yourself, call Samaritans (116 123) or text SHOUT to 85258, free and 24/7. In an emergency call 999 or 112.</p>
    </div>
  </main>
}
