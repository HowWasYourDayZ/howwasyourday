'use client'
import { useState, useEffect, useRef, RefObject } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Globe, Heart, MessageCircle, Phone, Search, SlidersHorizontal, Star, Wallet as WalletIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { LANGUAGES, AGE_RANGES, ageRangeId, sessionRatePerMin } from '@/lib/constants'
import { SHOW_LISTENER_IN_SESSION_STATUS } from '@/lib/feature-flags'
import { estimateListenerTakeHome } from '@/lib/session-billing'
import { formatGBP } from '@/lib/money'
import { showToast } from '@/lib/toast'
import Avatar from '@/app/components/Avatar'

// Post-login welcome banner / onboarding modal
// New users (howwasyourday_welcome_new in sessionStorage) see a full-screen overlay
// that explains how sessions work and pushes them to pick a listener.
// Returning but un-onboarded users see the original thin strip.
function WelcomeBanner({
  listenerGridRef,
  onDismiss,
}: {
  listenerGridRef?: RefObject<HTMLDivElement | null>
  // Called with the topic the user came from (if any), so the parent can
  // pre-filter the listener grid before the modal closes.
  onDismiss?: (topic: string | null) => void
}) {
  const [show, setShow] = useState(false)
  const [isNew, setIsNew] = useState(false)
  // Topic the new user came from — read from sessionStorage so it survives
  // the /auth redirect that drops query params.
  const [intentTopic, setIntentTopic] = useState<string | null>(null)

  useEffect(() => {
    const newUser = sessionStorage.getItem('howwasyourday_welcome_new')
    const onboarded = localStorage.getItem('howwasyourday_onboarded')
    if (newUser) {
      setIsNew(true)
      setShow(true)
      sessionStorage.removeItem('howwasyourday_welcome_new')
      // Read topic intent that auth/page.tsx may have left behind.
      // The browse page already cleared howwasyourday_last_topic on mount, so read
      // howwasyourday_intent_topic instead — a separate key set only for this purpose.
      try {
        const t = sessionStorage.getItem('howwasyourday_intent_topic')
        if (t) { setIntentTopic(t); sessionStorage.removeItem('howwasyourday_intent_topic') }
      } catch { /* ignore */ }
    } else if (!onboarded) {
      setShow(true)
    }
  }, [])
  if (!show) return null

  // Full-screen onboarding overlay for brand-new signups
  if (isNew) {
    const dismiss = () => {
      setShow(false)
      localStorage.setItem('howwasyourday_onboarded', '1')
      onDismiss?.(intentTopic)
      // Scroll to the listener grid after a brief paint delay
      setTimeout(() => {
        listenerGridRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
    // If we know the topic they came from, personalise the CTA label.
    const topicLabel = intentTopic
      ? TAGS.find(t => t.id === intentTopic)?.label ?? null
      : null

    return (
      <div style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'var(--navy)',
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'32px 28px',
        fontFamily:'Nunito,sans-serif',
        textAlign:'center',
      }}>
        <div style={{fontSize:56, marginBottom:24, lineHeight:1}}>💙</div>
        <h2 style={{
          fontSize:'clamp(24px,6vw,32px)', fontWeight:900, color:'white',
          lineHeight:1.15, marginBottom:14, maxWidth:320,
        }}>
          Someone to talk to, from 8 minutes.
        </h2>
        <p style={{fontSize:16, color:'rgba(251,227,210,0.85)', fontWeight:600, lineHeight:1.65, marginBottom:10, maxWidth:300}}>
          Real person, not AI.
        </p>
        <p style={{fontSize:16, color:'rgba(251,227,210,0.85)', fontWeight:600, lineHeight:1.65, marginBottom:10, maxWidth:300}}>
          Anonymous. No prescription.
        </p>
        <p style={{fontSize:16, color:'rgba(251,227,210,0.85)', fontWeight:600, lineHeight:1.65, marginBottom:40, maxWidth:300}}>
          Just someone who listens.
        </p>
        <button
          onClick={dismiss}
          style={{
            background:'#E8743B', color:'white',
            border:'none', borderRadius:50,
            padding:'16px 40px',
            fontSize:17, fontWeight:900,
            cursor:'pointer', width:'100%', maxWidth:320,
            boxShadow:'0 4px 24px rgba(232,116,59,0.45)',
            fontFamily:'Nunito,sans-serif',
          }}
        >
          {topicLabel ? `Find a ${topicLabel.toLowerCase()} listener →` : 'Find a listener →'}
        </button>
        <p style={{fontSize:13, color:'rgba(251,227,210,0.45)', marginTop:20, fontWeight:600}}>
          No credit card needed for the free session.
        </p>
      </div>
    )
  }

  // The one intro strip on /browse (it replaced a separate free-trial nudge).
  return (
    <div style={{background:'var(--navy)',color:'white',padding:'10px 8px 10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,fontFamily:'Nunito,sans-serif'}}>
      <div style={{flex:1}}>
        <p style={{fontSize:14,fontWeight:800,margin:0,marginBottom:2}}>
          Not sure where to start?
        </p>
        <p style={{fontSize:13,fontWeight:600,color:'rgba(251,227,210,0.9)',margin:0}}>
          Pick someone you’d feel comfortable talking to — text or voice, now or at a time you book. Sessions start at 8 minutes.
        </p>
      </div>
      <button aria-label="Dismiss" onClick={() => { setShow(false); localStorage.setItem('howwasyourday_onboarded','1') }} style={{background:'none',border:'none',color:'white',cursor:'pointer',width:44,height:44,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}><X size={20} aria-hidden /></button>
    </div>
  )
}

// Photo-less listeners get a stable brand-palette colour from their name, so
// cards don't all look identical. Blues/teals only (orange is the CTA colour);
// all pass 4.5:1 with white initials.
const INITIALS_COLORS = ['#3B2F2A', '#9E4719', '#B85520', '#6E5B50']
function initialsColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return INITIALS_COLORS[h % INITIALS_COLORS.length]
}

type Listener = {
  id: string
  voice_disabled?: boolean
  user_id: string
  name: string
  bio: string
  rating: number
  total_sessions: number
  rate_per_min: number
  is_available: boolean
  is_in_session?: boolean  // derived: has an active session right now (feature-flagged)
  is_verified?: boolean
  specialty_tags: string[]
  languages_spoken: string[]
  avatar_url?: string
  birth_year?: number | null
  birth_month?: number | null
  last_heartbeat_at?: string | null
  tagline_phrases?: string[] | null
}

// Ranking used everywhere on this page. The online/offline precedence is
// deliberately identical to the server's and must not change — online listeners
// always sort first. The only tiebreaker that differs is WITHIN the offline
// group, which is now ordered by how recently the listener was last online.
function heartbeatMs(l: Listener): number {
  const t = l.last_heartbeat_at ? new Date(l.last_heartbeat_at).getTime() : NaN
  return Number.isFinite(t) ? t : -1 // never-online sinks to the bottom
}
function compareListeners(a: Listener, b: Listener): number {
  if (a.is_available !== b.is_available) return a.is_available ? -1 : 1
  if (!a.is_available) {
    const diff = heartbeatMs(b) - heartbeatMs(a)
    if (diff !== 0) return diff
  }
  return (b.rating || 0) - (a.rating || 0)
}

// "Last online" label for OFFLINE listeners. Returns null when the listener has
// never been online, or was last online long enough ago that surfacing it only
// signals dormancy — in that case the tile just shows the existing Offline dot.
function lastOnlineLabel(l: Listener): string | null {
  if (!l.last_heartbeat_at) return null
  const then = new Date(l.last_heartbeat_at).getTime()
  if (!Number.isFinite(then)) return null
  const mins = Math.floor((Date.now() - then) / 60_000)
  if (mins < 5)  return 'Active just now'
  if (mins < 60) return `Active ${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `Active ${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Active yesterday'
  if (days <= 7)  return `Active ${days}d ago`
  return null
}

const TAGS = [
  {id:'all',       icon:'✨', label:'All'},
  {id:'loneliness',icon:'🌙', label:'Loneliness'},
  {id:'anxiety',   icon:'😰', label:'Anxiety'},
  {id:'stress',    icon:'💼', label:'Work stress'},
  {id:'burnout',   icon:'🔥', label:'Burnout'},
  {id:'career',    icon:'🧭', label:'Career'},
  {id:'relationships',icon:'💬',label:'Relationships'},
  {id:'breakup',   icon:'💔', label:'Breakup'},
  {id:'grief',     icon:'🌿', label:'Grief'},
  {id:'students',  icon:'📚', label:'Students'},
  {id:'selfesteem',icon:'💙', label:'Self-esteem'},
  {id:'lgbtq',     icon:'🌈', label:'LGBTQ+'},
  {id:'parenting', icon:'👶', label:'Parenting'},
  {id:'startup',   icon:'🚀', label:'Startup'},
  {id:'general',   icon:'☕', label:'Just talk'},
]

// Maps support/SEO page slugs onto real listener specialty tags. Keep in sync
// when a new /support/* page adds a `/browse?topic=<slug>` CTA — an unmapped
// slug now falls back to "All" instead of showing an empty directory.
const TOPIC_ALIASES: Record<string, string> = {
  // legacy slug → real tag (keeps old inbound links working)
  'overthinking':                    'anxiety',
  'social-anxiety':                  'anxiety',
  'cant-sleep-anxiety':              'anxiety',
  'imposter-syndrome':               'selfesteem',
  'feeling-like-a-failure':          'selfesteem',
  'work-from-home-loneliness':       'loneliness',
  'sunday-night-loneliness':         'loneliness',
  'marriage-loneliness':             'relationships',
  'relationship-stress':             'relationships',
  'relationship-anxiety':            'relationships',
  'married-but-lonely':              'relationships',
  'long-distance-relationship':      'relationships',
  'arranged-marriage-stress':        'relationships',
  'job-loss':                        'career',
  'career-confusion':                'career',
  'founder-burnout':                 'startup',
  'student-stress':                  'students',
  'emotional-exhaustion':            'burnout',
  'emotional-support':               'general',
  'someone-to-talk-to':              'general',
  'anonymous-support':               'general',
  'dont-want-to-get-out-of-bed':     'general',
  'emotional-numbness':              'general',
  'feeling-empty':                   'general',
  'feeling-lost':                    'general',
  'need-to-vent':                    'general',
}

// User-selectable ordering. Online listeners ALWAYS rank first in every mode —
// sorting a bookable-now listener below an offline one would defeat the point
// of the directory — so the chosen key only orders within the online and
// offline groups.
const SORTS = [
  { id: 'best',      label: '⚡ Best match' },
  { id: 'price-low', label: '£ Price: low first' },
  { id: 'rating',    label: '⭐ Top rated' },
] as const
type SortId = typeof SORTS[number]['id']

const SAVED_KEY = 'howwasyourday_saved_listeners'

const S = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{--navy:#3B2F2A;--teal:#B85520;--orange:#E8743B;--gray:#6E5B50;--border:#F2DFD1;--light:#FFF6EF;--apricot:#FBE3D2;}
body{font-family:Nunito,sans-serif;color:var(--navy);-webkit-font-smoothing:antialiased;background:#FFFCFA;}
a{text-decoration:none;color:inherit;}
.wrap{max-width:1200px;margin:0 auto;padding:0 20px;}
:focus-visible{outline:3px solid var(--orange);outline-offset:3px;}

/* header */
.bh{background:#fff;border-bottom:1px solid var(--border);}
.bh-row{display:flex;align-items:center;justify-content:space-between;gap:12px;height:72px;}
.bh-row img{height:40px;width:auto;display:block;}
.bh-nav{display:flex;align-items:center;gap:8px;}
.bh-link{font-size:15px;font-weight:700;color:var(--gray);padding:10px 12px;border-radius:999px;}
.bh-link:hover{color:var(--navy);}
.bh-wallet{display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:800;color:var(--navy);padding:9px 14px;border-radius:999px;border:1.5px solid var(--border);background:#fff;}
.bh-cta{display:inline-flex;align-items:center;font-size:15px;font-weight:800;color:#fff;background:var(--teal);padding:12px 22px;border-radius:999px;white-space:nowrap;}
.bh-cta:hover{background:#9E4719;}
@media(max-width:560px){.bh-row{gap:8px}.bh-row img{height:32px}.bh-nav{gap:4px}.bh-link{padding:8px 8px;font-size:14px}.bh-wallet{display:none}.bh-cta{font-size:13.5px;padding:10px 14px}}

/* title + toolbar */
.bt{padding:44px 0 8px;}
.bt h1{font-size:clamp(34px,5.4vw,52px);font-weight:900;letter-spacing:-1px;line-height:1.05;margin-bottom:12px;}
.bt p{font-size:clamp(16px,2vw,19px);font-weight:600;color:var(--gray);line-height:1.5;}
.tools{display:flex;gap:12px;align-items:center;margin-top:28px;flex-wrap:wrap;}
.search{flex:1 1 320px;position:relative;}
.search svg{position:absolute;left:20px;top:50%;transform:translateY(-50%);color:var(--gray);pointer-events:none;}
.search input{width:100%;height:58px;padding:0 20px 0 50px;border-radius:999px;border:1.5px solid var(--border);background:#fff;font-family:Nunito,sans-serif;font-size:16px;font-weight:600;color:var(--navy);outline:none;}
.search input:focus{border-color:var(--orange);box-shadow:0 0 0 4px rgba(232,116,59,.12);}
.search input::placeholder{color:#8A766B;font-weight:500;}
.tbtn{height:58px;display:inline-flex;align-items:center;gap:10px;padding:0 24px;border-radius:999px;border:1.5px solid var(--border);background:#fff;font-family:Nunito,sans-serif;font-size:16px;font-weight:700;color:var(--navy);cursor:pointer;white-space:nowrap;}
.tbtn:hover{border-color:var(--orange);}
.tbtn.on{background:var(--teal);border-color:var(--teal);color:#fff;}
.tbtn .cnt{background:var(--orange);color:#fff;border-radius:999px;font-size:12px;font-weight:900;padding:1px 8px;}
.tbtn.on .cnt{background:#fff;color:var(--teal);}
.tbtn .live{width:9px;height:9px;border-radius:50%;background:#2E9E5B;box-shadow:0 0 0 3px rgba(46,158,91,.18);}
.tbtn.on .live{background:#fff;box-shadow:none;}
@media(max-width:560px){.tools{gap:10px}.tbtn{height:50px;padding:0 18px;font-size:15px;flex:1;justify-content:center}.search input{height:52px}}

.fpanel{margin-top:16px;background:#fff;border:1.5px solid var(--border);border-radius:24px;padding:20px;display:grid;gap:16px;}
.fgroup h4{font-size:12.5px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--teal);margin-bottom:10px;}
.fchips{display:flex;flex-wrap:wrap;gap:8px;}
.fchip{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 15px;border-radius:999px;border:1.5px solid var(--border);background:#fff;font-family:Nunito,sans-serif;font-size:14px;font-weight:700;color:var(--gray);cursor:pointer;}
.fchip.on{background:var(--navy);border-color:var(--navy);color:#fff;}
.freset{justify-self:start;background:none;border:none;font-family:Nunito,sans-serif;font-size:14px;font-weight:800;color:var(--teal);cursor:pointer;padding:4px 0;}

.count{margin:28px 0 16px;font-size:16px;font-weight:700;color:var(--gray);}

/* grid + listener cards */
.list{display:grid;grid-template-columns:minmax(0,1fr);gap:24px;padding-bottom:110px;}
@media(min-width:700px){.list{grid-template-columns:repeat(2,minmax(0,1fr));}}
@media(min-width:1040px){.list{grid-template-columns:repeat(3,minmax(0,1fr));}}
.lc{position:relative;background:#fff;border:1.5px solid var(--border);border-radius:28px;transition:border-color .2s,box-shadow .2s,transform .2s;}
.lc:hover{border-color:#EBC3A6;box-shadow:0 14px 36px rgba(59,47,42,.08);transform:translateY(-2px);}
.lc-link{display:flex;flex-direction:column;height:100%;padding:34px 34px 28px;border-radius:28px;}
@media(max-width:560px){.lc-link{padding:26px 24px 22px;}}
.lc-top{display:flex;gap:22px;align-items:center;margin-bottom:22px;padding-right:44px;}
.lc-av{width:92px;height:92px;border-radius:50%;flex-shrink:0;position:relative;box-shadow:0 0 0 4px #fff,0 6px 16px rgba(59,47,42,.12);}
.lc-av .ph{width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:26px;color:#fff;}
.lc-av img{width:100%;height:100%;object-fit:cover;}
.lc-dot{position:absolute;right:0;bottom:2px;width:22px;height:22px;border-radius:50%;border:4px solid #fff;}
.lc-dot.on{background:#2E9E5B;}.lc-dot.off{background:#C9BDB4;}.lc-dot.busy{background:var(--orange);}
.lc-name{font-size:24px;font-weight:900;line-height:1.15;letter-spacing:-.3px;display:flex;align-items:center;gap:6px;min-width:0;}
.lc-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.lc-status{font-size:15px;font-weight:700;color:var(--gray);margin-top:4px;}
.lc-status.on{color:#23794A;}.lc-status.busy{color:#9A4E00;}
.lc-sub{font-size:14.5px;font-weight:600;color:var(--gray);margin-top:4px;display:flex;align-items:center;gap:4px;}
.lc-bio{font-size:16.5px;line-height:1.6;color:var(--gray);font-weight:600;margin-bottom:22px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:3.2em;}
.lc-chips{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:26px;}
.lc-chip{background:var(--light);color:#8A3F15;font-size:14.5px;font-weight:700;padding:6px 15px;border-radius:999px;}
.lc-lang{display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--border);color:var(--navy);font-size:14.5px;font-weight:700;padding:5px 14px;border-radius:999px;}
.lc-foot{margin-top:auto;padding-top:22px;border-top:1.5px solid #F7ECE3;display:flex;align-items:center;justify-content:space-between;gap:12px;}
.lc-modes{display:flex;gap:14px;color:var(--navy);}
.lc-price{font-size:15px;font-weight:600;color:var(--gray);white-space:nowrap;}
.lc-price b{font-size:21px;font-weight:900;color:var(--navy);}
.lc-heart{position:absolute;top:24px;right:24px;width:50px;height:50px;border-radius:50%;border:1.5px solid var(--border);background:#fff;display:flex;align-items:center;justify-content:center;color:var(--navy);cursor:pointer;transition:border-color .15s,color .15s,transform .15s;}
.lc-heart:hover{border-color:var(--orange);color:var(--orange);}
.lc-heart[aria-pressed="true"]{color:var(--orange);border-color:var(--apricot);background:var(--light);}
.lc-heart:active{transform:scale(.92);}

.skeleton{background:linear-gradient(90deg,#FFF6EF 25%,#FFFAF6 50%,#FFF6EF 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:28px;height:380px;border:1.5px solid var(--border);}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.empty{grid-column:1/-1;text-align:center;padding:56px 20px;background:#fff;border-radius:28px;border:1.5px solid var(--border);}
.empty h3{font-size:22px;font-weight:900;margin-bottom:8px;}
.empty p{font-size:15.5px;color:var(--gray);line-height:1.7;max-width:420px;margin:0 auto 24px;font-weight:600;}
.empty .acts{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}
.empty .acts button,.empty .acts a{font-family:Nunito,sans-serif;font-weight:800;font-size:15px;padding:13px 24px;border-radius:999px;cursor:pointer;border:1.5px solid var(--border);background:#fff;color:var(--navy);}
.empty .acts .p{background:var(--teal);border-color:var(--teal);color:#fff;}
.empty small{display:block;margin-top:20px;font-size:13.5px;color:var(--gray);font-weight:600;}
.empty small a{color:#B71C1C;font-weight:800;}

.session-toast{position:fixed;top:0;left:0;right:0;z-index:100;background:var(--orange);color:white;font-family:Nunito,sans-serif;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;box-shadow:0 4px 20px rgba(232,116,59,.35);animation:toastDrop .25s ease;}
@keyframes toastDrop{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:translateY(0)}}
.session-toast-text{font-size:14px;font-weight:800;}
.session-toast-sub{font-size:12px;font-weight:600;opacity:.85;margin-top:2px;}
.btn-toast-join{background:white;color:var(--orange);font-family:Nunito,sans-serif;font-weight:800;font-size:13px;padding:9px 16px;border-radius:10px;border:none;cursor:pointer;white-space:nowrap;}
.btn-toast-dismiss{background:transparent;color:white;font-family:Nunito,sans-serif;font-weight:700;font-size:20px;border:none;cursor:pointer;padding:0 4px;line-height:1;}
`

function BrowseContent() {
  const router  = useRouter()
  const client  = createClient()

  const [tag, setTag]         = useState('all')
  const [lang, setLang]       = useState('all')
  const [ageRange, setAgeRange] = useState('all')
  const [sortBy, setSortBy]     = useState<SortId>('best')
  const [joiningToast, setJoiningToast] = useState(false)
  // Overseas seekers (pricing country from the verified phone, via /api/auth/profile)
  // are billed per session, not per minute — show them the price.
  const [myUserId, setMyUserId] = useState<string | null>(null)
  const [myTextRate, setMyTextRate] = useState<number | null>(null)
  const [query, setQuery]     = useState('')
  const [listeners, setListeners] = useState<Listener[]>([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState<number|null>(null)
  const [incomingSession, setIncomingSession] = useState<{
    id: string; duration_mins: number; session_type: string; amount_held: number; platform_fee?: number | null
  } | null>(null)
  const channelRef = useRef<ReturnType<typeof client.channel> | null>(null)
  const listenerGridRef = useRef<HTMLDivElement | null>(null)
  // Free-trial nudge banner — shown to users who signed up within the last 30
  // days and haven't had a single session yet. Disappears after first session.
  const [authChecked, setAuthChecked] = useState(false)
  // Anonymous visitors are assumed eligible; logged-in seekers are checked below.
  const [showFilters, setShowFilters] = useState(false)
  const [availableOnly, setAvailableOnly] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  // Hearted listeners — this browser only (a per-viewer convenience; listed on /cookies).
  const [saved, setSaved] = useState<Set<string>>(new Set())
  useEffect(() => {
    try { setSaved(new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'))) } catch { /* storage blocked */ }
  }, [])
  const toggleSaved = (id: string) => setSaved(prev => {
    const next = new Set(prev)
    if (next.has(id)) next.delete(id); else next.add(id)
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next))) } catch { /* storage blocked */ }
    return next
  })

  // Read ?topic= from URL after hydration to avoid SSR mismatch.
  //
  // Support/SEO pages link here with their OWN slug (e.g. /support/overthinking
  // → ?topic=overthinking), but those slugs are not listener specialty tags.
  // Previously an unrecognised value was set as the filter verbatim, so the API
  // searched for a tag no listener has and the page rendered "No listeners
  // match" — every one of those landing-page CTAs dead-ended on an empty list.
  // Map known slugs to the closest real tag, and ignore anything unrecognised
  // (falling back to "All") rather than filtering the directory to nothing.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('topic')
    if (!raw) {
      // Restore topic intent from a prior visit (e.g. after auth redirect drops
      // the query param). Only restore once — clear it so it doesn't persist
      // across unrelated visits.
      try {
        const saved = sessionStorage.getItem('howwasyourday_last_topic')
        if (saved) {
          sessionStorage.removeItem('howwasyourday_last_topic')
          if (TAGS.some(t => t.id === saved)) setTag(saved)
        }
      } catch { /* sessionStorage unavailable */ }
      return
    }
    const mapped = TOPIC_ALIASES[raw] ?? raw
    if (TAGS.some(t => t.id === mapped)) {
      setTag(mapped)
      // Persist topic intent so it survives the auth redirect (auth drops
      // query params when the redirect isn't set explicitly).
      try { sessionStorage.setItem('howwasyourday_last_topic', mapped) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => { loadListeners(false) }, [tag, lang])

  // The /api/listeners response is authoritative and always fresh (the route is
  // force-dynamic + no-store), so we re-pull it on every trigger that could mean
  // a listener just toggled availability on /dashboard. Re-fetching can only
  // correct the list, never stale it:
  //   • window focus + tab becoming visible — covers switching back from the
  //     dashboard tab (visibilitychange alone is unreliable on desktop tab swaps)
  //   • a 30 s poll — backstop when Realtime isn't enabled for listener_profiles
  // Together these make online/offline reflect within seconds without depending
  // on Supabase Realtime being configured.
  useEffect(() => {
    // Silent refresh — no skeleton flash. Used for background polls and cross-tab
    // events. Initial load (called from the tag/lang effect) shows the skeleton.
    const refresh = () => loadListeners(true)
    const onVis = () => { if (document.visibilityState === 'visible') refresh() }
    // pageshow fires on back/forward navigation INCLUDING bfcache restores,
    // where the page is resurrected frozen and mount/focus/visibility may not
    // fire — this is the one path that otherwise shows a stale list after
    // navigating dashboard → back → browse.
    const onPageShow = () => refresh()
    window.addEventListener('focus', refresh)
    window.addEventListener('pageshow', onPageShow)
    document.addEventListener('visibilitychange', onVis)
    // Slow backstop poll for a dropped Realtime socket.
    //
    // WAS 3 SECONDS, which meant 20 requests/minute per open tab, forever,
    // even in a background tab nobody was looking at. Each one is a Vercel
    // function invocation plus a Supabase query, and /browse is the most-opened
    // page on the site — this was the single largest consumer of Vercel Fluid
    // Active CPU (the free-tier allowance hit 75% in Aug 2026).
    //
    // It is also redundant four times over: the listener-availability Realtime
    // subscription below pushes changes, BroadcastChannel catches same-origin
    // tab changes instantly, and focus/visibilitychange/pageshow all refresh on
    // return. This only has to catch a silently dropped socket, which 60 s does
    // just as well as 3 s.
    //
    // Skipping hidden tabs matters as much as the interval: visibilitychange
    // already refreshes the moment the user comes back, so polling in the
    // background bought nothing at all.
    const iv = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, 120_000)

    // BroadcastChannel — receives immediate notification when another tab on the
    // same origin (e.g. /dashboard) toggles availability. Without this, the browse
    // page waits up to 5 s even when the change is known instantly.
    let bc: BroadcastChannel | null = null
    try {
      bc = new BroadcastChannel('howwasyourday-availability')
      bc.onmessage = (e: MessageEvent<{ user_id: string; is_available: boolean }>) => {
        const { user_id, is_available } = e.data || {}
        if (typeof user_id !== 'string' || typeof is_available !== 'boolean') return
        setListeners(prev => {
          const mapped = prev.map(l =>
            l.user_id === user_id ? { ...l, is_available } : l
          )
          return [...mapped].sort(compareListeners)
        })
      }
    } catch {
      // BroadcastChannel unavailable (e.g. private browsing on some browsers)
    }

    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('pageshow', onPageShow)
      document.removeEventListener('visibilitychange', onVis)
      clearInterval(iv)
      try { bc?.close() } catch { /* ignore */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tag, lang])

  // Realtime: update listener availability without requiring a full page reload.
  // Re-sort after update so newly-online listeners rise to the top (same order
  // as the server: is_available DESC, rating DESC). Without re-sorting, a
  // listener who was offline on initial load stays at the bottom even after
  // they go online, making them appear to have "disappeared" on short screens.
  useEffect(() => {
    const availSub = client.channel('listener-availability')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'listener_profiles',
      }, (payload) => {
        const updated = payload.new as { user_id: string; is_available: boolean; last_heartbeat_at?: string | null; is_in_session?: boolean }
        setListeners(prev => {
          const mapped = prev.map(l =>
            l.user_id === updated.user_id
              // is_available handling is unchanged. last_heartbeat_at is carried
              // through when present (migration 046 sets REPLICA IDENTITY FULL,
              // so UPDATE payloads include it) to keep the "last online" label
              // and the offline ordering fresh without a refetch.
              // is_in_session: updated from the DB column (migration 052) so the
              // orange dot appears instantly when a listener accepts a session,
              // without waiting for the 60-second poll.
              ? { ...l, is_available: updated.is_available,
                  last_heartbeat_at: updated.last_heartbeat_at ?? l.last_heartbeat_at,
                  is_in_session: updated.is_in_session ?? l.is_in_session }
              : l
          )
          return [...mapped].sort(compareListeners)
        })
      })
      .subscribe()
    return () => { client.removeChannel(availSub) }
  }, [])

  useEffect(() => {
    client.auth.getUser().then(async ({data:{user}}) => {
      setAuthChecked(true)
      if (!user) return
      // Remember who I am so I never see (or can book) my own listener card.
      setMyUserId(user.id)
      const {data} = await client.from('users').select('wallet_balance').eq('id',user.id).single()
      if (data) {
        setBalance(data.wallet_balance as number | null)
      }

      // Only subscribe to incoming sessions if user is an approved listener — avoids
      // wasteful realtime connections for regular seekers
      const { data: lp } = await client.from('listener_profiles').select('is_approved, rate_per_min').eq('user_id', user.id).maybeSingle()
      if (lp?.is_approved) {
        setMyTextRate(lp.rate_per_min != null ? Number(lp.rate_per_min) : null)
        if (channelRef.current) client.removeChannel(channelRef.current)
        const channel = client.channel(`browse-incoming-${user.id}`)
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'sessions',
            filter: `listener_id=eq.${user.id}`,
          }, (payload) => {
            setIncomingSession(payload.new as { id: string; duration_mins: number; session_type: string; amount_held: number; platform_fee?: number | null })
          })
          .subscribe()
        channelRef.current = channel
      }
    })

    return () => {
      if (channelRef.current) client.removeChannel(channelRef.current)
    }
  }, [])

  async function loadListeners(silent = false) {
    // Only show skeleton on the initial load (no existing listeners in state).
    // Background polls must be silent so the online→offline transition is visible
    // immediately when the poll completes — a skeleton flash during a poll looks
    // like the state "reset" and confuses listeners checking their own visibility.
    if (!silent) setLoading(true)
    const params = new URLSearchParams()
    if (tag  !== 'all') params.set('tag',  tag)
    if (lang !== 'all') params.set('lang', lang)
    try {
      params.set('_t', Date.now().toString())
      const res = await fetch(`/api/listeners?${params}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load')
      const { listeners: data } = await res.json()
      setListeners((data || []).map((l: Record<string, unknown>) => ({
        ...l,
        name:       ((l.users as { name?: string } | null)?.name) || 'Listener',
        avatar_url: ((l.users as { avatar_url?: string } | null)?.avatar_url),
        languages_spoken: (l.languages_spoken as string[]) || [],
      })))
    } catch {
      if (!silent) setListeners([])
    }
    if (!silent) setLoading(false)
  }

  const filtered = listeners
    // Item 1: a listener must never see their own card as bookable.
    .filter(l => !myUserId || l.user_id !== myUserId)
    // Item 2: age-range filter. A listener with no age set is only excluded
    // when a specific range is chosen (they still appear under "All ages").
    .filter(l => ageRange === 'all' || ageRangeId(l.birth_year, l.birth_month) === ageRange)
    .filter(l => !availableOnly || l.is_available)
    .filter(l => !savedOnly || saved.has(l.user_id))
    .filter(l => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return l.name.toLowerCase().includes(q)
        || !!l.bio?.toLowerCase().includes(q)
        || (l.specialty_tags || []).some(t => (TAGS.find(x => x.id === t)?.label ?? t).toLowerCase().includes(q))
    })

  // Apply the user's chosen ordering at RENDER time only. The underlying
  // `listeners` array stays in the canonical compareListeners() order that the
  // realtime/BroadcastChannel handlers maintain, so availability behaviour is
  // completely untouched. 'best' renders that canonical order as-is.
  const visible = sortBy === 'best' ? filtered : [...filtered].sort((a, b) => {
    // Online first in EVERY mode — never bury a listener you can talk to now.
    if (a.is_available !== b.is_available) return a.is_available ? -1 : 1
    if (sortBy === 'price-low') return (a.rate_per_min || 0) - (b.rate_per_min || 0)
    if (sortBy === 'rating')    return (b.rating || 0) - (a.rating || 0)
    return 0
  })

  const ini = (n:string) => n.split(' ').map((x:string)=>x[0]||'').join('').slice(0,2).toUpperCase()||'?'
  const tagInfo = (id:string) => TAGS.find(t=>t.id===id)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: S }} />

      {/* Incoming session toast for listeners browsing */}
      {incomingSession && (
        <div className="session-toast">
          <div>
            <div className="session-toast-text">New session request!</div>
            <div className="session-toast-sub">
              {incomingSession.duration_mins ? `${incomingSession.duration_mins} min` : ''}{' '}
              {incomingSession.session_type ?? ''}{incomingSession.amount_held ? ` · you earn ${formatGBP(estimateListenerTakeHome(incomingSession, myTextRate))}` : ' · free (test account)'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn-toast-join"
              disabled={joiningToast}
              onClick={async () => {
                // Must ACCEPT before navigating. Previously this only pushed the
                // route, leaving the session 'pending' — so the listener landed on
                // the waiting screen telling them to "open your dashboard to
                // accept", and if they didn't, the request expired and the seeker
                // was refunded. Mirrors the dashboard's accept flow.
                if (joiningToast) return
                const sess = incomingSession
                setJoiningToast(true)
                try {
                  const res = await fetch(`/api/sessions/${sess.id}/accept`, { method: 'POST' })
                  if (!res.ok) {
                    const body = await res.json().catch(() => ({}))
                    showToast(body.message || body.error || 'Could not accept — it may have expired.', 'error')
                    setIncomingSession(null)
                    return
                  }
                  setIncomingSession(null)
                  router.push(`/session/${sess.id}?name=You&duration=${sess.duration_mins}&type=${sess.session_type ?? 'text'}`)
                } catch {
                  showToast('Network error — could not accept session.', 'error')
                } finally {
                  setJoiningToast(false)
                }
              }}
            >
              {joiningToast ? 'Joining…' : 'Join →'}
            </button>
            {/* Declining explicitly refunds the seeker immediately rather than
                leaving them waiting out the full 5-minute request window. */}
            <button
              className="btn-toast-dismiss"
              title="Decline"
              onClick={async () => {
                const sess = incomingSession
                setIncomingSession(null)
                try { await fetch(`/api/sessions/${sess.id}/decline`, { method: 'POST' }) } catch { /* ignore */ }
              }}
            >✕</button>
          </div>
        </div>
      )}

      <WelcomeBanner
        listenerGridRef={listenerGridRef}
        onDismiss={(topic) => {
          // Pre-filter the listener grid to the user's topic intent when
          // the onboarding modal closes — so they immediately see relevant
          // listeners rather than the generic "All" view.
          if (topic && TAGS.some(t => t.id === topic)) setTag(topic)
        }}
      />
      <header className="bh">
        <div className="wrap bh-row">
          <a href="/" aria-label="How Was Your Day — home"><img src="/brand/logo.png" alt="How Was Your Day" width={128} height={40} /></a>
          <nav className="bh-nav" aria-label="Account">
            {authChecked && (myUserId ? (
              <>
                <a href="/wallet" className="bh-wallet" aria-label="Wallet balance"><WalletIcon size={16} aria-hidden /> {balance !== null ? formatGBP(balance) : 'Wallet'}</a>
                <a href="/profile" className="bh-link">My account</a>
              </>
            ) : (
              <a href="/auth?redirect=/browse" className="bh-link">Sign in</a>
            ))}
            <a href="/become-a-peer-supporter" className="bh-cta">Become a listener</a>
          </nav>
        </div>
      </header>

      <main className="wrap">
        <section className="bt">
          <h1>Find your listener</h1>
          <p>Kind, patient people ready to hear you. Browse freely — no account needed to look.</p>

          <div className="tools">
            <label className="search">
              <Search size={20} aria-hidden />
              <input
                placeholder="Search by name, topic or anything they mention…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search listeners by name, topic or anything they mention"
              />
            </label>
            {(() => {
              const active = (tag !== 'all' ? 1 : 0) + (lang !== 'all' ? 1 : 0) + (ageRange !== 'all' ? 1 : 0) + (sortBy !== 'best' ? 1 : 0) + (savedOnly ? 1 : 0)
              return (
                <button type="button" className={`tbtn${showFilters ? ' on' : ''}`} onClick={() => setShowFilters(v => !v)} aria-expanded={showFilters} aria-controls="browse-filters">
                  <SlidersHorizontal size={18} aria-hidden /> Filters{active > 0 && <span className="cnt">{active}</span>}
                </button>
              )
            })()}
            <button type="button" className={`tbtn${availableOnly ? ' on' : ''}`} aria-pressed={availableOnly} onClick={() => setAvailableOnly(v => !v)}>
              <span className="live" aria-hidden /> Available now
            </button>
          </div>

          {showFilters && (
            <div className="fpanel" id="browse-filters">
              <div className="fgroup">
                <h4>Topic</h4>
                <div className="fchips">
                  {TAGS.map(t => (
                    <button type="button" key={t.id} className={`fchip${tag === t.id ? ' on' : ''}`} aria-pressed={tag === t.id} onClick={() => setTag(t.id)}>{t.icon} {t.label}</button>
                  ))}
                </div>
              </div>
              <div className="fgroup">
                <h4>Language</h4>
                <div className="fchips">
                  <button type="button" className={`fchip${lang === 'all' ? ' on' : ''}`} aria-pressed={lang === 'all'} onClick={() => setLang('all')}>Any language</button>
                  {LANGUAGES.map(l => (
                    <button type="button" key={l.id} className={`fchip${lang === l.id ? ' on' : ''}`} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>{l.label}</button>
                  ))}
                </div>
              </div>
              <div className="fgroup">
                <h4>Age</h4>
                <div className="fchips">
                  <button type="button" className={`fchip${ageRange === 'all' ? ' on' : ''}`} aria-pressed={ageRange === 'all'} onClick={() => setAgeRange('all')}>Any age</button>
                  {AGE_RANGES.map(r => (
                    <button type="button" key={r.id} className={`fchip${ageRange === r.id ? ' on' : ''}`} aria-pressed={ageRange === r.id} onClick={() => setAgeRange(r.id)}>{r.label}</button>
                  ))}
                </div>
              </div>
              <div className="fgroup">
                <h4>Sort and saved</h4>
                <div className="fchips">
                  {SORTS.map(o => (
                    <button type="button" key={o.id} className={`fchip${sortBy === o.id ? ' on' : ''}`} aria-pressed={sortBy === o.id} onClick={() => setSortBy(o.id)} title="Listeners who are online always appear first">{o.label}</button>
                  ))}
                  <button type="button" className={`fchip${savedOnly ? ' on' : ''}`} aria-pressed={savedOnly} onClick={() => setSavedOnly(v => !v)}>♥ Saved only</button>
                </div>
              </div>
              <button type="button" className="freset" onClick={() => { setTag('all'); setLang('all'); setAgeRange('all'); setSortBy('best'); setSavedOnly(false) }}>Clear filters</button>
            </div>
          )}
        </section>

        {!loading && <p className="count" aria-live="polite">{visible.length} {visible.length === 1 ? 'listener' : 'listeners'}{availableOnly ? ' available now' : ''}</p>}

        <div className="list" ref={listenerGridRef} style={loading ? { marginTop: 28 } : undefined}>
          {loading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" />)
          ) : visible.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: 44, marginBottom: 14 }} aria-hidden>🔍</div>
              <h3>{availableOnly ? 'Nobody is free this minute' : 'No listeners match'}</h3>
              <p>{availableOnly ? 'Listeners come and go through the day. Try Talk now — we’ll ask whoever comes online — or book a time with someone.' : 'Try clearing a filter or searching for something else.'}</p>
              <div className="acts">
                <button type="button" className="p" onClick={() => { setTag('all'); setLang('all'); setAgeRange('all'); setSortBy('best'); setQuery(''); setAvailableOnly(false); setSavedOnly(false) }}>Show all listeners</button>
                <a href="/talk?src=browse_empty">Try Talk now</a>
              </div>
              <small>In crisis? Call <a href="tel:999">999</a>, ring Samaritans on <a href="tel:116123">116 123</a> or text SHOUT to 85258.</small>
            </div>
          ) : visible.map(l => {
            const inSession = SHOW_LISTENER_IN_SESSION_STATUS && !!l.is_in_session
            const statusClass = inSession ? 'busy' : l.is_available ? 'on' : 'off'
            const lastSeen = !l.is_available && !inSession ? lastOnlineLabel(l) : null
            const statusLabel = inSession ? 'In a conversation' : l.is_available ? 'Available now' : lastSeen ? `Offline · ${lastSeen.replace(/^Active /, '')}` : 'Offline'
            const bio = (l.bio || '').trim() || (l.tagline_phrases ?? []).join(' · ')
            const isNew = !(l.rating > 0) && !(l.total_sessions > 0)
            const textRate = sessionRatePerMin(Number(l.rate_per_min), 'text')
            const noVoice = l.voice_disabled === true
            const topics = (l.specialty_tags || []).slice(0, 3).map(t => tagInfo(t)?.label || t)
            const langs = (l.languages_spoken || []).slice(0, 2).map(lid => {
              const label = LANGUAGES.find(x => x.id === lid)?.label || lid
              return label.match(/\(([^)]+)\)/)?.[1] ?? label
            })
            const isSaved = saved.has(l.user_id)
            return (
              <article key={l.id} className="lc">
                <Link href={`/listener/${l.user_id}`} className="lc-link" aria-label={`${l.name}, ${statusLabel}, ${formatGBP(textRate)} a minute — view profile`}>
                  <div className="lc-top">
                    <div className="lc-av">
                      <div className="ph" style={l.avatar_url ? undefined : { background: initialsColor(l.name) }}>
                        {l.avatar_url ? <Avatar src={l.avatar_url} alt="" size={184} /> : <span aria-hidden>{ini(l.name)}</span>}
                      </div>
                      <span className={`lc-dot ${statusClass}`} aria-hidden />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2 className="lc-name"><span title={l.name}>{l.name}</span>{l.is_verified && <BadgeCheck size={18} color="#B85520" aria-label="Verified" />}</h2>
                      <div className={`lc-status ${statusClass}`}>{statusLabel}</div>
                      <div className="lc-sub">
                        {isNew ? 'New listener' : (
                          <>
                            {l.rating > 0 && <><Star size={14} fill="#E8743B" color="#E8743B" aria-hidden /> {(+l.rating).toFixed(1)}</>}
                            {l.rating > 0 && l.total_sessions > 0 && ' · '}
                            {l.total_sessions > 0 && `${l.total_sessions} ${l.total_sessions === 1 ? 'conversation' : 'conversations'}`}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {bio && <p className="lc-bio">{bio}</p>}
                  {(topics.length > 0 || langs.length > 0) && (
                    <div className="lc-chips">
                      {topics.map(t => <span key={t} className="lc-chip">{t}</span>)}
                      {langs.length > 0 && <span className="lc-lang"><Globe size={15} aria-hidden /> {langs.join(', ')}</span>}
                    </div>
                  )}
                  <div className="lc-foot">
                    <div className="lc-modes" aria-label={noVoice ? 'Text chat' : 'Text chat or voice call'}>
                      <MessageCircle size={22} aria-hidden />
                      {!noVoice && <Phone size={22} aria-hidden />}
                    </div>
                    <div className="lc-price"><b>{formatGBP(textRate)}</b>/min</div>
                  </div>
                </Link>
                <button type="button" className="lc-heart" aria-pressed={isSaved} aria-label={isSaved ? `Remove ${l.name} from saved` : `Save ${l.name}`} onClick={() => toggleSaved(l.user_id)}>
                  <Heart size={22} fill={isSaved ? '#E8743B' : 'none'} aria-hidden />
                </button>
              </article>
            )
          })}
        </div>
      </main>

    </>
  )
}

export default function BrowsePage() {
  return (
    <BrowseContent/>
  )
}
