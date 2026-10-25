import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Arranged Marriage Pressure as an NRI | You Don\'t Have to Decide Alone | How Was Your Day',
  description: 'Arranged marriage pressure as an NRI is unique — parents abroad, families in India, a community watching. Talk to a peer listener before you make a life decision under pressure.',
  keywords: ['arranged marriage nri', 'arranged marriage pressure nri', 'arranged marriage abroad', 'nri arranged marriage stress', 'resisting arranged marriage nri', 'arranged marriage usa uk canada'],
  alternates: { canonical: 'https://www.howwasyourday.live/arranged-marriage-nri' },
  openGraph: { title: 'Arranged Marriage Pressure as an NRI | You Don\'t Have to Decide Alone | How Was Your Day', description: 'Arranged marriage pressure as an NRI is unique — parents abroad, families in India, a community watching. Talk to a peer listener before you make a life decision under pressure.', url: 'https://www.howwasyourday.live/arranged-marriage-nri', siteName: 'How Was Your Day', type: 'article', images: [{ url: '/icon-512.png', width: 512, height: 512, alt: 'How Was Your Day' }] },
}

const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [
  { '@type': 'Question', name: 'Is it okay to talk about arranged marriage resistance without being judged?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. How Was Your Day listeners are not moral authorities — they don\'t have a position on arranged marriage. Their role is to hear you, wherever you are. Whether you\'re open to an arranged match but feeling pressured, or resistant to the whole idea but don\'t know how to say it, a listener will meet you where you are.' } },
  { '@type': 'Question', name: 'What if I\'m considering an arranged match but have genuine fears?', acceptedAnswer: { '@type': 'Answer', text: 'Fear before a life decision is completely normal. Talking through your fears with someone who understands the cultural context — without the pressure of family involvement — can help you get clearer about what you actually want.' } },
  { '@type': 'Question', name: 'What if I\'ve already said yes to someone my parents chose and I\'m having doubts?', acceptedAnswer: { '@type': 'Answer', text: 'Pre-wedding doubt is common and rarely talked about. The pressure to continue once the families are involved is enormous. A peer listener can hold that weight with you — not tell you what to do, but help you feel less alone while you figure it out.' } },
  { '@type': 'Question', name: 'Is this confidential from my family?', acceptedAnswer: { '@type': 'Answer', text: 'Completely. Sessions are anonymous — phone number and first name only. Nothing is shared with your family, your prospective match\'s family, or anyone else.' } },
  { '@type': 'Question', name: 'How much does it cost?', acceptedAnswer: { '@type': 'Answer', text: 'Sessions start at 8 minutes. After that, sessions start at US$10 for 15 minutes. No subscription.' } },
] }

