import type { Metadata } from 'next'
export const metadata: Metadata = { title: '404 — Page not found · How Was Your Day' }

const S = `

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Nunito,sans-serif;color:#3B2F2A;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:radial-gradient(ellipse 90% 55% at 0% 0%, #FDE6D6 0%, #FFF1E6 22%, #FFFFFF 58%);}
  a{text-decoration:none;}
  .wrap{text-align:center;padding:40px 24px;max-width:400px;}
  .logo{height:72px;margin-bottom:24px;opacity:0.7;}
  h1{font-size:80px;font-weight:900;color:#3B2F2A;line-height:1;margin-bottom:8px;}
  h2{font-size:22px;font-weight:800;color:#3B2F2A;margin-bottom:12px;}
  p{font-size:15px;color:#6E5B50;font-weight:500;line-height:1.6;margin-bottom:32px;}
  .btns{display:flex;flex-direction:column;gap:10px;max-width:260px;margin:0 auto;}
  .btn-primary{background:#E8743B;color:white;font-family:Nunito,sans-serif;font-weight:800;font-size:16px;padding:15px 28px;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(232,116,59,0.3);}
  .btn-outline{background:transparent;color:#B85520;font-family:Nunito,sans-serif;font-weight:700;font-size:15px;padding:13px 28px;border-radius:50px;border:2px solid #B85520;cursor:pointer;}
`

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />
      <div className="wrap">
        <img src="/logo.png" alt="How Was Your Day" className="logo" />
        <h1>404</h1>
        <h2>Page not found.</h2>
        <p>The page you&apos;re looking for doesn&apos;t exist — but someone to talk to always does.</p>
        <div className="btns">
          <a href="/"><button className="btn-primary">Go home →</button></a>
          <a href="/browse"><button className="btn-outline">Find a listener</button></a>
        </div>
      </div>
    </>
  )
}
