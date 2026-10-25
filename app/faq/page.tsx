import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How Was Your Day FAQ: Pricing, First Session & Peer Support | UK',
  description: 'How the app works, what a session costs, booking a time, privacy and safety. Compare peer support with therapy and see prices before starting.',
  alternates: { canonical: 'https://www.howwasyourday.live/faq', languages: { 'en-GB': 'https://www.howwasyourday.live/faq' } },
  keywords: [
    'lean on app FAQ', 'howwasyourday FAQ', 'what is howwasyourday', 'lean on meaning', 'lean on someone',
    'peer support UK FAQ', 'How Was Your Day how it works', 'howwasyourday pricing', 'howwasyourday privacy',
  ],
}

const faqs = [
  {
    category: 'About How Was Your Day',
    items: [
      {
        q: 'Who can use How Was Your Day?',
        a: 'Adults aged 18 and over, in the UK. How Was Your Day is not for under-18s. If you are under 18 and need to talk, please reach out to a trusted adult, or text SHOUT to 85258 (free).',
      },
      {
        q: 'What is How Was Your Day?',
        a: 'How Was Your Day is an online peer-support platform where people can browse screened human listeners for one-to-one text or voice conversations about everyday challenges such as loneliness, work stress, relationship difficulties, grief and overthinking. It is not therapy or a crisis service. A conversation can start when a listener is available; availability varies.',
      },
      {
        q: 'What does "lean on" mean?',
        a: '"Lean on" means having someone you can emotionally rely on — someone in your corner who listens without judgment and supports you through hard times. The phrase comes from the idea of physically leaning on someone for support. How Was Your Day (the app) is built on that idea: everyone deserves someone to lean on.',
      },
      {
        q: 'How is How Was Your Day different from therapy or counselling?',
        a: 'Listeners on How Was Your Day are not licensed therapists or clinical counsellors. They are real people with lived experience — people who have navigated the same challenges and found their way through. Peer support is different from therapy, and valuable in its own right: it offers empathy, understanding, and connection. How Was Your Day is ideal when you need someone who truly gets it, not a clinical diagnosis.',
      },
      {
        q: 'Is How Was Your Day available across the UK?',
        a: 'How Was Your Day is online, so people can browse from anywhere in the UK. Whether a conversation can start immediately depends on which listeners are online and available.',
      },
      {
        q: 'What topics can I talk about?',
        a: 'Listeners on How Was Your Day specialise in loneliness, work stress, career confusion, relationships, grief and loss, student pressure, startup journey, breakups, anxiety, and general emotional support. If you just need someone to lean on with no specific topic, that\'s perfectly fine too.',
      },
      {
        q: 'How is How Was Your Day different from companionship apps like GetCompanion?',
        a: 'How Was Your Day is built around peer support: one-to-one conversations with screened listeners who bring relevant lived experience. It is not therapy or a clinical service. Every session is paid, from 8 minutes; paid session prices are shown before you start. See the pricing page for the current India and international rates.',
      },
    ],
  },
  {
    category: 'Getting Started',
    items: [
      {
        q: 'How do I start using How Was Your Day?',
        a: 'The quickest way is Talk now at howwasyourday.live/talk: choose text or voice, tap what is on your mind, confirm your phone number with a one-time code, and How Was Your Day connects you with a screened listener who is online. Every session is paid, from 8 minutes. You can also browse listener profiles at howwasyourday.live/browse and choose someone yourself.',
      },
      {
        q: 'Is there a How Was Your Day app on the Play Store or App Store?',
        a: 'You do not need to download anything: How Was Your Day works in any phone or computer browser at www.howwasyourday.live. On Android, open it in Chrome and tap "Add to Home screen" to get an app icon; on iPhone, use Safari\'s Share → "Add to Home Screen".',
      },
      {
        q: 'How does pricing work?',
        a: 'Every session is paid, from 8 minutes. Paid sessions are priced in pounds sterling at the listener’s rate per minute × session length, plus a flat £1 platform fee; for example, 8 minutes with a 40p/min listener costs £4.20. Voice calls cost 10p/min more than text. Your exact price is shown before you start. See /pricing for details.',
      },
      {
        q: 'Do I need to book in advance?',
        a: 'You do not need to book an appointment in advance. Browse listeners who are shown as available and send a session request; the conversation starts when the listener accepts. Availability changes, so an immediate start cannot be guaranteed.',
      },
      {
        q: 'Can I browse listeners before signing up?',
        a: 'Yes — you can browse listener profiles and read their bios, topics, and ratings before creating an account.',
      },
    ],
  },
  {
    category: 'Pricing & Wallet',
    items: [
      {
        q: 'How much does How Was Your Day cost?',
        a: 'Every session is paid, from 8 minutes. After that, the total is the selected listener\'s per-minute rate × session length, plus a flat £1 platform fee; for example, 8 minutes at 40p/min costs £4.20 and 16 minutes costs £7.40. Voice calls are 10p/min more than text. Prices are in pounds sterling (GBP). See howwasyourday.live/pricing for details.',
      },
      {
        q: 'How does the wallet work?',
        a: 'You top up your How Was Your Day wallet by card with £5, £10, £20 or £50 (or a custom amount). The session amount is held from your wallet when you start a session and released to the listener when it ends. Unused balance is fully refundable at any time.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Yes — unused wallet balance is fully refundable, no questions asked. Submit a refund request from your wallet page and we will process it within 3–5 business days.',
      },
      {
        q: 'Are there any subscriptions?',
        a: 'No subscriptions. Pay only for what you use. Recharge your wallet whenever you want and use it at your own pace.',
      },
    ],
  },
  {
    category: 'Privacy & Safety',
    items: [
      {
        q: 'Are my conversations private?',
        a: 'How Was Your Day uses your phone number for OTP sign-in, but it is not shown to listeners; you can use a display name. Voice calls are not recorded. Text messages are stored securely and only authorised How Was Your Day administrators can open them, for example to review a reported or safety-flagged session. Read the Privacy Policy for details, and avoid sharing identifying information you do not want to disclose.',
      },
      {
        q: 'Is How Was Your Day safe?',
        a: 'Crisis helplines are shown in every session; if words linked to self-harm appear in a chat, How Was Your Day shows them prominently, alerts the listener and flags the session for the How Was Your Day team. You can report a listener from any session, and every report is reviewed by a person. All listeners are screened and approved by How Was Your Day before they can take sessions.',
      },
      {
        q: 'What if I\'m in a mental health crisis?',
        a: 'How Was Your Day is peer support, not a crisis service. If you are in crisis or having thoughts of self-harm, please call Samaritans at <a href="tel:116123">116 123</a> or text SHOUT to 85258 (free, 24/7).',
      },
    ],
  },
  {
    category: 'Listening on How Was Your Day',
    items: [
      {
        q: 'Is How Was Your Day a job or a way to earn money?',
        a: 'No. How Was Your Day is a peer support service for people who need someone to talk to. It is not a job, a side income or a work-from-home opportunity, and it should not be joined for the money.',
      },
      {
        q: 'Who are the listeners?',
        a: 'Adults (18+) with lived experience of what they talk about, who want to support others. Every listener applies, passes a screening quiz on boundaries, crisis referral and empathetic listening, completes a live selfie check and is reviewed by How Was Your Day before taking any session. They are peers, not therapists.',
      },
    ],
  },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.flatMap(cat =>
    cat.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;color:#0F4867;background:radial-gradient(ellipse 90% 55% at 0% 0%,#C2E4F2 0%,#DAEEF8 22%,#FFFFFF 58%) fixed;}
  a{text-decoration:none;color:inherit;}
  .nav{background:transparent;padding:0 24px;height:72px;display:flex;align-items:center;justify-content:space-between;max-width:900px;margin:0 auto;}
  .nav-logo{height:52px;width:auto;}
  .wrap{max-width:800px;margin:0 auto;padding:32px 24px 80px;}
  .breadcrumb{font-size:13px;color:#5A7A8A;margin-bottom:24px;}
  .breadcrumb a{color:#1A8FA0;font-weight:600;}
  .breadcrumb span{margin:0 6px;opacity:0.5;}
  h1{font-size:clamp(26px,5vw,40px);font-weight:900;color:#0F4867;line-height:1.15;margin-bottom:10px;}
  .subtitle{font-size:16px;color:#5A7A8A;margin-bottom:40px;line-height:1.6;}
  .cat{margin-bottom:40px;}
  .cat-title{font-size:13px;font-weight:800;color:#1A8FA0;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #D5EEF6;}
  .faq-item{background:#FFFFFF;border:1.5px solid #D5EEF6;border-radius:16px;margin-bottom:10px;overflow:hidden;}
  .faq-q{font-size:16px;font-weight:800;color:#0F4867;padding:18px 20px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .faq-q::after{content:'+';font-size:22px;font-weight:400;color:#1A8FA0;flex-shrink:0;}
  .faq-a{font-size:15px;color:#5A7A8A;line-height:1.72;padding:0 20px 18px;font-weight:500;}
  .cta-box{background:linear-gradient(135deg,#0F4867 0%,#1A8FA0 100%);border-radius:20px;padding:36px 28px;text-align:center;color:white;margin-top:48px;}
  .cta-box h2{font-size:22px;font-weight:900;margin-bottom:10px;}
  .cta-box p{font-size:15px;opacity:0.85;margin-bottom:24px;line-height:1.6;}
  .btn-cta{background:#FF9933;color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:16px;padding:14px 32px;border-radius:50px;border:none;cursor:pointer;display:inline-block;}
`

export default function FAQPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <style>{S}</style>
      <nav className="nav">
        <a href="/"><img src="/logo.png" alt="How Was Your Day" className="nav-logo" /></a>
        <a href="/talk?src=seo" style={{background:'#FF9933',color:'white',fontFamily:'Nunito,sans-serif',fontWeight:800,fontSize:14,padding:'10px 22px',borderRadius:50,border:'none',cursor:'pointer'}}>Get started</a>
      </nav>

      <div className="wrap">
        <div className="breadcrumb">
          <a href="/">Home</a><span>›</span><span>FAQ</span>
        </div>

        <h1>Frequently Asked Questions</h1>
        <p className="subtitle">Everything you need to know about How Was Your Day — someone to lean on, anytime.</p>

        {faqs.map((cat) => (
          <div key={cat.category} className="cat">
            <div className="cat-title">{cat.category}</div>
            {cat.items.map((item) => (
              <div key={item.q} className="faq-item">
                <div className="faq-q">{item.q}</div>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        ))}

        <div className="cta-box">
          <h2>Still have questions?</h2>
          <p>We&apos;re here to help. Start a session or reach out to us directly.</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/talk?src=seo"><button className="btn-cta">Start now</button></a>
            <a href="/contact" style={{color:'white',fontWeight:700,fontSize:15,padding:'14px 24px',display:'inline-block',opacity:0.85}}>Contact us →</a>
          </div>
        </div>
      </div>
    </>
  )
}