const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.howwasyourday.live' },
  { '@type': 'ListItem', position: 2, name: 'NRI Support', item: 'https://www.howwasyourday.live/indian-emotional-support-abroad' },
  { '@type': 'ListItem', position: 3, name: 'Arranged Marriage NRI', item: 'https://www.howwasyourday.live/arranged-marriage-nri' },
] }

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#0F4867;--teal:#1A8FA0;--orange:#FF9933;--gray:#5A7A8A;--border:#D5EEF6;--light:#F0F8FC;}
  body{font-family:'Nunito',sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;
    background:radial-gradient(ellipse 90% 55% at 0% 0%,#C2E4F2 0%,#DAEEF8 22%,#FFFFFF 58%) fixed;}
  a{text-decoration:none;color:inherit;}
  .nav{padding:0 28px;height:72px;display:flex;align-items:center;justify-content:space-between;max-width:900px;margin:0 auto;}
  .nav-logo{height:56px;width:auto;}
  .btn-nav{background:var(--teal);color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;padding:10px 22px;border-radius:50px;border:none;cursor:pointer;}
  .page{max-width:780px;margin:0 auto;padding:16px 24px 100px;}
  .breadcrumb{display:flex;gap:6px;align-items:center;font-size:13px;font-weight:600;color:var(--gray);margin-bottom:32px;flex-wrap:wrap;}
  .breadcrumb span{color:var(--border);}
  .hero{margin-bottom:48px;}
  .badge{display:inline-block;background:var(--light);border:1.5px solid var(--border);color:var(--teal);font-size:12px;font-weight:800;padding:6px 14px;border-radius:50px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:16px;}
  h1{font-size:clamp(28px,6vw,44px);font-weight:900;color:var(--navy);line-height:1.15;margin-bottom:16px;}
  h1 em{color:var(--orange);font-style:normal;}
  .lead{font-size:17px;color:var(--gray);line-height:1.78;font-weight:500;max-width:640px;margin-bottom:28px;}
  .cta-hero{display:inline-block;background:var(--orange);color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:16px;padding:14px 32px;border-radius:50px;box-shadow:0 4px 20px rgba(255,153,51,0.35);}
  .section{background:white;border-radius:24px;padding:32px;margin-bottom:24px;border:1.5px solid var(--border);}
  .section h2{font-size:22px;font-weight:800;color:var(--navy);margin-bottom:16px;}
  .section p{font-size:15px;color:#3A6070;line-height:1.80;margin-bottom:14px;}
  .section p:last-child{margin-bottom:0;}
  .faq-item{border-bottom:1.5px solid var(--border);padding:20px 0;}
  .faq-item:first-of-type{padding-top:0;}
  .faq-item:last-of-type{border-bottom:none;padding-bottom:0;}
  .faq-q{font-size:16px;font-weight:800;color:var(--navy);margin-bottom:10px;}
  .faq-a{font-size:14px;color:var(--gray);line-height:1.75;font-weight:500;}
  .cta-card{background:var(--navy);border-radius:24px;padding:40px 32px;text-align:center;margin-bottom:24px;}
  .cta-card h2{font-size:24px;font-weight:900;color:white;margin-bottom:12px;}
  .cta-card p{font-size:15px;color:rgba(201,231,244,0.85);font-weight:500;margin-bottom:28px;line-height:1.7;}
  .btn-cta{display:inline-block;background:var(--orange);color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:15px;padding:14px 28px;border-radius:50px;box-shadow:0 4px 20px rgba(255,153,51,0.35);}
  .related{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;}
  .related a{background:var(--light);border:1.5px solid var(--border);border-radius:16px;padding:14px 16px;font-size:14px;font-weight:700;color:var(--navy);display:block;}
  .related a:hover{border-color:var(--teal);color:var(--teal);}
  .crisis{background:var(--light);border:1.5px solid var(--border);border-radius:16px;padding:20px 24px;font-size:13px;color:var(--gray);line-height:1.7;text-align:center;}
  .crisis strong{color:var(--navy);}
`

export default function ArrangedMarriageNriPage() {
  const faqs = faqSchema.mainEntity
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <style>{S}</style>
      <nav className="nav"><a href="/"><img src="/logo.png" alt="How Was Your Day" className="nav-logo" /></a><a href="/browse"><button className="btn-nav">Find a listener</button></a></nav>
      <div className="page">
        <nav className="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>&#x203A;</span><a href="/indian-emotional-support-abroad">NRI Support</a><span>&#x203A;</span><span style={{ color: 'var(--navy)' }}>Arranged Marriage NRI</span></nav>
        <div className="hero">
          <p className="badge">Arranged Marriage &middot; NRI Pressure &middot; Desi Abroad</p>
          <h1>Everyone has an opinion. <em>No one is asking how you actually feel.</em></h1>
          <p className="lead">Your parents have a shortlist. Your family WhatsApp group has opinions. The community is watching. And somewhere in the middle of all of it, no one is asking how you actually feel. Arranged marriage as an NRI carries its own version of the pressure — the parents abroad who worry you&rsquo;ll &ldquo;go Western,&rdquo; the family in India who want you settled, the clock everyone hears except you. Talk to someone first. Sessions from 8 minutes.</p>
          <a href="/browse" className="cta-hero">Talk to someone now &rarr;</a>
        </div>

        <div className="section">
          <h2>The NRI Arranged Marriage Pressure: A Different Kind</h2>
          <p>Arranged marriage pressure on NRIs has a particular character. In India, the pressure exists within a world where everyone around you is navigating the same thing — your friends are also dealing with rishtas, your colleagues are also having the family conversations. You can complain, compare notes, laugh about it together.</p>
          <p>Abroad, it is different. The rishta pressure comes from family back in India, who worry that time is running out and that you are drifting away from your culture and values. It comes from the diaspora community around you, which has its own dense social surveillance. And it arrives into a world — your American, British, or Canadian life — where none of your non-Indian friends understand what a rishta even is, and where your Indian friends are also carrying the same pressure but rarely talking about it openly.</p>
          <p>The result is a very specific kind of silence. You say yes to the meetings, the WhatsApp exchanges, the visits. You smile. You perform openness. And inside, you have a different set of feelings that there is no safe place to voice. How Was Your Day gives you that place. Sessions from 8 minutes.</p>
        </div>

        <div className="section">
          <h2>Before You Make a Life Decision Under Pressure</h2>
          <p>Arranged marriages happen under time pressure, social pressure, and emotional pressure. The combination makes it genuinely difficult to know what you actually want. The fear of disappointing your parents. The guilt about your own desires. The pressure of the community watching. The sense that everyone else has figured this out and you are the only one struggling.</p>
          <p>Talking to a real Indian peer listener — who has heard many of these stories and genuinely understands the cultural forces at play — before you make a decision can create space. Not to give you the answer, but to help you hear yourself. Sessions are anonymous and completely private. Sessions from 8 minutes.</p>
        </div>

        <div className="section"><h2>Frequently Asked Questions</h2>{faqs.map((f, i) => (<div className="faq-item" key={i}><p className="faq-q">{f.name}</p><p className="faq-a">{f.acceptedAnswer.text}</p></div>))}</div>
        <div className="cta-card"><h2>Hear yourself before the pressure decides for you.</h2><p>Real Indian peer listener. Understands arranged marriage pressure on NRIs. Sessions from 8 minutes. From US$10.</p><a href="/browse" className="btn-cta">Find a listener &rarr;</a></div>
        <div className="section"><h2>You Might Also Find This Helpful</h2><div className="related">
          <a href="/nri-marriage-usa">NRI marriage USA &rarr;</a>
          <a href="/nri-relationship-problems">NRI relationship problems &rarr;</a>
          <a href="/indian-emotional-support-abroad">NRI support &rarr;</a>
          <a href="/nri-dating-usa">NRI dating USA &rarr;</a>
        </div></div>
        <div className="crisis"><strong>In a crisis?</strong> Samaritans 116 123 &nbsp;&middot;&nbsp; text SHOUT to 85258 &nbsp;&middot;&nbsp; Both free, 24/7.</div>
      </div>
    </>
  )
}
