import type { Metadata } from 'next'
import { formatGBP } from '@/lib/money'
import { DEFAULT_LISTENER_RATE, PLATFORM_FEE, SESSION_DURATIONS } from '@/lib/constants'

const P1 = formatGBP(DEFAULT_LISTENER_RATE * SESSION_DURATIONS[0] + PLATFORM_FEE)

export const metadata: Metadata = {
  title: 'About How Was Your Day — Peer Support From Real People in the UK',
  description: 'Why How Was Your Day exists: a short, affordable conversation with a real person who listens. Screened UK peer listeners, by text or voice. Not therapy.',
  alternates: { canonical: 'https://www.howwasyourday.live/about' },
  openGraph: { title: 'About How Was Your Day', description: 'A short, affordable conversation with a real person who listens — by text or voice, across the UK.', url: 'https://www.howwasyourday.live/about', siteName: 'How Was Your Day', type: 'website' },
}

const card = 'rounded-3xl border border-[#F2DFD1] bg-white p-6'
const body = 'leading-7 text-[#6E5B50]'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-[#3B2F2A]">
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <nav className="mb-12 flex items-center justify-between">
          <a href="/"><img src="/brand/logo.png" alt="How Was Your Day" className="h-11 w-auto" /></a>
          <a href="/talk?src=about" className="rounded-full bg-[#B85520] px-5 py-2.5 text-sm font-extrabold text-white">Talk now</a>
        </nav>

        <header className="max-w-3xl">
          <p className="mb-4 text-sm font-extrabold uppercase tracking-widest text-[#B85520]">About us</p>
          <h1 className="mb-6 text-4xl font-black leading-tight sm:text-6xl">Everyone deserves someone who asks <span className="text-[#E8743B]">how your day was</span> — and listens.</h1>
          <p className={`text-lg ${body}`}>
            How Was Your Day is a UK peer support service. You talk one to one, by text or voice, with a real person who has
            been through things too. No waiting list, no diagnosis, no chatbot — just a human conversation, starting from 8 minutes.
          </p>
        </header>

        <section className="mt-12 grid gap-5 md:grid-cols-3">
          <article className={card}><h2 className="mb-3 text-xl font-black">Human, not AI</h2><p className={body}>Every listener is a real adult in the UK. AI has its uses; this is for when you want a person on the other end.</p></article>
          <article className={card}><h2 className="mb-3 text-xl font-black">Short and affordable</h2><p className={body}>8 minutes is often enough to feel lighter — {P1} at the standard rate, with 16 and 32 minutes when you need more.</p></article>
          <article className={card}><h2 className="mb-3 text-xl font-black">Peer, not clinical</h2><p className={body}>Listeners are screened peers with lived experience, not therapists. We&apos;re clear about that, always.</p></article>
        </section>

        <section className="mt-8 rounded-3xl bg-[#FFF6EF] p-7 sm:p-9">
          <h2 className="mb-4 text-2xl font-black">Why we exist</h2>
          <p className={body}>
            Plenty of us have friends and family and still have days we can&apos;t quite say out loud to them — because we don&apos;t want to
            worry them, because it&apos;s complicated, or because it&apos;s late and everyone&apos;s asleep. Professional support matters, but not
            every hard day needs an appointment. Sometimes you just need someone to hear the whole story.
          </p>
          <p className={`mt-4 ${body}`}>
            How Was Your Day makes that easy: pick text or voice, choose how long, and talk now or at a time you book. Listeners set their
            own price, you see it before you start, and there&apos;s no subscription.
          </p>
        </section>

        <section className="mt-8 rounded-3xl border border-[#F2DFD1] p-7 sm:p-9">
          <h2 className="mb-4 text-2xl font-black">How we keep it safe</h2>
          <ul className={`list-disc space-y-2 pl-5 ${body}`}>
            <li>Every listener passes an identity selfie check, a screening quiz and a review by our team.</li>
            <li>Listeners see only the first name you choose. Voice calls are not recorded.</li>
            <li>You can end a session, block or report anyone at any time.</li>
            <li>We are not an emergency service: in danger, call 999; Samaritans are free on 116 123; or text SHOUT to 85258.</li>
          </ul>
          <a href="/safeguarding" className="mt-5 inline-block font-extrabold text-[#B85520]">Read our safeguarding approach →</a>
        </section>

        <section className="mt-8 rounded-3xl bg-[#E8743B] p-7 text-center text-white sm:p-9">
          <h2 className="mb-3 text-2xl font-black">So… how was your day?</h2>
          <p className="mb-6 font-semibold">Tell someone who&apos;s listening. 8 minutes is enough.</p>
          <a href="/talk?src=about" className="inline-flex rounded-full bg-white px-7 py-3.5 font-extrabold text-[#9E4719]">Talk to someone now</a>
        </section>

        <p className="mt-10 text-xs leading-6 text-[#6E5B50]">
          Want to help others? <a href="/become-a-peer-supporter" className="font-bold text-[#B85520]">Become a peer supporter</a>.
          Questions? <a href="/contact" className="font-bold text-[#B85520]">Contact us</a>.
        </p>
      </div>
    </main>
  )
}
