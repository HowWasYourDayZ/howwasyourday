import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal'
import { LISTENER_SERVICE_FEE_RATE } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Terms of Use — How Was Your Day',
  description: 'How Was Your Day terms of use. Read our terms governing use of the peer support platform, sessions, wallet, payments, and listener services.',
  alternates: { canonical: 'https://www.howwasyourday.live/terms' },
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--cream:#FFFAF6;}
  body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--navy);-webkit-font-smoothing:antialiased;}
  a{color:var(--orange);}
  .page{max-width:640px;margin:0 auto;padding:24px 20px 80px;}
  .back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--gray);margin-bottom:28px;text-decoration:none;}
  h1{font-size:28px;font-weight:900;color:var(--navy);margin-bottom:8px;}
  .updated{font-size:13px;color:var(--gray);font-weight:500;margin-bottom:32px;}
  h2{font-size:17px;font-weight:800;color:var(--navy);margin:28px 0 10px;}
  p{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:10px;}
  ul{padding-left:20px;margin-bottom:10px;}
  li{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:4px;}
  .warning-box{background:#FFF0F0;border:1.5px solid #FFCDD2;border-radius:16px;padding:16px 18px;margin:24px 0;}
  .warning-box p{margin:0;font-size:13px;color:#7A2020;font-weight:700;line-height:1.6;}
`

export default function TermsPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <a href="/" className="back">← Back to How Was Your Day</a>
        <h1>Terms of Use</h1>
        <p className="updated">Last updated: {LEGAL.lastUpdated}</p>

        <div className="warning-box">
          <p>⚠️ How Was Your Day is a peer support platform only. It is NOT a mental health service, therapy platform, or medical service. Listeners are not licensed therapists, psychologists, or counselors unless an individual profile explicitly states a relevant qualification. If you are in crisis or immediate danger, call 999 or 112, Samaritans on 116 123, or text SHOUT to 85258.</p>
        </div>

        <h2>1. What How Was Your Day is</h2>
        <p>These terms are an agreement between you and {LEGAL.entityName} (company number {LEGAL.companyNumber}, registered office {LEGAL.registeredAddress}). How Was Your Day is a marketplace connecting people who seek emotional peer support ("Seekers") with people who offer it based on lived experience ("Listeners"). Sessions are peer conversations, not clinical consultations.</p>

        <h2>2. Who can use How Was Your Day</h2>
        <ul>
          <li>You must be 18 years or older to use How Was Your Day</li>
          <li>You must live in the United Kingdom</li>
          <li>You must provide a valid mobile number and any other information required to create an account</li>
          <li>Country availability, payment methods, and other product features may vary by market</li>
        </ul>
        <p>How Was Your Day may change supported countries from time to time.</p>

        <h2>3. Prohibited conduct</h2>
        <ul>
          <li>Sexual, suggestive, or romantic communication</li>
          <li>Sharing personal contact information (phone, email, social media)</li>
          <li>Arranging off-platform meetings or communications</li>
          <li>Impersonating a licensed mental health professional</li>
          <li>Harassment, abuse, or threatening behaviour</li>
          <li>Using the platform for commercial solicitation</li>
        </ul>

        <h2>4. Listener responsibilities</h2>
        <p>Listeners confirm they are sharing personal lived experience only and are not providing clinical, medical, or professional advice unless a specific service and qualification is explicitly presented and permitted by How Was Your Day. Listeners must not misrepresent their qualifications.</p>
        <p>Listeners must keep everything a seeker shares confidential. They must not record, screenshot, copy or repeat it to anyone, and must not try to identify, find or contact a seeker outside How Was Your Day. Breaking this leads to removal from the platform.</p>

        <h2>5. Payments and refunds</h2>
        <ul>
          <li>All prices are in pounds sterling (GBP) and include any VAT that applies. If you pay with a card in another currency, your bank sets the exchange rate and any fee</li>
          <li>Wallet top-ups and payments are processed by our payment provider using the payment methods shown at checkout</li>
          <li>Unused wallet balance is refundable on request, to the original payment method, through the wallet page</li>
          <li><strong>Booked sessions:</strong> the price is held from your wallet when you book. Cancel at least 2 hours before the start for a full refund. If your listener cancels or does not join within 5 minutes of the start, you get a full refund. Times are UK time</li>
          <li><strong>Your right to cancel:</strong> as a consumer you can cancel a wallet top-up within 14 days and get back any unused balance. When you start a session you ask us to provide the service straight away, and you accept that you lose the right to cancel that session once it has been fully provided; for a session ended early you pay only for the minutes used</li>
          <li>Completed sessions are generally non-refundable unless a safety, billing, or platform error requires an adjustment</li>
          <li>Any platform fee and applicable taxes are shown before a paid session is started</li>
          <li>How Was Your Day applies a {Math.round(LISTENER_SERVICE_FEE_RATE * 100)}% service fee on listener earnings, deducted at session settlement. The listener&apos;s net settlement is shown in the listener dashboard</li>
        </ul>

        <h2>6. Content moderation</h2>
        <p>How Was Your Day uses automated, rule-based checks (not AI) and human review to keep sessions safe (see our <a href="/privacy">Privacy Policy</a>). Sessions that violate these terms may be terminated without refund. Repeat violations may result in permanent account suspension.</p>

        <h2>7. Limitation of liability</h2>
        <p>How Was Your Day is not liable for the advice or content shared by listeners. We do not guarantee outcomes from peer support sessions. We are a platform, not a healthcare provider. Nothing in these terms limits or excludes our liability for death or personal injury caused by our negligence, for fraud, or any other liability that cannot be limited by law, and nothing affects your statutory rights as a consumer (including under the Consumer Rights Act 2015).</p>

        <h2>8. Governing law</h2>
        <p>These terms are governed by the law of {LEGAL.governingLaw}. If you live in Scotland or Northern Ireland you can also bring proceedings there.</p>

        <h2>9. Contact</h2>
        <p>For legal or compliance queries, please use the <a href="/contact">contact form</a> on our website and select &ldquo;Legal&rdquo; as the topic.</p>
      </div>
    </>
  )
}
