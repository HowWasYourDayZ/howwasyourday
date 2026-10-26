'use client'
import { usePathname, useRouter } from 'next/navigation'
import NotificationsBell from './NotificationsBell'

// `match` = the path that marks a tab active (href may carry a query string).
// Talk now: the match-first entry (/talk); src=nav so Analytics can count menu taps.
const TABS: { href: string; match?: string; icon: string | null; label: string; accent?: boolean }[] = [
  { href: '/browse',        icon: '🔍', label: 'Browse'   },
  { href: '/talk?src=nav',  match: '/talk', icon: '💬', label: 'Talk now', accent: true },
  { href: '/history',       icon: '📋', label: 'History'  },
  { href: '/wallet',        icon: '💰', label: 'Wallet'   },
  { href: '/notifications', icon: null, label: 'Alerts'   },
  { href: '/profile',       icon: '👤', label: 'Profile'  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()

  // The tab bar belongs to the signed-in app; marketing and info pages have their own nav.
  const APP_PATHS = ['/browse', '/talk', '/history', '/wallet', '/notifications', '/profile', '/dashboard',
    '/sessions', '/listener', '/messages', '/listener-lounge', '/feeling', '/daily-check-in']
  const shouldHide =
    !APP_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    // Full-height read-only chat detail (/history/<id>) — but keep nav on /history itself
    (pathname.startsWith('/history/') && pathname !== '/history')

  if (shouldHide) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `

        .bottom-nav{
          position:fixed;bottom:0;left:0;right:0;z-index:100;
          background:white;border-top:1.5px solid #F2DFD1;
          display:flex;justify-content:center;
          padding-bottom:env(safe-area-inset-bottom,0px);
        }
        .bottom-nav-inner{
          width:100%;max-width:540px;display:flex;
        }
        .nav-tab{
          flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:10px 0 8px;cursor:pointer;border:none;background:transparent;
          font-family:Nunito,sans-serif;font-weight:600;font-size:11px;
          color:#6E5B50;transition:color .15s;gap:3px;
        }
        .nav-tab.active{color:#3B2F2A;}
        .nav-tab.accent{color:#E07B10;font-weight:800;}
        .nav-tab.accent.active{color:#B35C00;}
        .nav-tab-icon{font-size:20px;line-height:1;}
      ` }} />
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {TABS.map(tab => {
            const base = tab.match ?? tab.href
            const isActive = pathname === base || pathname.startsWith(base + '/')
            // Notifications tab: render as a plain div to avoid nesting <button> inside <button>
            // (NotificationsBell is itself a <button>)
            if (tab.icon === null) {
              return (
                <div
                  key={tab.href}
                  className={`nav-tab${isActive ? ' active' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => router.push(tab.href)}
                >
                  <span className="nav-tab-icon"><NotificationsBell /></span>
                  {tab.label}
                </div>
              )
            }
            return (
              <button
                key={tab.href}
                className={`nav-tab${isActive ? ' active' : ''}${tab.accent ? ' accent' : ''}`}
                onClick={() => router.push(tab.href)}
              >
                <span className="nav-tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
