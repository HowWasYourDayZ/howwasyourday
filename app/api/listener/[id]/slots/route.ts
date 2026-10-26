import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { UUID_RE, SESSION_DURATIONS, DEFAULT_LISTENER_RATE } from '@/lib/constants'
import { quoteSession, getBookingPriceDisplay } from '@/lib/geo-pricing'
import { loadListenerSlots } from '@/lib/scheduled-sessions'

export const dynamic = 'force-dynamic'

// GET /api/listener/[id]/slots?mins=16&type=text — bookable start times (UTC ISO)
// for the next BOOKING_HORIZON_DAYS, plus the price. Public: no personal data.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  if (!UUID_RE.test(params.id)) return NextResponse.json({ error: 'Invalid listener id' }, { status: 400 })
  const sp = new URL(req.url).searchParams
  const asked = Number(sp.get('mins'))
  const mins = (SESSION_DURATIONS as readonly number[]).includes(asked) ? asked : SESSION_DURATIONS[0]
  const type = sp.get('type') === 'voice' ? 'voice' : 'text'
  const sb = createAdminClient()
  const slots = await loadListenerSlots(sb, params.id, mins)
  if (slots === null) return NextResponse.json({ error: 'Listener not found' }, { status: 404 })
  const { data: lp } = await sb.from('listener_profiles').select('rate_per_min, voice_disabled').eq('user_id', params.id).maybeSingle()
  if (type === 'voice' && (lp as { voice_disabled?: boolean } | null)?.voice_disabled) {
    return NextResponse.json({ slots: [], mins, type, error: 'voice_disabled' })
  }
  const { total } = quoteSession(Number(lp?.rate_per_min ?? DEFAULT_LISTENER_RATE), type, mins, false)
  return NextResponse.json({ slots, mins, type, pricePence: total, priceLabel: getBookingPriceDisplay(total) },
    { headers: { 'Cache-Control': 'no-store' } })
}
