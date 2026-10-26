-- 077_scheduled_sessions.sql — book a session for a future time (PROJECT.md §8.4,
-- decided 2026-10-25). Built in-house: Supabase is the system of record; Google
-- Calendar is only an export (.ics / "Add to calendar").
--
-- * sessions.status gains 'scheduled' (funds held, waiting for the start time).
--   'scheduled' → 'active' when BOTH people have joined (start_scheduled_session),
--   or → 'cancelled' (cancel_reason seeker_cancelled_scheduled / listener_cancelled /
--   listener_no_show / seeker_no_show) with a refund done by the API.
-- * listener_availability: weekly windows in UK local time (Europe/London),
--   minutes from midnight. listener_blocked_dates: whole days off.
-- * book_scheduled_session(): ONE transaction that locks the listener's bookings
--   (advisory lock) and the seeker's wallet row, refuses overlaps, inserts the
--   session with its locked rates, and holds the money (PROJECT.md §9.2).
-- All writes go through server routes with the service role; the new tables have
-- RLS on and no policies, so browsers can't read or write them directly.

-- 1. Status + columns ---------------------------------------------------------
ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS sessions_status_check;
ALTER TABLE public.sessions ADD CONSTRAINT sessions_status_check
  CHECK (status = ANY (ARRAY['pending', 'scheduled', 'active', 'completed', 'cancelled']));

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS scheduled_start_at   timestamptz,
  ADD COLUMN IF NOT EXISTS seeker_joined_at     timestamptz,
  ADD COLUMN IF NOT EXISTS listener_joined_at   timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_24h_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS reminder_15m_sent_at timestamptz;

CREATE INDEX IF NOT EXISTS sessions_scheduled_listener_idx
  ON public.sessions (listener_id, scheduled_start_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS sessions_scheduled_seeker_idx
  ON public.sessions (seeker_id, scheduled_start_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS sessions_scheduled_start_idx
  ON public.sessions (scheduled_start_at) WHERE status = 'scheduled';

-- 2. Listener availability ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.listener_availability (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  weekday     smallint NOT NULL CHECK (weekday BETWEEN 1 AND 7),   -- ISO: 1 = Monday
  start_min   integer  NOT NULL CHECK (start_min BETWEEN 0 AND 1425),
  end_min     integer  NOT NULL CHECK (end_min BETWEEN 15 AND 1440),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (start_min < end_min)
);
CREATE INDEX IF NOT EXISTS listener_availability_listener_idx ON public.listener_availability (listener_id);
ALTER TABLE public.listener_availability ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.listener_blocked_dates (
  listener_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day         date NOT NULL,                                       -- UK local date
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listener_id, day)
);
ALTER TABLE public.listener_blocked_dates ENABLE ROW LEVEL SECURITY;

-- 3. Atomic booking -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.book_scheduled_session(
  p_seeker_id        uuid,
  p_listener_id      uuid,
  p_session_type     text,
  p_duration_mins    int,
  p_amount_held      integer,
  p_platform_fee     integer,
  p_rate_per_min     integer,
  p_service_fee_rate numeric,
  p_start_at         timestamptz,
  p_buffer_mins      int,
  p_agora_channel    text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_session_id uuid;
  v_balance    numeric;
  v_end        timestamptz := p_start_at + make_interval(mins => p_duration_mins);
  v_buf        interval    := make_interval(mins => p_buffer_mins);
BEGIN
  IF p_start_at <= now() THEN
    RAISE EXCEPTION 'slot_in_past' USING ERRCODE = 'P0010';
  END IF;

  -- Serialise bookings per listener so two seekers can't take the same slot.
  PERFORM pg_advisory_xact_lock(hashtextextended('hwyd-booking:' || p_listener_id::text, 0));

  -- Lock the seeker's wallet row (same as create_session).
  SELECT wallet_balance INTO v_balance FROM users WHERE id = p_seeker_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount_held THEN
    RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = 'P0001';
  END IF;

  -- Listener: no other booking within the buffer either side.
  IF EXISTS (
    SELECT 1 FROM sessions
     WHERE listener_id = p_listener_id
       AND status = 'scheduled'
       AND scheduled_start_at < v_end + v_buf
       AND scheduled_start_at + make_interval(mins => duration_mins) > p_start_at - v_buf
  ) THEN
    RAISE EXCEPTION 'slot_taken' USING ERRCODE = 'P0011';
  END IF;

  -- Seeker: no two of their own bookings at the same time.
  IF EXISTS (
    SELECT 1 FROM sessions
     WHERE seeker_id = p_seeker_id
       AND status = 'scheduled'
       AND scheduled_start_at < v_end
       AND scheduled_start_at + make_interval(mins => duration_mins) > p_start_at
  ) THEN
    RAISE EXCEPTION 'seeker_overlap' USING ERRCODE = 'P0012';
  END IF;

  INSERT INTO sessions (
    seeker_id, listener_id, session_type, duration_mins,
    amount_held, platform_fee, is_free_trial, agora_channel,
    status, started_at, scheduled_start_at,
    listener_rate_per_min, service_fee_rate, booked_via
  ) VALUES (
    p_seeker_id, p_listener_id, p_session_type, p_duration_mins,
    p_amount_held, p_platform_fee, false, p_agora_channel,
    'scheduled', NULL, p_start_at,
    p_rate_per_min, p_service_fee_rate, 'scheduled'
  ) RETURNING id INTO v_session_id;

  UPDATE users SET wallet_balance = wallet_balance - p_amount_held
   WHERE id = p_seeker_id AND wallet_balance >= p_amount_held;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = 'P0001';
  END IF;

  RETURN v_session_id;
END;
$$;
REVOKE ALL ON FUNCTION public.book_scheduled_session(uuid, uuid, text, int, integer, integer, integer, numeric, timestamptz, int, text) FROM PUBLIC, anon, authenticated;

-- 4. Start when both have joined ----------------------------------------------
CREATE OR REPLACE FUNCTION public.start_scheduled_session(p_session_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE sessions
     SET status = 'active', started_at = now(), responded_at = now()
   WHERE id = p_session_id
     AND status = 'scheduled'
     AND seeker_joined_at IS NOT NULL
     AND listener_joined_at IS NOT NULL;
  RETURN FOUND;
END;
$$;
REVOKE ALL ON FUNCTION public.start_scheduled_session(uuid) FROM PUBLIC, anon, authenticated;
