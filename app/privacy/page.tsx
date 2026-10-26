import type { Metadata } from 'next'
import { LEGAL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy — How Was Your Day',
  description: 'How Was Your Day privacy policy under UK GDPR and EU GDPR: what we collect, why, who we share it with, how long we keep it, and your rights.',
  alternates: { canonical: 'https://www.howwasyourday.live/privacy' },
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--cream:#FFFAF6;}
  body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--navy);-webkit-font-smoothing:antialiased;}
  a{color:var(--orange);text-decoration:none;}
  .page{max-width:640px;margin:0 auto;padding:24px 20px 80px;}
  .back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--gray);margin-bottom:28px;}
  h1{font-size:28px;font-weight:900;color:var(--navy);margin-bottom:8px;}
  .updated{font-size:13px;color:var(--gray);font-weight:500;margin-bottom:32px;}
  h2{font-size:17px;font-weight:800;color:var(--navy);margin:28px 0 10px;}
  p{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:10px;}
  ul{padding-left:20px;margin-bottom:10px;}
  li{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:4px;}
  .highlight-box{background:#FFFAF6;border:1.5px solid #F2DFD1;border-radius:16px;padding:16px 18px;margin:24px 0;}
  .highlight-box p{margin:0;font-size:13px;color:#9E4719;font-weight:600;}
  .tbl{width:100%;border-collapse:collapse;font-size:13px;color:#4A3C34;margin:8px 0 14px;}
  .tbl th,.tbl td{border-bottom:1px solid var(--border);padding:8px 6px;text-align:left;vertical-align:top;}
  .tbl th{color:var(--navy);font-weight:800;}
  .wrap{overflow-x:auto;}
`

const purposes: [string, string, string][] = [
  ['Create and run your account; sign you in with a one-time code or Google', 'Phone number, or the email address from your Google account (we do not use your Google name or photo), chosen first name, sign-in records', 'Contract (Art. 6(1)(b))'],
  ['Connect you with a listener and run text or voice sessions', 'Session details (type, length, times, rating), text messages, voice connection data (calls are not recorded)', 'Contract (Art. 6(1)(b)); for anything you share about your health or wellbeing: your explicit consent (Art. 9(2)(a))'],
  ['Wallet, payments, refunds and listener payouts', 'Top-ups, session charges, refunds, payout requests and bank details for listeners', 'Contract (Art. 6(1)(b)); keeping financial records: legal obligation (Art. 6(1)(c))'],
  ['Keep people safe: crisis-word alerts, reports, contact-detail checks, suspensions', 'Messages, reports, flags, account status', 'Legitimate interests in a safe service (Art. 6(1)(f)); explicit consent for health-related content (Art. 9(2)(a)); in an emergency, vital interests (Art. 6(1)(d), 9(2)(c))'],
  ['Check listeners before they take sessions', 'Application answers, birth month and year, education, languages, a live camera selfie, an identity document if requested, screening quiz answers', 'Contract and our legitimate interest in a safe service (Art. 6(1)(b), (f)); anything about the listener\'s own health in their lived-experience answers: explicit consent (Art. 9(2)(a))'],
  ['Security and abuse prevention', 'IP address, device and browser information, rate-limit and bot-check signals', 'Legitimate interests (Art. 6(1)(f))'],
  ['Notifications', 'Push-notification tokens, in-app notifications, service emails', 'Contract (Art. 6(1)(b))'],
  ['Analytics (only if you accept analytics cookies)', 'Pages visited and app events, never message content, names or phone numbers', 'Consent (Art. 6(1)(a)) — see our Cookie Policy'],
  ['Answer your messages', 'What you send through the contact form, and your email address', 'Legitimate interests (Art. 6(1)(f))'],
]

const processors: [string, string, string][] = [
  ['Supabase', 'Database, sign-in and file storage', LEGAL.hostingRegion],
  ['Vercel', 'Website hosting', 'Global edge network; USA'],
  // Add the SMS sign-in provider here (with its location) the day phone sign-in is switched on.
  ['Google (only if you sign in with Google)', 'Confirms your identity and shares your email address with us', 'USA'],
  ['Agora', 'Real-time voice connection (not recorded)', 'Global network; USA'],
  ['Google Firebase Cloud Messaging', 'Push notifications', 'USA'],
  ['Resend', 'Service emails', 'USA'],
  ['Upstash', 'Rate limiting', 'Region chosen by us'],
  ['Our payment provider', 'Card payments, refunds and listener payouts', 'Shown at checkout'],
  ['Google Analytics (only with consent)', 'Usage statistics', 'USA'],
]

export default function PrivacyPage() {
  const r = LEGAL.retention
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <a href="/" aria-label="How Was Your Day — home" style={{ display: 'inline-block', marginBottom: 18 }}><img src="/brand/logo.png" alt="How Was Your Day" style={{ height: 40, width: 'auto', display: 'block' }} /></a>
        <br />
        <a href="/" className="back">← Back to How Was Your Day</a>
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: {LEGAL.lastUpdated}</p>

        <div className="highlight-box">
          <p>How Was Your Day is a peer-support service for adults in the UK. What people share here is often personal and sometimes about their mental health, so we collect as little as we can, never sell your data, never use it for advertising, and never send your conversations to analytics or AI.</p>
        </div>

        <h2>1. Who we are</h2>
        <p>{LEGAL.entityName} (company number {LEGAL.companyNumber}, registered office {LEGAL.registeredAddress}) is the controller of your personal data. We are registered with the UK Information Commissioner&apos;s Office (registration {LEGAL.icoRegistration}). For anything about your data, email <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> or use the <a href="/contact">contact form</a>.</p>
        <p>This policy explains how we use personal data under the UK GDPR and the Data Protection Act 2018.</p>

        <h2>2. What we use and why</h2>
        <div className="wrap"><table className="tbl">
          <thead><tr><th>Purpose</th><th>Data</th><th>Lawful basis</th></tr></thead>
          <tbody>{purposes.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody>
        </table></div>

        <h2 id="sensitive">3. Sensitive information (your explicit consent)</h2>
        <p>Conversations on How Was Your Day can include information about your physical or mental health, relationships or other sensitive matters. This is &ldquo;special category&rdquo; data. We only process it because you give your <strong>explicit consent</strong> when you sign in, and only to provide the service and keep people safe. You can withdraw that consent at any time by deleting your account (see section 8); this does not affect processing before you withdrew it.</p>
        <p>We do not use your conversations for advertising, profiling or training AI models, and we do not sell them.</p>

        <h2>4. What we do NOT collect</h2>
        <ul>
          <li>We do not record voice calls.</li>
          <li>We do not ask seekers for their full name or date of birth. If you sign in with Google we receive your email address, which we use only for account recovery and booking emails.</li>
          <li>We do not show your phone number or email address to listeners, or a listener&apos;s to you.</li>
          <li>We do not collect national identity numbers.</li>
        </ul>

        <h2>5. Safety checks and automated rules</h2>
        <p>If words linked to self-harm or suicide appear in a chat, How Was Your Day shows crisis helplines, lets the listener know to take extra care, and flags the session for review by our team. Messages are also checked automatically, by fixed rules (not AI), for contact details such as phone numbers, email addresses and social media handles: a message that contains an actual contact detail is not delivered, and one that only hints at one is delivered and noted for review. These checks do not make decisions with legal or similarly significant effects about you; a person reviews any action on your account, and you can ask us to look again.</p>
        <p>Reported or flagged conversations may be read by authorised staff to keep people safe and resolve disputes. If we believe someone is at immediate risk of serious harm, we may share the minimum necessary information with emergency services.</p>

        <h2>6. Who we share data with</h2>
        <p>We use the service providers below (processors) under contracts that require them to protect your data and use it only on our instructions. Listeners see only the first name you choose and what you tell them in a session. We may also share data when the law requires it, or with professional advisers and, if the business is sold, a buyer bound by this policy.</p>
        <div className="wrap"><table className="tbl">
          <thead><tr><th>Provider</th><th>What for</th><th>Where</th></tr></thead>
          <tbody>{processors.map(([a, b, c]) => <tr key={a}><td>{a}</td><td>{b}</td><td>{c}</td></tr>)}</tbody>
        </table></div>

        <h2>7. International transfers</h2>
        <p>Our main database is hosted in {LEGAL.hostingRegion}. Some providers above process data outside the UK and EEA. When they do, we rely on an adequacy decision (for example the UK–US data bridge or EU–US Data Privacy Framework where the provider is certified) or on the UK International Data Transfer Addendum / EU Standard Contractual Clauses, with extra safeguards where needed. You can ask us for a copy of the relevant safeguards.</p>

        <h2>8. How long we keep data</h2>
        <ul>
          <li><strong>Your account:</strong> {r.account}.</li>
          <li><strong>Text messages:</strong> {r.messages}.</li>
          <li><strong>Payment and payout records:</strong> {r.payments}, kept without your contact details after you delete your account.</li>
          <li><strong>Listener verification selfie:</strong> {r.selfie}.</li>
          <li><strong>Analytics:</strong> up to 14 months in Google Analytics, and only if you accepted analytics cookies.</li>
        </ul>
        <p>When you delete your account, we remove your contact details and profile. We keep the limited records above for the stated periods to meet legal obligations, handle disputes and keep the service safe.</p>

        <h2 id="delete-account">9. Your rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li><strong>Access</strong> your personal data and get a copy of it</li>
          <li><strong>Correct</strong> data that is wrong or incomplete</li>
          <li><strong>Delete</strong> your data — use &ldquo;Delete account&rdquo; under Profile in the app, or ask us if you can&apos;t sign in (<a href="/delete-account">what deletion removes</a>)</li>
          <li><strong>Restrict</strong> or <strong>object to</strong> our use of your data, including anything based on legitimate interests</li>
          <li><strong>Data portability</strong> — receive data you gave us in a machine-readable format</li>
          <li><strong>Withdraw consent</strong> at any time — analytics through <a href="/cookies">cookie settings</a>, sensitive-data consent by deleting your account</li>
        </ul>
        <p>To use any right, email <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> or use the <a href="/contact">contact form</a> from the phone number on your account. We reply within one month (we may extend this by up to two months for complex requests and will tell you if so). There is normally no charge.</p>

        <h2>10. Complaints</h2>
        <p>Please contact us first so we can try to help. You also have the right to complain to a data protection authority: in the UK, the Information Commissioner&apos;s Office (<a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer">ico.org.uk</a>, 0303 123 1113).</p>

        <h2>11. Age</h2>
        <p>How Was Your Day is only for adults aged 18 and over. We do not knowingly collect data from children; if we learn that an account belongs to someone under 18, we close it.</p>

        <h2>12. Security</h2>
        <p>Data is encrypted in transit, access is limited to authorised staff who need it, listener selfies are kept in private storage that is never public, and all writes to sensitive records go through our servers rather than your browser.</p>

        <h2>13. Changes</h2>
        <p>We will update this page if how we use data changes, and tell you in the app about significant changes.</p>
      </div>
    </>
  )
}
