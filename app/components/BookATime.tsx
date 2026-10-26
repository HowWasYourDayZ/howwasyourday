'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SESSION_DURATIONS } from '@/lib/constants'
import { formatGBP } from '@/lib/money'

// "Book a time" on a listener's profile (PROJECT.md §8.4). Slots come from the
// listener's weekly hours (GET /api/listener/[id]/slots); booking holds the
// price from the wallet (POST /api/sessions/schedule). Times are UK time.

type Slots = { slots: string[]; pricePence: number; priceLabel: string; error?: string }

const ukDay = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short' })
const ukTime = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: 'numeric', minute: '2-digit', hour12: true })

export default function BookATime({ listenerId, listenerName, voiceDisabled, signedIn }: {
  listenerId: string; listenerName: string; voiceDisabled: boolean; signedIn: boolean
}) {
  const router = useRouter()
  const [mins, setMins] = useState<number>(SESSION_DURATIONS[0])
  const [type, setType] = useState<'text' | 'voice'>('text')
  const [data, setData] = useState<Slots | null>(null)
  const [loading, setLoading] = useState(true)
  const [day, setDay] = useState<string | null>(null)
  const [slot, setSlot] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needWallet, setNeedWallet] = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true); setSlot(null); setError(null); setNeedWallet(false)
    fetch(`/api/listener/${listenerId}/slots?mins=${mins}&type=${type}`, { cache: 'no-store' })
      .then(r => r.json())
      .then((d: Slots) => { if (alive) setData(d) })
      .catch(() => { if (alive) setData({ slots: [], pricePence: 0, priceLabel: '' }) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [listenerId, mins, type])

  const days = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const s of data?.slots ?? []) {
      const k = ukDay(s)
      m.set(k, [...(m.get(k) ?? []), s])
    }
    return Array.from(m.entries())
  }, [data])
  useEffect(() => { if (days.length && !days.some(([k]) => k === day)) setDay(days[0][0]) }, [days, day])

  async function book() {
    if (!slot || busy) return
    if (!signedIn) { router.push('/auth?redirect=' + encodeURIComponent(`/listener/${listenerId}`)); return }
    setBusy(true); setError(null); setNeedWallet(false)
    try {
      const res = await fetch('/api/sessions/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listenerId, durationMins: mins, sessionType: type, startAt: slot }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (d.error === 'insufficient_balance') { setNeedWallet(true); return }
        setError(d.message || d.error || 'Could not book this time. Please try again.')
        if (d.error === 'slot_unavailable') setData(cur => cur ? { ...cur, slots: cur.slots.filter(x => x !== slot) } : cur)
        return
      }
      router.push('/sessions?booked=1')
    } catch {
      setError('Network error. Please try again.')
    } finally { setBusy(false) }
  }

  const chip = (on: boolean): React.CSSProperties => ({
    padding: '8px 12px', borderRadius: 50, border: `1.5px solid ${on ? '#1A8FA0' : '#DDE8F0'}`, background: on ? '#EAF5F8' : 'white',
    color: '#0F4867', fontWeight: 800, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
  })
  const daySlots = days.find(([k]) => k === day)?.[1] ?? []

  return (
    <section aria-labelledby="book-a-time" style={{ margin: '0 16px 24px', padding: 16, background: 'white', border: '1.5px solid #DDE8F0', borderRadius: 18, fontFamily: "'Nunito',sans-serif" }}>
      <h2 id="book-a-time" style={{ fontSize: 17, fontWeight: 900, color: '#0F4867', margin: '0 0 4px' }}>📅 Book a time</h2>
      <p style={{ fontSize: 13, color: '#6B8FA8', fontWeight: 600, margin: '0 0 12px' }}>
        Pick a slot from {listenerName}&apos;s weekly hours (UK time). The price is held now; cancel at least 2 hours before for a full refund.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }} role="radiogroup" aria-label="Text or voice">
        <button type="button" role="radio" aria-checked={type === 'text'} style={chip(type === 'text')} onClick={() => setType('text')}>💬 Text</button>
        {!voiceDisabled && <button type="button" role="radio" aria-checked={type === 'voice'} style={chip(type === 'voice')} onClick={() => setType('voice')}>📞 Voice</button>}
        <span style={{ width: 8 }} />
        {SESSION_DURATIONS.map(m => (
          <button key={m} type="button" role="radio" aria-checked={mins === m} style={chip(mins === m)} onClick={() => setMins(m)}>{m} min</button>
        ))}
      </div>
      {loading ? (
        <p style={{ fontSize: 13, color: '#6B8FA8', fontWeight: 700 }}>Loading times…</p>
      ) : days.length === 0 ? (
        <p style={{ fontSize: 13, color: '#6B8FA8', fontWeight: 700 }}>No bookable times in the next two weeks. {listenerName} may not have set weekly hours yet.</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 8 }}>
            {days.map(([k, list]) => (
              <button key={k} type="button" style={chip(day === k)} onClick={() => { setDay(k); setSlot(null) }}>{k} <span style={{ opacity: .6 }}>· {list.length}</span></button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {daySlots.map(s => (
              <button key={s} type="button" aria-pressed={slot === s} style={chip(slot === s)} onClick={() => setSlot(s)}>{ukTime(s)}</button>
            ))}
          </div>
          {error && <p role="alert" style={{ fontSize: 13, color: '#C0392B', fontWeight: 700, margin: '0 0 8px' }}>{error}</p>}
          {needWallet && (
            <p role="alert" style={{ fontSize: 13, color: '#9A5B00', fontWeight: 700, margin: '0 0 8px' }}>
              Your wallet needs {data ? formatGBP(data.pricePence) : 'more'} for this booking.{' '}
              <a href={`/wallet?return=${encodeURIComponent(`/listener/${listenerId}`)}`} style={{ color: '#1A8FA0' }}>Top up →</a>
            </p>
          )}
          <button type="button" onClick={book} disabled={!slot || busy}
            style={{ width: '100%', padding: 14, borderRadius: 50, border: 'none', background: slot ? '#0F4867' : '#B8CBD6', color: 'white', fontWeight: 900, fontSize: 15, cursor: slot ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            {busy ? 'Booking…' : slot ? `Book ${ukDay(slot)}, ${ukTime(slot)} — ${data?.priceLabel ?? ''}` : 'Choose a time'}
          </button>
        </>
      )}
    </section>
  )
}
