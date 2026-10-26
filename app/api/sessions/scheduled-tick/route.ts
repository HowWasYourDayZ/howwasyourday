import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { processScheduled } from '@/lib/scheduled-sessions'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// Scheduled-session housekeeping: reminders (24 h, 15 min) and no-shows.
// Called every ~5 minutes by .github/workflows/scheduled-tick.yml (Vercel's free
// plan only allows a daily cron) with `Authorization: Bearer $CRON_SECRET`.
// No-shows are ALSO settled lazily when someone opens / joins a booking.
async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await processScheduled(createAdminClient())
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    logger.error('scheduled-tick failed', { error: err instanceof Error ? err.message : String(err) })
    return NextResponse.json({ error: 'tick failed' }, { status: 500 })
  }
}
export const GET = handle
export const POST = handle
