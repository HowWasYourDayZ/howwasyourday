'use client'
import { useCallback, useEffect, useState } from 'react'
import { formatGBP } from '@/lib/money'

// Booked (scheduled) sessions for the signed-in user — on /sessions (seekers)
// and the listener dashboard. Data: GET /api/sessions/upcoming.

type Upcoming = {
  id: string; role: 'seeker' | 'listener'; peerName: string; durationMins: number; sessionType: string
  startAt: string; amountHeld: number | null; joinPath: string; icsPath: string; googleCalendarUrl: string
}

const when = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })

export default function UpcomingSessions({ title = 'Upcoming booked sessions', emptyText }: { title?: string; emptyText?: string }) {
  const [items, setItems] = useState<Upcoming[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [justBooked, setJustBooked] = useState(false)
  useEffect(() => { try { setJustBooked(new URLSearchParams(window.location.search).get('booked') === '1') } catch { /* ignore */ } }, [])

  const load = useCallback(() => {
    fetch('/api/sessions/upcoming', { cache: 'no-store' })
      .then(r => (r.ok ? r.json() : { upcoming: [] }))
      .then(d => setItems(d.upcoming ?? []))
      .catch(() => setItems([]))
  }, [])
  useEffect(() => {
    load()
    const iv = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(iv)
  }, [load])

  async function cancel(u: Upcoming) {
    const late = Date.parse(u.startAt) - Date.now() < 2 * 60 * 60_000
    const msg = u.role === 'listener'
      ? 'Cancel this booking? The seeker gets a full refund, and the cancellation is recorded on your profile.'
      : late ? 'Cancel this booking? It starts in less than 2 hours.' : 'Cancel this booking? You get a full refund to your wallet.'
    if (!confirm(msg)) return
    setBusyId(u.id)
    try {
      const res = await fetch(`/api/sessions/${u.id}/cancel`, { method: 'POST' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) alert(d.message || 'Could not cancel. Please try again.')
      load()
    } finally { setBusyId(null) }
  }

  if (items === null) return null
  if (items.length === 0 && !emptyText) return null
  const btn: React.CSSProperties = { padding: '7px 12px', borderRadius: 50, border: '1.5px solid #DDE8F0', background: 'white', color: '#0F4867', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit' }

  return (
    <section aria-label={title} style={{ margin: '0 0 20px', fontFamily: "'Nunito',sans-serif" }}>
      <h2 style={{ fontSize: 16, fontWeight: 900, color: '#0F4867', margin: '0 0 10px' }}>📅 {title}</h2>
      {justBooked && <p role="status" style={{ background: '#E8F8EE', color: '#1E7A3E', borderRadius: 12, padding: '10px 12px', fontSize: 13, fontWeight: 800, margin: '0 0 10px' }}>✅ Booked. We&apos;ll remind you 24 hours and 15 minutes before.</p>}
      {items.length === 0 && <p style={{ fontSize: 13, color: '#6B8FA8', fontWeight: 600 }}>{emptyText}</p>}
      {items.map(u => {
        const start = Date.parse(u.startAt)
        const open = now >= start - 5 * 60_000
        return (
          <div key={u.id} style={{ background: 'white', border: '1.5px solid #DDE8F0', borderRadius: 16, padding: 14, marginBottom: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#0F4867' }}>{when(u.startAt)} <span style={{ fontSize: 12, color: '#6B8FA8' }}>UK time</span></div>
            <div style={{ fontSize: 13, color: '#3A5A6E', fontWeight: 700, margin: '2px 0 10px' }}>
              {u.durationMins}-min {u.sessionType === 'voice' ? 'voice call' : 'text chat'} with {u.peerName}
              {u.amountHeld != null && <> · {formatGBP(u.amountHeld)} held</>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a href={u.joinPath} style={{ ...btn, background: open ? '#0F4867' : 'white', color: open ? 'white' : '#0F4867', borderColor: open ? '#0F4867' : '#DDE8F0' }}>{open ? 'Join now →' : 'Open'}</a>
              <a href={u.icsPath} style={btn}>Add to calendar</a>
              <a href={u.googleCalendarUrl} target="_blank" rel="noopener noreferrer" style={btn}>Google Calendar</a>
              {now < start && <button type="button" style={btn} onClick={() => cancel(u)} disabled={busyId === u.id}>{busyId === u.id ? 'Cancelling…' : 'Cancel'}</button>}
            </div>
          </div>
        )
      })}
    </section>
  )
}
