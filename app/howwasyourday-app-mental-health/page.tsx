import type { Metadata } from 'next'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'How Was Your Day App for Mental Health India | Peer Support Platform',
  description: 'How Was Your Day is India\'s peer support app for mental health. Talk to real humans who get it — anxiety, loneliness, burnout, grief. Anonymous. Affordable. No appointment needed.',
  alternates: { canonical: 'https://www.howwasyourday.live/howwasyourday-app-mental-health' },
  keywords: ['howwasyourday app mental health', 'howwasyourday mental health India', 'peer support mental health India', 'mental health app India'],
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'How Was Your Day App for Mental Health India',
  description: 'India\'s peer support platform for mental health — real humans, anonymous, affordable.',
  url: 'https://www.howwasyourday.live/howwasyourday-app-mental-health',
}

const S = `

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--navy:#0F4867;--teal:#1A8FA0;--orange:#FF9933;--gray:#5A7A8A;--border:#D5EEF6;--light:#F0F8FC;}
body{font-family:Nunito,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;
  background:radial-gradient(ellipse 90% 55% at 0% 0%,#C2E4F2 0%,#DAEEF8 22%,#FFFFFF 58%) fixed;}
a{text-decoration:none;color:inherit;}
.page{max-width:640px;margin:0 auto;padding:32px 24px 80px;}
h1{font-size:clamp(26px,5vw,38px);font-weight:900;line-height:1.15;margin-bottom:16px;color:var(--navy);}
h1 span{color:var(--orange);}
.lead{font-size:16px;color:var(--gray);line-height:1.75;font-weight:500;margin-bottom:28px;}
.section{background:white;border:1.5px solid var(--border);border-radius:20px;padding:24px;margin-bottom:18px;}
.section h2{font-size:18px;font-weight:800;margin-bottom:12px;}
.section p{font-size:14px;color:#3A6070;line-height:1.75;margin-bottom:10px;}
.section p:last-child{margin-bottom:0;}
.cta-box{background:var(--navy);border-radius:20px;padding:28px;text-align:center;margin-top:24px;}
.cta-box h2{font-size:18px;font-weight:900;color:white;margin-bottom:10px;}
.cta-box p{font-size:13px;color:rgba(201,231,244,.8);margin-bottom:20px;font-weight:500;}
.btn{background:var(--orange);color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:15px;padding:13px 28px;border-radius:50px;border:none;cursor:pointer;}
.back{font-size:14px;font-weight:700;color:var(--gray);margin-bottom:24px;display:inline-block;}
`

export default function HowWasYourDayAppMentalHealth() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <a href="/" className="back">← How Was Your Day Home</a>
        <h1>How Was Your Day App for <span>Mental Health</span> — India&apos;s Peer Support Platform</h1>
        <p className="lead">
          How Was Your Day is India&apos;s peer support app for mental health — not therapy, not AI, but real humans with lived experience. Sessions from 8 minutes.
        </p>

        <div className="section">
          <h2>What is the How Was Your Day app for mental health?</h2>
          <p>How Was Your Day is a peer emotional support platform that connects people in India with verified peer listeners — real people who have personally navigated loneliness, burnout, anxiety, grief, relationship stress, career confusion, and more.</p>
          <p>It&apos;s not a mental health app in the clinical sense. There are no therapists, no diagnoses, and no prescription pads. How Was Your Day is peer support — a legitimate, evidence-backed form of support that helps people feel less alone during difficult times.</p>
          <p>Research shows that peer support improves mental health outcomes significantly. Having someone who truly understands — because they&apos;ve been there — makes a real difference.</p>
        </div>

        <div className="section">
          <h2>Why How Was Your Day works for mental health in India</h2>
          <p>India faces a severe mental health crisis. 1 in 7 Indians experiences a mental health condition, yet fewer than 1% receive any form of support. The reasons? Stigma, cost, availability, and cultural barriers.</p>
          <p>How Was Your Day addresses all of these. Sign up anonymously with just your phone number. Pay from £4.20 for an 8-minute session — a fraction of therapy costs. Listeners are often online late at night, when mental health struggles are often worst. Accessible in English and 11 Indian languages.</p>
          <p>It&apos;s not a replacement for professional mental health care — and we&apos;re honest about that. But for the millions of Indians who need someone to talk to right now, How Was Your Day fills a gap that nothing else does.</p>
        </div>

        <div className="section">
          <h2>Who uses How Was Your Day?</h2>
          <p>People come to How Was Your Day from all walks of life: students overwhelmed by exam pressure, startup founders going through their first failure, professionals experiencing burnout in high-pressure jobs, people processing grief and loss, individuals struggling with loneliness in new cities, and people who simply need someone to talk to at 2 AM.</p>
          <p>What they all have in common: they want a real human who gets it — not a bot, not a clinical professional, but someone who has been through something similar and found their way through.</p>
        </div>

        <div className="section">
          <h2>Is How Was Your Day safe?</h2>
          <p>Yes. How Was Your Day is designed with privacy and safety at its core. Your identity is protected — a listener sees only the name you choose. Conversations are never shared outside How Was Your Day. If words linked to self-harm appear in a chat, How Was Your Day shows emergency helplines (Samaritans 116 123, text SHOUT to 85258) and flags the session for review. Every listener is manually verified before being approved.</p>
        </div>

        <div className="cta-box">
          <h2>Try How Was Your Day — no appointment needed</h2>
          <p>No credit card. No appointment. A session starts when a listener accepts.</p>
          <a href="/browse"><button className="btn">Browse peer listeners →</button></a>
        </div>
      </div>
    </>
  )
}
