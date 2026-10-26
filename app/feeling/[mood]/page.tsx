import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FEELINGS, getFeeling } from '@/lib/feelings-data'

export const dynamic = 'force-static'

// ── Mood pages: How Was Your Day's structural answer to the daily-horoscope SEO engine ──
//
// AstroTalk's organic moat is 12 zodiac-sign pages people return to daily.
// How Was Your Day cannot (and should not) do horoscopes — but the same MECHANIC works
// honestly here: a person in distress types their FEELING into Google
// ("why do I feel numb", "feeling overwhelmed today", "can't sleep anxious").
// Each feeling gets its own indexable, genuinely useful page that ends in a
// real conversation. Same repeatable-entry-point structure, real utility, no
// pseudoscience.
//
// Statically generated at build time (one page per feeling), so these are as
// fast and as crawlable as any hand-written landing page.

export function generateStaticParams() {
  return FEELINGS.map(f => ({ mood: f.slug }))
}

export async function generateMetadata({ params }: { params: { mood: string } }): Promise<Metadata> {
  const f = getFeeling(params.mood)
  if (!f) return {}
  const url = `https://www.howwasyourday.live/feeling/${f.slug}`
  return {
    title: f.metaTitle,
    description: f.metaDescription,
    keywords: f.keywords,
    alternates: { canonical: url, languages: { 'en-GB': url } },
    openGraph: {
      title: f.metaTitle,
      description: f.metaDescription,
      url,
      siteName: 'How Was Your Day',
      type: 'article',
    },
  }
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--teal:#B85520;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--light:#FFF6EF;}
  body{font-family:Nunito,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;
    background:radial-gradient(ellipse 90% 55% at 0% 0%,#FDE6D6 0%,#FFF1E6 22%,#FFFFFF 58%) fixed;}
  a{text-decoration:none;color:inherit;}
  .nav{padding:0 28px;height:72px;display:flex;align-items:center;justify-content:space-between;max-width:900px;margin:0 auto;}
  .nav-logo{height:56px;width:auto;}
  .btn-nav{background:var(--teal);color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;padding:10px 22px;border-radius:50px;border:none;cursor:pointer;}
  .page{max-width:780px;margin:0 auto;padding:16px 24px 100px;}
  .breadcrumb{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600;color:var(--gray);margin-bottom:32px;flex-wrap:wrap;}
  .breadcrumb span{color:var(--border);}
  .hero{margin-bottom:40px;}
  .tag{font-size:12px;font-weight:800;color:var(--teal);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;}
  h1{font-size:clamp(28px,6vw,44px);font-weight:900;color:var(--navy);line-height:1.15;margin-bottom:16px;}
  .hero-emoji{font-size:44px;margin-bottom:10px;}
  .lead{font-size:17px;color:var(--gray);line-height:1.78;font-weight:500;max-width:640px;}
  .section{background:white;border-radius:24px;padding:32px;margin-bottom:24px;border:1.5px solid var(--border);}
  .section h2{font-size:20px;font-weight:800;color:var(--navy);margin-bottom:12px;}
  .section p{font-size:15px;color:#4A3C34;line-height:1.80;margin-bottom:0;}
  .faq-item{border-bottom:1.5px solid var(--border);padding:20px 0;}
  .faq-item:first-of-type{padding-top:0;}
  .faq-item:last-of-type{border-bottom:none;padding-bottom:0;}
  .faq-q{font-size:16px;font-weight:800;color:var(--navy);margin-bottom:10px;}
  .faq-a{font-size:14px;color:var(--gray);line-height:1.75;font-weight:500;}
  .cta-card{background:var(--navy);border-radius:24px;padding:40px 32px;text-align:center;margin-bottom:24px;}
  .cta-card h2{font-size:24px;font-weight:900;color:white;margin-bottom:12px;}
  .cta-card p{font-size:15px;color:rgba(251,227,210,0.85);font-weight:500;margin-bottom:28px;line-height:1.7;}
  .btn-primary{background:var(--orange);color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:15px;padding:14px 28px;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(232,116,59,0.35);}
  .related{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;margin-top:8px;}
  .related-link{background:var(--light);border:1.5px solid var(--border);border-radius:16px;padding:14px 16px;font-size:14px;font-weight:700;color:var(--navy);}
  .mood-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:8px;}
  .mood-chip{background:white;border:1.5px solid var(--border);border-radius:16px;padding:12px 10px;text-align:center;font-size:13px;font-weight:800;color:var(--navy);}
  .disclaimer{background:var(--light);border:1.5px solid var(--border);border-radius:20px;padding:24px;margin-bottom:24px;}
  .disclaimer p{font-size:13px;color:var(--gray);line-height:1.7;font-weight:500;margin-bottom:8px;}
  .disclaimer p:last-child{margin-bottom:0;}
  .disclaimer strong{color:var(--navy);}
`

export default function FeelingPage({ params }: { params: { mood: string } }) {
  const f = getFeeling(params.mood)
  if (!f) notFound()

  const url = `https://www.howwasyourday.live/feeling/${f.slug}`

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: f.faqs.map(q => ({
      '@type': 'Question',
      name: q.q,
      acceptedAnswer: { '@type': 'Answer', text: q.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.howwasyourday.live' },
      { '@type': 'ListItem', position: 2, name: 'Daily check-in', item: 'https://www.howwasyourday.live/daily-check-in' },
      { '@type': 'ListItem', position: 3, name: f.label, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: S }} />

      <nav className="nav">
        <a href="/"><img src="/logo.png" alt="How Was Your Day" className="nav-logo" /></a>
        <a href="/auth"><button className="btn-nav">Open app</button></a>
      </nav>

      <div className="page">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a><span>›</span>
          <a href="/daily-check-in">Daily check-in</a><span>›</span>
          <span style={{ color: 'var(--navy)' }}>{f.label}</span>
        </nav>

        <div style={{ background:'#FFF6EF', borderLeft:'4px solid #B85520', borderRadius:'0 12px 12px 0', padding:'14px 18px', marginBottom:28, fontSize:14, color:'#3B2F2A', fontWeight:600, lineHeight:1.65 }}>
          🆘 In crisis? Call <a href="tel:116123" style={{ color:'#B85520', fontWeight:800 }}>Samaritans 116 123</a> or <a href="sms:85258" style={{ color:'#B85520', fontWeight:800 }}>text SHOUT to 85258</a> (free · 24/7)
        </div>

        <div className="hero">
          <div className="hero-emoji">{f.emoji}</div>
          <p className="tag">Today I feel · {f.label}</p>
          <h1>{f.h1}</h1>
          <p className="lead">{f.lead}</p>
        </div>

        {f.sections.map((s, i) => (
          <div className="section" key={i}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}

        <div className="cta-card">
          <h2>You don&apos;t have to sit with this alone</h2>
          <p>Talk to a verified peer listener who has felt this too. No appointment needed.</p>
          <a href="/browse"><button className="btn-primary">Find someone who gets it →</button></a>
        </div>

        <div className="section">
          <h2>Frequently asked questions</h2>
          {f.faqs.map((q, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-q">{q.q}</div>
              <div className="faq-a">{q.a}</div>
            </div>
          ))}
        </div>

        <div className="section">
          <h2>Feeling something else today?</h2>
          <div className="mood-grid">
            {FEELINGS.filter(x => x.slug !== f.slug).map(x => (
              <a key={x.slug} href={`/feeling/${x.slug}`} className="mood-chip">{x.emoji}<br />{x.label}</a>
            ))}
          </div>
        </div>

        <div className="section">
          <h2>Related support</h2>
          <div className="related">
            {f.relatedSupport.map(p => (
              <a key={p} href={p} className="related-link">
                {p.replace('/support/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            ))}
            <a href="/browse" className="related-link">Browse All Listeners</a>
          </div>
        </div>

        <div className="disclaimer">
          <p><strong>How Was Your Day is peer support, not a crisis service.</strong> If you are in immediate distress or having thoughts of self-harm, please reach out to a professional helpline immediately.</p>
          <p><strong>Samaritans:</strong> <a href="tel:116123">116 123</a> &nbsp;|&nbsp; <strong>Shout:</strong> <a href="sms:85258">85258</a> (free · 24/7)</p>
          <p>How Was Your Day listeners are screened peers, not licensed therapists or medical professionals. For clinical mental health support, please consult a qualified mental health professional.</p>
        </div>
      </div>
    </>
  )
}
