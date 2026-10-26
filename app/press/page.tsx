import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'About How Was Your Day | Peer Support & Human Connection Platform',
  description: 'Learn what How Was Your Day is, how peer support works, who How Was Your Day is for, and how to contact the team for media or partnership enquiries.',
  alternates: { canonical: 'https://www.howwasyourday.live/press' },
  openGraph: {
    title: 'About How Was Your Day | Peer Support & Human Connection Platform',
    description: 'Factual information about How Was Your Day, its peer-support model, privacy approach and human-conversation service.',
    url: 'https://www.howwasyourday.live/press',
    siteName: 'How Was Your Day',
    type: 'website',
  },
}

const pageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.howwasyourday.live/press#webpage',
  name: 'About How Was Your Day',
  url: 'https://www.howwasyourday.live/press',
  description: metadata.description,
  isPartOf: { '@id': 'https://www.howwasyourday.live/#website' },
  about: { '@id': 'https://www.howwasyourday.live/#organization' },
}

const S = `

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--navy:#0F4867;--teal:#1A8FA0;--orange:#FF9933;--gray:#5A7A8A;--border:#D5EEF6;--light:#F0F8FC;}
body{font-family:Nunito,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;background:radial-gradient(ellipse 90% 55% at 0% 0%,#C2E4F2 0%,#DAEEF8 22%,#FFFFFF 58%) fixed;}
a{text-decoration:none;color:inherit;}
nav{padding:0 28px;height:72px;display:flex;align-items:center;justify-content:space-between;max-width:760px;margin:0 auto;}
.nav-logo{height:56px;}
.btn-nav{background:var(--teal);color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:14px;padding:10px 22px;border-radius:50px;border:none;cursor:pointer;}
.page{max-width:760px;margin:0 auto;padding:16px 24px 100px;}
.back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--gray);margin-bottom:32px;}
.hero{margin-bottom:34px;}
.tag{font-size:12px;font-weight:800;color:var(--teal);text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px;}
h1{font-size:clamp(28px,5vw,42px);font-weight:900;line-height:1.15;margin-bottom:14px;}
.lead{font-size:17px;color:var(--gray);line-height:1.75;font-weight:500;max-width:680px;}
.section{background:white;border:1.5px solid var(--border);border-radius:22px;padding:26px;margin-bottom:20px;}
.section h2{font-size:20px;font-weight:800;margin-bottom:14px;}
.section p,.section li{font-size:14px;color:#3A6070;line-height:1.75;}
.section p{margin-bottom:10px;}
.section ul{padding-left:20px;}
.section li{margin-bottom:5px;}
.fact-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
.fact{background:var(--light);border:1.5px solid var(--border);border-radius:16px;padding:17px;}
.fact strong{display:block;font-size:14px;color:var(--navy);margin-bottom:5px;}
.fact span{font-size:13px;color:var(--gray);line-height:1.55;}
.cta{background:var(--navy);border-radius:22px;padding:32px;text-align:center;margin-top:24px;}
.cta h2{font-size:21px;font-weight:900;color:white;margin-bottom:10px;}
.cta p{font-size:14px;color:rgba(201,231,244,.85);margin-bottom:22px;line-height:1.65;}
.btn{display:inline-block;background:var(--orange);color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:15px;padding:13px 28px;border-radius:50px;}
@media(max-width:560px){.fact-grid{grid-template-columns:1fr;}}
`

export default function PressPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <nav>
        <a href="/"><img src="/logo.png" alt="How Was Your Day" className="nav-logo" /></a>
        <a href="/browse"><button className="btn-nav">Find a listener</button></a>
      </nav>

      <main className="page">
        <a href="/" className="back">← Back to How Was Your Day</a>

        <header className="hero">
          <p className="tag">About · Media · Partnerships</p>
          <h1>What is How Was Your Day?</h1>
          <p className="lead">How Was Your Day is an India-origin peer-support platform connecting people with real human listeners for private one-to-one conversations by text or voice. It is designed for everyday emotional support and human connection — not therapy or clinical treatment.</p>
        </header>

        <section className="section">
          <h2>How Was Your Day in one sentence</h2>
          <p>When someone wants another human being to listen, How Was Your Day lets them browse peer listeners, choose a relevant profile and start a conversation without an appointment.</p>
        </section>

        <section className="section">
          <h2>What How Was Your Day provides</h2>
          <div className="fact-grid">
            <div className="fact"><strong>Human conversation</strong><span>Sessions are with real peer listeners, not AI-generated characters or chatbots.</span></div>
            <div className="fact"><strong>Peer support</strong><span>Listeners support conversations from lived experience. They do not diagnose or provide clinical treatment.</span></div>
            <div className="fact"><strong>Text or voice</strong><span>People can choose the conversation format that suits them.</span></div>
            <div className="fact"><strong>Transaction-based</strong><span>Seekers can try an introductory session and continue with paid conversation time if they choose.</span></div>
          </div>
        </section>

        <section className="section">
          <h2>Who uses How Was Your Day?</h2>
          <p>How Was Your Day is intended for people who want a private human conversation around everyday experiences such as loneliness, relationship difficulties, family pressure, work stress, homesickness, grief, overthinking or simply having a difficult day.</p>
          <p>It is not a replacement for professional mental-health care. People seeking diagnosis, treatment or other clinical care should speak with an appropriately qualified professional.</p>
        </section>

        <section className="section">
          <h2>How the service works</h2>
          <ul>
            <li>Browse available peer listeners and read their profiles.</li>
            <li>Choose someone whose lived experience or conversation topics feel relevant.</li>
            <li>Start with the introductory session where eligible.</li>
            <li>Continue with paid conversation time only if you want to.</li>
            <li>Use text or voice according to the options available for the listener and session.</li>
          </ul>
        </section>

        <section className="section">
          <h2>Privacy and safety</h2>
          <p>How Was Your Day provides privacy controls, listener verification, reporting and blocking tools, and safety escalation mechanisms. See the <a href="/trust" style={{color:'var(--teal)',fontWeight:800}}>Trust &amp; Safety page</a> for the current product approach and the <a href="/privacy" style={{color:'var(--teal)',fontWeight:800}}>Privacy Policy</a> for data-handling details.</p>
        </section>

        <section className="section">
          <h2>Media and partnership enquiries</h2>
          <p>For factual product information, interviews, media enquiries or partnership discussions, contact <a href="mailto:contact@howwasyourday.live" style={{color:'var(--teal)',fontWeight:800}}>contact@howwasyourday.live</a>.</p>
          <p>For the most current description of the service, please use the live product pages rather than relying on historical usage figures or promotional claims.</p>
        </section>

        <section className="cta">
          <h2>Looking for someone to talk to?</h2>
          <p>Browse peer listeners and see who is available. How Was Your Day is for human conversation, not clinical treatment.</p>
          <a href="/browse" className="btn">Browse peer listeners →</a>
        </section>
      </main>
    </>
  )
}
