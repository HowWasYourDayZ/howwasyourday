'use client'
import { useEffect, useState } from 'react'

// Listener dashboard: weekly hours for BOOKED sessions (PROJECT.md §8.4), in UK
// time, plus days off. Separate from the online toggle (instant sessions).
// Saved via PUT /api/listener/schedule; existing bookings are never changed.

type Win = { weekday: number; start_min: number; end_min: number }
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
const fromHHMM = (v: string) => { const [h, m] = v.split(':').map(Number); return h * 60 + m }
const TIMES = Array.from({ length: 97 }, (_, i) => i * 15) // 00:00 … 24:00

export default function WeeklyHours() {
  const [wins, setWins] = useState<Win[] | null>(null)
  const [daysOff, setDaysOff] = useState<string[]>([])
  const [newDayOff, setNewDayOff] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    fetch('/api/listener/schedule', { cache: 'no-store' })
      .then(async r => {
        if (!r.ok) { setUnavailable(true); return }
        const d = await r.json()
        setWins(d.windows ?? []); setDaysOff(d.blockedDates ?? [])
      })
      .catch(() => setUnavailable(true))
  }, [])

  if (unavailable) return null
  if (wins === null) return null

  const update = (i: number, patch: Partial<Win>) => setWins(ws => ws!.map((w, j) => (j === i ? { ...w, ...patch } : w)))
  const add = (weekday: number) => setWins(ws => [...ws!, { weekday, start_min: 18 * 60, end_min: 21 * 60 }])
  const remove = (i: number) => setWins(ws => ws!.filter((_, j) => j !== i))

  async function save() {
    setSaving(true); setMsg(null)
    try {
      const res = await fetch('/api/listener/schedule', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ windows: wins, blockedDates: daysOff }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) { setMsg({ ok: false, text: d.error || 'Could not save.' }); return }
      setWins(d.windows); setDaysOff(d.blockedDates)
      setMsg({ ok: true, text: 'Saved. Seekers can now book these times.' })
    } catch { setMsg({ ok: false, text: 'Network error. Please try again.' }) }
    finally { setSaving(false) }
  }

  const sel: React.CSSProperties = { padding: '6px 8px', borderRadius: 8, border: '1.5px solid #DDE8F0', fontFamily: 'inherit', fontWeight: 700, color: '#0F4867', background: 'white' }
  const small: React.CSSProperties = { padding: '5px 10px', borderRadius: 50, border: '1.5px solid #DDE8F0', background: 'white', color: '#0F4867', fontWeight: 800, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }
  const today = new Date().toISOString().slice(0, 10)

  return (
    <section aria-labelledby="weekly-hours" style={{ background: 'white', border: '1.5px solid #DDE8F0', borderRadius: 18, padding: 16, margin: '0 0 20px', fontFamily: "'Nunito',sans-serif" }}>
      <h2 id="weekly-hours" style={{ fontSize: 16, fontWeight: 900, color: '#0F4867', margin: '0 0 4px' }}>🗓️ Weekly hours for booked sessions</h2>
      <p style={{ fontSize: 12.5, color: '#6B8FA8', fontWeight: 600, margin: '0 0 12px' }}>
        Seekers can book 8, 16 or 32-minute sessions inside these times (UK time), 2 hours to 14 days ahead, with a 10-minute gap between bookings.
        You don&apos;t need to be online — please join on time; a no-show refunds the seeker.
      </p>
      {DAYS.map((label, idx) => {
        const weekday = idx + 1
        const list = wins.map((w, i) => ({ w, i })).filter(x => x.w.weekday === weekday)
        return (
          <div key={weekday} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', borderTop: idx ? '1px solid #F0F5F8' : 'none' }}>
            <div style={{ width: 38, fontWeight: 900, color: '#0F4867', fontSize: 13, paddingTop: 6 }}>{label}</div>
            <div style={{ flex: 1 }}>
              {list.length === 0 && <span style={{ fontSize: 12.5, color: '#9AB0BF', fontWeight: 700, lineHeight: '30px' }}>Not available</span>}
              {list.map(({ w, i }) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <select aria-label={`${label} start`} style={sel} value={w.start_min} onChange={e => update(i, { start_min: Number(e.target.value) })}>
                    {TIMES.slice(0, -1).map(t => <option key={t} value={t}>{toHHMM(t)}</option>)}
                  </select>
                  <span style={{ fontWeight: 800, color: '#6B8FA8' }}>–</span>
                  <select aria-label={`${label} end`} style={sel} value={w.end_min} onChange={e => update(i, { end_min: Number(e.target.value) })}>
                    {TIMES.slice(1).map(t => <option key={t} value={t}>{t === 1440 ? '24:00' : toHHMM(t)}</option>)}
                  </select>
                  <button type="button" style={small} onClick={() => remove(i)} aria-label={`Remove ${label} ${toHHMM(w.start_min)} window`}>✕</button>
                </div>
              ))}
            </div>
            <button type="button" style={small} onClick={() => add(weekday)}>+ Add</button>
          </div>
        )
      })}
      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0F4867', marginBottom: 6 }}>Days off</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {daysOff.map(d => (
            <span key={d} style={{ ...small, cursor: 'default' }}>
              {new Date(d + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
              <button type="button" onClick={() => setDaysOff(x => x.filter(y => y !== d))} aria-label={`Remove day off ${d}`} style={{ border: 'none', background: 'none', cursor: 'pointer', marginLeft: 4, fontWeight: 900 }}>✕</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input type="date" min={today} value={newDayOff} onChange={e => setNewDayOff(e.target.value)} style={sel} aria-label="Add a day off" />
          <button type="button" style={small} onClick={() => { if (newDayOff && !daysOff.includes(newDayOff)) setDaysOff(x => [...x, newDayOff].sort()); setNewDayOff('') }}>Add day off</button>
        </div>
      </div>
      {msg && <p role="status" style={{ fontSize: 13, fontWeight: 800, color: msg.ok ? '#1E7A3E' : '#C0392B', margin: '10px 0 0' }}>{msg.text}</p>}
      <button type="button" onClick={save} disabled={saving}
        style={{ marginTop: 12, width: '100%', padding: 12, borderRadius: 50, border: 'none', background: '#0F4867', color: 'white', fontWeight: 900, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
        {saving ? 'Saving…' : 'Save weekly hours'}
      </button>
    </section>
  )
}
