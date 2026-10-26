# Scheduled sessions — design and operations

Decided 2026-10-25 (PROJECT.md §8.4): built in-house, Supabase is the system of
record, Google Calendar is only an export. Migration **077** must be run first.

## Pieces

| Piece | Where |
|---|---|
| Policy constants (buffer, lead time, no-show minutes, refund shares) | `lib/scheduling.ts` |
| Slot generation, UK-time (BST-aware) conversion, .ics + Google Calendar link | `lib/scheduling.ts` |
| Lifecycle: cancel/refund, join/start, no-shows, reminders, instant-session conflicts | `lib/scheduled-sessions.ts` |
| Weekly hours + days off (listener) | `GET/PUT /api/listener/schedule`, `app/components/WeeklyHours.tsx` (dashboard) |
| Slots for a listener | `GET /api/listener/[id]/slots?mins=&type=`, `app/components/BookATime.tsx` (profile) |
| Book | `POST /api/sessions/schedule` → RPC `book_scheduled_session` (lock + overlap check + wallet hold) |
| Join / start | `POST /api/sessions/[id]/join` (session page polls every 15 s) → RPC `start_scheduled_session` |
| Cancel | `POST /api/sessions/[id]/cancel` |
| Calendar file | `GET /api/sessions/[id]/ics` |
| Upcoming list | `GET /api/sessions/upcoming`, `app/components/UpcomingSessions.tsx` (/sessions, dashboard) |
| Reminders + no-shows | `GET /api/sessions/scheduled-tick` (Bearer `CRON_SECRET`), run every 5 min by `.github/workflows/scheduled-tick.yml` |

## Lifecycle

`scheduled` (money held) → **`active`** when both have joined (the timer starts
then; the normal settlement, ending and rating flow takes over) → `completed`.

Or `scheduled` → `cancelled` with `cancel_reason`:

| cancel_reason | When | Refund to seeker |
|---|---|---|
| `seeker_cancelled_scheduled` | seeker cancels before the start | full if ≥ 2 h before; later: `SEEKER_LATE_CANCEL_REFUND_SHARE` (currently 1 = full) |
| `listener_cancelled` | listener cancels before the start | full |
| `listener_no_show` | listener not joined 5 min after the start | full |
| `seeker_no_show` | listener joined, seeker not joined 10 min after the start | `SEEKER_NO_SHOW_REFUND_SHARE` (currently 1 = full) |
| `start_failed` | both joined but it couldn't start, booked time over | full |

Every transition is a conditional update on `status = 'scheduled'`, so a refund
never runs twice. **Owner decision pending:** charging late cancellations /
seeker no-shows. Setting a share below 1 also needs the kept part paid to the
listener through settlement — not built yet.

## Rules

- Times are stored in UTC, entered and shown in UK time (Europe/London).
- Slots: on a 15-minute grid, inside the listener's windows, not on a day off,
  2 hours to 14 days ahead, 10 minutes clear of other bookings.
- A listener is not offered for instant requests (Talk now, booking, accept)
  from 15 minutes before a booking until it ends.
- Calendar exports have a neutral title and no names or topic.
- Account deletion is refused while a booking exists (money is held).

## Setup

1. Run migration `077_scheduled_sessions.sql` (after 073–076) and refresh `db/LIVE_SCHEMA.md`.
2. Add repo secret `CRON_SECRET` (same value as Vercel) so the 5-minute tick runs.
3. Make sure `RESEND_API_KEY` is set for confirmation / reminder emails (Google sign-in users have an email).
