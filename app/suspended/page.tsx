'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function SuspendedPage() {
  const router = useRouter()

  async function handleSignOut() {
    try {
      const sb = createClient()
      await sb.auth.signOut()
    } catch {
      // Ignore — proceed to redirect regardless; the session will expire naturally.
    }
    router.push('/')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:Karla,sans-serif;background:#FFF6E8;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;}
        .card{background:#fff;border-radius:20px;padding:40px 32px;max-width:460px;width:100%;text-align:center;box-shadow:0 4px 24px rgba(23,43,77,0.10);}
        .icon{font-size:48px;margin-bottom:16px;}
        h1{font-size:22px;font-weight:900;color:#172B4D;margin-bottom:12px;}
        p{font-size:15px;color:#4A5A73;line-height:1.6;margin-bottom:8px;}
        .contact-link{color:#C2471A;font-weight:700;text-decoration:none;}
        .contact-link:hover{text-decoration:underline;}
        .divider{border:none;border-top:1px solid #EEDFCB;margin:24px 0;}
        .signout-btn{background:none;border:1.5px solid #EEDFCB;border-radius:12px;padding:12px 28px;font-family:Karla,sans-serif;font-size:14px;font-weight:700;color:#4A5A73;cursor:pointer;transition:all .2s;}
        .signout-btn:hover{background:#FFFBF3;border-color:#8F9BB0;}
      ` }} />
      <div className="card">
        <div className="icon">🔒</div>
        <h1>Your account has been suspended</h1>
        <p>
          Your account has been temporarily suspended. You are unable to access the platform at this time.
        </p>
        <p>
          If you believe this is a mistake or need help, please{' '}
          <a href="/contact" className="contact-link">reach out to our support team</a>.
          We&apos;ll get back to you as soon as possible.
        </p>
        <hr className="divider" />
        <button className="signout-btn" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </>
  )
}
