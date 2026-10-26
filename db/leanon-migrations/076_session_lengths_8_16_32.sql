-- 076_session_lengths_8_16_32.sql — paid-only 8 / 16 / 32-minute sessions
-- (PROJECT.md §5, 2026-10-25). No free sessions; 8 minutes is the minimum.
-- Mirrors SESSION_DURATIONS in lib/constants.ts. Fresh database only (like 073).

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_duration_mins_check;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_duration_mins_check
  CHECK (duration_mins = ANY (ARRAY[8, 16, 32]));
