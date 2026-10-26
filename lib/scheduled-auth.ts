import { NextResponse } from 'next/server'
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase-server'
import { UUID_RE } from '@/lib/constants'
import { SCHEDULED_COLUMNS, type ScheduledRow } from '@/lib/scheduled-sessions'

// Load a session for one of its two participants (server routes only).
export async function loadOwnSession(id: string): Promise<
  { error: NextResponse } | { userId: string; side: 'seeker' | 'listener'; s: ScheduledRow; sb: ReturnType<typeof createAdminClient> }
> {
  if (!UUID_RE.test(id)) return { error: NextResponse.json({ error: 'Invalid session id' }, { status: 400 }) }
  const { data: { user } } = await createServerSupabaseClient().auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Not authenticated' }, { status: 401 }) }
  const sb = createAdminClient()
  const { data } = await sb.from('sessions').select(SCHEDULED_COLUMNS).eq('id', id).maybeSingle()
  const s = data as ScheduledRow | null
  if (!s) return { error: NextResponse.json({ error: 'Session not found' }, { status: 404 }) }
  const side = user.id === s.seeker_id ? 'seeker' : user.id === s.listener_id ? 'listener' : null
  if (!side) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) }
  return { userId: user.id, side, s, sb }
}
