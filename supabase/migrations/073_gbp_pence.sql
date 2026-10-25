-- 073_gbp_pence.sql — How Was Your Day runs in GBP, and every money column
-- stores an INTEGER number of PENCE (see lib/money.ts). The column types do
-- not change (numeric/integer already hold whole numbers); only the listener
-- rate range and default move to pence values.
--
--   rate_per_min: 10p … 500p (£5) per minute, default 40p   (lib/constants.ts
--   MIN_LISTENER_RATE / MAX_LISTENER_RATE / DEFAULT_LISTENER_RATE)
--
-- Run on a FRESH database only. Existing LeanOn rows hold rupees and must not
-- be reinterpreted as pence. Afterwards refresh db/LIVE_SCHEMA.md.

ALTER TABLE public.listener_profiles
  DROP CONSTRAINT IF EXISTS lp_rate_range;

ALTER TABLE public.listener_profiles
  ALTER COLUMN rate_per_min SET DEFAULT 40;

ALTER TABLE public.listener_profiles
  ADD CONSTRAINT lp_rate_range CHECK (rate_per_min >= 10 AND rate_per_min <= 500);
