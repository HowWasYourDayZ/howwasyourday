import type { Metadata } from 'next'

// Linked from the Google Play listing (Data safety → Delete account URL).
// Must stay true to what app/api/account/route.ts scrubUserData() actually does.
export const metadata: Metadata = {
  title: 'Delete your How Was Your Day account',
  description: 'How to delete your How Was Your Day account and what data is deleted or kept.',
  alternates: { canonical: 'https://www.howwasyourday.live/delete-account' },
}

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{--navy:#3B2F2A;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--cream:#FFFAF6;}
  body{font-family:Nunito,sans-serif;background:var(--cream);color:var(--navy);-webkit-font-smoothing:antialiased;}
  a{color:var(--orange);text-decoration:none;}
  .page{max-width:640px;margin:0 auto;padding:24px 20px 80px;}
  .back{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--gray);margin-bottom:28px;}
  h1{font-size:28px;font-weight:900;color:var(--navy);margin-bottom:8px;}
  .updated{font-size:13px;color:var(--gray);font-weight:500;margin-bottom:24px;}
  h2{font-size:17px;font-weight:800;color:var(--navy);margin:28px 0 10px;}
  p{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:10px;}
  ol,ul{padding-left:20px;margin-bottom:10px;}
  li{font-size:14px;color:#4A3C34;line-height:1.75;font-weight:500;margin-bottom:4px;}
  .steps{background:#FFFAF6;border:1.5px solid #F2DFD1;border-radius:16px;padding:16px 18px 8px 36px;margin:16px 0;}
  .steps li{color:#9E4719;font-weight:700;}
`

export default function DeleteAccountPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="page">
        <a href="/" aria-label="How Was Your Day — home" style={{ display: 'inline-block', marginBottom: 18 }}><img src="/logo.png" alt="How Was Your Day" style={{ height: 40, width: 'auto', display: 'block' }} /></a>
        <br />
        <a href="/" className="back">← Back to How Was Your Day</a>
        <h1>Delete your How Was Your Day account</h1>
        <p className="updated">How Was Your Day (howwasyourday.live, Android app &ldquo;How Was Your Day&rdquo;) · Last updated: October 2026</p>

        <h2>Delete it in the app</h2>
        <ol className="steps">
          <li>Open the How Was Your Day app or www.howwasyourday.live and sign in with your phone number.</li>
          <li>Tap <strong>Profile</strong>.</li>
          <li>Scroll down and tap <strong>Delete account</strong>.</li>
          <li>Type <strong>DELETE</strong> and confirm. Your account is deleted straight away and you are signed out on every device.</li>
        </ol>
        <p>If you still have money in your How Was Your Day wallet, or a payout or refund on its way, the app asks you to withdraw or receive it first, so no money is lost. An account can&apos;t be deleted during a session.</p>

        <h2>Can&apos;t sign in?</h2>
        <p>Send a deletion request through the <a href="/contact">contact form</a> with the phone number on your account. We delete the account within 30 days.</p>

        <h2>What is deleted</h2>
        <ul>
          <li>Your sign-in (the account can no longer be used) and your email address, if you gave one</li>
          <li>Your profile photo, and for listeners the display photo and verification selfie</li>
          <li>Your profile text (bio, lived experience, taglines)</li>
          <li>Listener application details: bank details, identity-check records and screening answers</li>
          <li>Notifications and the push-notification tokens for your devices</li>
        </ul>

        <h2>What is kept, and why</h2>
        <ul>
          <li><strong>Session and payment records</strong> (dates, durations, amounts, wallet transactions). We keep these for accounting, tax and dispute handling, for as long as the law requires.</li>
          <li><strong>Messages from past sessions and any safety reports</strong>, kept to investigate abuse and keep the community safe.</li>
          <li><strong>Your display name and a disabled marker of your phone number</strong>. These stay on the records above and are used only to stop removed accounts from re-registering and to prevent fraud. They are not shown to other users.</li>
        </ul>
        <p>Your deleted account no longer appears anywhere on How Was Your Day. Read more in our <a href="/privacy">Privacy Policy</a>.</p>
      </div>
    </>
  )
}
