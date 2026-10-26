-- =============================================================================
-- How Was Your Day — complete database schema for a NEW Supabase project
-- File 1 of 3. Run it in Supabase Dashboard → SQL Editor (as the default
-- `postgres` role). Full guide: docs/SUPABASE_SETUP.md
--
-- This ONE file replaces the 83 historical legacy files archived in db/legacy-migrations/
-- (001 … 077, 2025*, 999). Those describe how the legacy production database
-- was patched over time; never run them on this project. This file is the
-- end state of all of them (db/LIVE_SCHEMA.md + migrations 041–077), cleaned up:
--   * money is INTEGER PENCE (GBP); rate 10p–500p/min, default 40p (073)
--   * sessions are 8 / 16 / 32 minutes (076) and can be 'scheduled' (077)
--   * GDPR Art. 9 consent timestamp on users (074); UK/EU ID types (075)
--   * the browser can only READ (RLS-scoped). Every write goes through the
--     server's service-role client or a SECURITY DEFINER function — the rule in
--     CLAUDE.md, enforced here by grants instead of by many write policies.
--   * duplicate policies / triggers / indexes from the legacy history removed.
--
-- It runs as one transaction: if anything fails, nothing is created and you
-- can fix the problem and run it again. It refuses to run twice.
-- =============================================================================

BEGIN;

DO $$
BEGIN
  IF to_regclass('public.users') IS NOT NULL THEN
    RAISE EXCEPTION 'public.users already exists — this script is for a brand-new, empty project. Nothing was changed.';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Helper functions
-- ─────────────────────────────────────────────────────────────────────────────

-- True when the request uses the service-role key (server API routes).
CREATE FUNCTION public.is_service_role()
RETURNS boolean LANGUAGE sql STABLE
SET search_path = public, pg_temp AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
    ''
  ) = 'service_role';
$$;

-- True for requests made with a signed-in user's (or anon) token; false for the
-- service role and for the SQL Editor (no JWT at all).
CREATE FUNCTION public.is_end_user_request()
RETURNS boolean LANGUAGE sql STABLE
SET search_path = public, pg_temp AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
    ''
  ) IN ('authenticated', 'anon');
$$;

CREATE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql
SET search_path = public, pg_temp AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- users: one row per person. id = auth.users.id, but deliberately NO foreign
-- key to auth.users (see CLAUDE.md / lib/ensure-user-row.ts).
CREATE TABLE public.users (
  id                        uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                     text        CONSTRAINT users_phone_key UNIQUE,
  email                     text,
  name                      text,
  avatar_url                text,
  gender                    text        CONSTRAINT users_gender_check
                                        CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  role                      text        NOT NULL DEFAULT 'seeker'
                                        CONSTRAINT users_role_check CHECK (role IN ('seeker', 'listener', 'admin')),
  wallet_balance            numeric     NOT NULL DEFAULT 0          -- pence
                                        CONSTRAINT wallet_balance_non_negative CHECK (wallet_balance >= 0),
  is_active                 boolean     NOT NULL DEFAULT true,
  is_admin                  boolean     NOT NULL DEFAULT false,
  is_suspended              boolean     NOT NULL DEFAULT false,
  fcm_token                 text,                                   -- legacy single token; push_tokens is primary
  account_country           text,                                   -- ISO 3166-1 alpha-2, informational only
  push_last_error           text,
  push_last_error_at        timestamptz,
  sensitive_data_consent_at timestamptz,                            -- GDPR Art. 9 explicit consent (074)
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX users_account_country_idx ON public.users (account_country);

CREATE TABLE public.listener_profiles (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL CONSTRAINT listener_profiles_user_id_key UNIQUE
                                      REFERENCES public.users(id) ON DELETE CASCADE,
  bio                     text        NOT NULL DEFAULT '',
  specialty_tags          text[]      NOT NULL DEFAULT '{}',
  languages_spoken        text[]      NOT NULL DEFAULT '{english}',
  rate_per_min            numeric     NOT NULL DEFAULT 40           -- TEXT rate in pence/min (073)
                                      CONSTRAINT lp_rate_range CHECK (rate_per_min >= 10 AND rate_per_min <= 500),
  custom_service_fee_rate numeric(5,4) CHECK (custom_service_fee_rate IS NULL OR (custom_service_fee_rate >= 0 AND custom_service_fee_rate <= 1)),
  is_available            boolean     NOT NULL DEFAULT false,
  is_approved             boolean     NOT NULL DEFAULT false,
  is_active               boolean     NOT NULL DEFAULT true,
  is_verified             boolean     NOT NULL DEFAULT false,
  is_suspended            boolean     NOT NULL DEFAULT false,
  is_in_session           boolean     NOT NULL DEFAULT false,
  voice_disabled          boolean     NOT NULL DEFAULT false,
  rating                  numeric     NOT NULL DEFAULT 0,
  total_sessions          integer     NOT NULL DEFAULT 0,
  total_minutes           integer     NOT NULL DEFAULT 0,
  last_heartbeat_at       timestamptz,
  pending_avatar_url      text,                                     -- display photo awaiting admin review
  profile_photos          text[]      DEFAULT '{}',                 -- legacy gallery, no longer shown
  birth_year              smallint    CONSTRAINT listener_profiles_birth_year_chk
                                      CHECK (birth_year IS NULL OR birth_year BETWEEN 1920 AND 2015),
  birth_month             smallint    CONSTRAINT listener_profiles_birth_month_chk
                                      CHECK (birth_month IS NULL OR birth_month BETWEEN 1 AND 12),
  education_level         text,
  education_field         text,
  tagline_phrases         text[]      DEFAULT '{}',
  lived_experience        text,
  account_holder_name     text,
  bank_account            text,
  ifsc_code               text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lp_approved   ON public.listener_profiles (is_approved, is_available, rating DESC);
CREATE INDEX idx_lp_languages  ON public.listener_profiles USING gin (languages_spoken);
CREATE INDEX idx_lp_tags       ON public.listener_profiles USING gin (specialty_tags);
CREATE INDEX idx_lp_suspended  ON public.listener_profiles (is_suspended) WHERE is_suspended = true;

-- Payout details + private screening answers. Admin-only except the owner's
-- own row. (The aadhaar* / ifsc_code / upi_id columns are legacy leftovers the
-- code still reads; they stay empty until Whop payouts replace them.)
CREATE TABLE public.listener_applications (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL CONSTRAINT listener_applications_user_id_key UNIQUE
                                  REFERENCES public.users(id) ON DELETE CASCADE,
  name                text,
  phone               text,
  status              text        NOT NULL DEFAULT 'pending'
                                  CONSTRAINT listener_applications_status_check
                                  CHECK (status IN ('pending', 'approved', 'rejected', 'needs_resubmission')),
  admin_notes         text,
  screening           jsonb,
  account_holder_name text,
  bank_account        text,
  ifsc_code           text,
  upi_id              text,
  aadhaar             text,
  aadhaar_last4       text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.listener_verifications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id    uuid        NOT NULL CONSTRAINT listener_verifications_listener_id_key UNIQUE
                             REFERENCES public.users(id) ON DELETE CASCADE,
  full_name      text        NOT NULL,
  id_type        text        NOT NULL CONSTRAINT listener_verifications_id_type_check
                             CHECK (id_type IN ('passport', 'driving_license', 'national_id_card', 'residence_permit',
                                                'aadhaar', 'pan', 'voter_id')),
  id_number_hash text        NOT NULL,
  selfie_url     text,
  id_doc_url     text,
  status         text        NOT NULL DEFAULT 'pending'
                             CONSTRAINT listener_verifications_status_check
                             CHECK (status IN ('pending', 'approved', 'rejected', 'needs_resubmission')),
  admin_notes    text,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  reviewed_at    timestamptz,
  reviewed_by    uuid        REFERENCES public.users(id)
);
CREATE INDEX listener_verifications_status_idx ON public.listener_verifications (status);

CREATE TABLE public.sessions (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id             uuid        NOT NULL REFERENCES public.users(id),
  listener_id           uuid        NOT NULL REFERENCES public.users(id),
  session_type          text        NOT NULL CONSTRAINT sessions_session_type_check
                                    CHECK (session_type IN ('text', 'voice')),
  duration_mins         integer     NOT NULL CONSTRAINT sessions_duration_mins_check
                                    CHECK (duration_mins IN (8, 16, 32)),
  status                text        NOT NULL DEFAULT 'pending' CONSTRAINT sessions_status_check
                                    CHECK (status IN ('pending', 'scheduled', 'active', 'completed', 'cancelled')),
  amount_held           numeric     NOT NULL DEFAULT 0              -- pence, seeker's full price
                                    CONSTRAINT sessions_amount_held_non_negative CHECK (amount_held >= 0),
  platform_fee          numeric     NOT NULL DEFAULT 0              -- pence, the seeker's flat £1
                                    CONSTRAINT sessions_platform_fee_nonneg CHECK (platform_fee >= 0),
  listener_rate_per_min integer,                                    -- per-mode rate locked at booking
  service_fee_rate      numeric(5,4) CHECK (service_fee_rate IS NULL OR (service_fee_rate >= 0 AND service_fee_rate <= 1)),
  is_free_trial         boolean     NOT NULL DEFAULT false,         -- only TEST_UNLIMITED_PHONES
  agora_channel         text,
  started_at            timestamptz,
  ended_at              timestamptz,
  responded_at          timestamptz,
  cancel_reason         text,
  ended_by              text,
  booked_via            text,
  talk_search_id        uuid,
  request_push          jsonb,
  seeker_rating         smallint    CONSTRAINT sessions_seeker_rating_check CHECK (seeker_rating BETWEEN 1 AND 5),
  seeker_review         text,
  crisis_flagged        boolean     NOT NULL DEFAULT false,
  crisis_flagged_at     timestamptz,
  seeker_last_seen      timestamptz,
  listener_last_seen    timestamptz,
  scheduled_start_at    timestamptz,                                -- scheduled sessions (077)
  seeker_joined_at      timestamptz,
  listener_joined_at    timestamptz,
  reminder_24h_sent_at  timestamptz,
  reminder_15m_sent_at  timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_seeker_id        ON public.sessions (seeker_id);
CREATE INDEX idx_sessions_listener_id      ON public.sessions (listener_id);
CREATE INDEX idx_sessions_status           ON public.sessions (status);
CREATE INDEX idx_sessions_started_at       ON public.sessions (started_at DESC);
CREATE INDEX idx_sessions_listener_active  ON public.sessions (listener_id, status) WHERE status = 'active';
CREATE INDEX idx_sessions_listener_pending ON public.sessions (listener_id, created_at DESC) WHERE status = 'pending';
CREATE INDEX sessions_crisis_idx           ON public.sessions (crisis_flagged) WHERE crisis_flagged = true;
CREATE INDEX sessions_talk_search_idx      ON public.sessions (talk_search_id) WHERE talk_search_id IS NOT NULL;
CREATE INDEX sessions_booked_via_created_idx ON public.sessions (booked_via, created_at) WHERE booked_via IS NOT NULL;
CREATE INDEX sessions_scheduled_listener_idx ON public.sessions (listener_id, scheduled_start_at) WHERE status = 'scheduled';
CREATE INDEX sessions_scheduled_seeker_idx   ON public.sessions (seeker_id, scheduled_start_at) WHERE status = 'scheduled';
CREATE INDEX sessions_scheduled_start_idx    ON public.sessions (scheduled_start_at) WHERE status = 'scheduled';
-- Nobody can be in two live sessions at once.
CREATE UNIQUE INDEX sessions_listener_one_active ON public.sessions (listener_id) WHERE status = 'active' AND is_free_trial = false;
CREATE UNIQUE INDEX sessions_seeker_one_active   ON public.sessions (seeker_id)   WHERE status = 'active';

CREATE TABLE public.messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  sender_id  uuid        NOT NULL REFERENCES public.users(id),
  content    text        NOT NULL,
  is_flagged boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_session_created ON public.messages (session_id, created_at);

CREATE TABLE public.message_reactions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid        NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL,
  emoji      text        NOT NULL CONSTRAINT message_reactions_emoji_chk CHECK (emoji IN ('❤️', '🙏', '🫂', '😊')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT message_reactions_unique_per_user UNIQUE (message_id, user_id)
);
CREATE INDEX message_reactions_message_idx ON public.message_reactions (message_id);

CREATE TABLE public.wallet_transactions (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id),
  amount       numeric     NOT NULL,                                -- pence
  type         text        NOT NULL CONSTRAINT wallet_transactions_type_check
                           CHECK (type IN ('credit', 'debit', 'refund', 'gateway_fee')),
  description  text,
  reference_id text,                                                -- payment id; unique → idempotent top-ups
  session_id   uuid        REFERENCES public.sessions(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_wallet_txns_user_id ON public.wallet_transactions (user_id);
CREATE UNIQUE INDEX wallet_txn_payment_id_unique ON public.wallet_transactions (reference_id) WHERE reference_id IS NOT NULL;

CREATE TABLE public.listener_earnings (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_id     uuid        CONSTRAINT listener_earnings_session_id_key UNIQUE
                             REFERENCES public.sessions(id) ON DELETE SET NULL,
  gross_amount   integer     NOT NULL,                              -- pence held for the session
  platform_fee   integer     NOT NULL,                              -- How Was Your Day's TOTAL take (≠ sessions.platform_fee)
  net_amount     integer     NOT NULL CONSTRAINT earnings_net_positive CHECK (net_amount >= 0),
  listener_gross integer,
  service_fee    integer,
  status         text        NOT NULL DEFAULT 'settled' CONSTRAINT listener_earnings_status_check
                             CHECK (status IN ('pending', 'settled', 'held', 'disputed')),
  settled_at     timestamptz NOT NULL DEFAULT now(),
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX listener_earnings_listener_idx ON public.listener_earnings (listener_id, created_at DESC);

CREATE TABLE public.payout_requests (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES public.users(id),
  amount       integer     NOT NULL CONSTRAINT payout_amount_positive CHECK (amount > 0),
  status       text        NOT NULL DEFAULT 'pending' CONSTRAINT payout_requests_status_check
                           CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'completed', 'rejected')),
  upi_id       text,
  admin_notes  text,
  processed_at timestamptz,
  processed_by uuid        REFERENCES public.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payout_requests_user_idx ON public.payout_requests (user_id);

CREATE TABLE public.refund_requests (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES public.users(id),
  amount              integer     NOT NULL CONSTRAINT refund_amount_positive CHECK (amount > 0),
  reason              text,
  status              text        NOT NULL DEFAULT 'pending' CONSTRAINT refund_requests_status_check
                                  CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
  razorpay_payment_id text,                                         -- payment to refund (renamed when Whop lands)
  admin_notes         text,
  created_at          timestamptz NOT NULL DEFAULT now()
);
-- One pending refund per user (stops double refunds of the same payment).
CREATE UNIQUE INDEX refund_requests_one_pending_per_user ON public.refund_requests (user_id) WHERE status = 'pending';

CREATE TABLE public.notifications (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       text        NOT NULL,
  title      text        NOT NULL,
  body       text        NOT NULL,
  action_url text,
  is_read    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_unread_idx ON public.notifications (user_id, is_read, created_at DESC);

CREATE TABLE public.push_tokens (
  token        text        PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_agent   text,                                                -- 'native:android…' = the Play Store app
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX push_tokens_user_idx ON public.push_tokens (user_id, last_seen_at DESC);

-- Reports (incl. contact_attempt from lib/contact-guard.ts) — the admin queue.
CREATE TABLE public.reports (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id      uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  session_id       uuid        REFERENCES public.sessions(id) ON DELETE SET NULL,
  type             text        NOT NULL,
  description      text        NOT NULL,
  status           text        NOT NULL DEFAULT 'pending' CONSTRAINT reports_status_check
                               CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes      text,
  resolved_by      uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reports_reporter_idx ON public.reports (reporter_id);
CREATE INDEX reports_status_idx   ON public.reports (status);

CREATE TABLE public.content_flags (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id    uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  target_user_id uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  session_id     uuid        REFERENCES public.sessions(id) ON DELETE SET NULL,
  reason         text        NOT NULL CONSTRAINT content_flags_reason_check
                             CHECK (reason IN ('harassment', 'spam', 'inappropriate', 'self_harm', 'other')),
  details        text        CONSTRAINT content_flags_details_check CHECK (char_length(details) <= 1000),
  status         text        NOT NULL DEFAULT 'pending' CONSTRAINT content_flags_status_check
                             CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  resolved_by    uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX content_flags_reporter_idx ON public.content_flags (reporter_id);
CREATE INDEX content_flags_target_idx   ON public.content_flags (target_user_id);
CREATE INDEX content_flags_status_idx   ON public.content_flags (status);

CREATE TABLE public.user_blocks (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_blocker_id_blocked_id_key UNIQUE (blocker_id, blocked_id),
  CONSTRAINT user_blocks_check CHECK (blocker_id <> blocked_id)
);
CREATE INDEX user_blocks_blocked_idx ON public.user_blocks (blocked_id);

CREATE TABLE public.audit_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  action     text        NOT NULL,
  actor_id   uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  target_id  uuid,
  metadata   jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_logs_action_idx ON public.audit_logs (action);
CREATE INDEX audit_logs_actor_idx  ON public.audit_logs (actor_id);
CREATE INDEX audit_logs_time_idx   ON public.audit_logs (created_at DESC);

-- admin_id is NULL for the env-var admin (never a real users.id — dbUserIdOrNull()).
CREATE TABLE public.admin_audit_logs (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   uuid,
  action     text        NOT NULL,
  target_id  text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_admin ON public.admin_audit_logs (admin_id, created_at DESC);

CREATE TABLE public.contact_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text,
  email      text,
  type       text,
  message    text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Offline messages: a seeker leaves up to 2 short messages for an offline listener.
CREATE TABLE public.listener_messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id       uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  listener_id     uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  messages        text[]      NOT NULL DEFAULT '{}',
  is_read         boolean     NOT NULL DEFAULT false,
  read_at         timestamptz,
  last_invited_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listener_messages_pair_unique UNIQUE (seeker_id, listener_id)
);
CREATE INDEX listener_messages_listener_idx ON public.listener_messages (listener_id, is_read);
CREATE INDEX listener_messages_seeker_idx   ON public.listener_messages (seeker_id);

-- Listener Lounge: group chat for approved listeners.
CREATE TABLE public.lounge_messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id  uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  deleted_at timestamptz,
  deleted_by uuid        REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lounge_messages_created ON public.lounge_messages (created_at);

-- One row per Talk now search (analytics only).
CREATE TABLE public.talk_searches (
  id         uuid        PRIMARY KEY,                               -- generated by the /talk page
  seeker_id  uuid        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  free       boolean,
  candidates integer
);
CREATE INDEX talk_searches_created_idx ON public.talk_searches (created_at);

-- Scheduled sessions: weekly hours in UK local time, minutes from midnight.
CREATE TABLE public.listener_availability (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  listener_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  weekday     smallint    NOT NULL CHECK (weekday BETWEEN 1 AND 7),        -- ISO: 1 = Monday
  start_min   integer     NOT NULL CHECK (start_min BETWEEN 0 AND 1425),
  end_min     integer     NOT NULL CHECK (end_min BETWEEN 15 AND 1440),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (start_min < end_min)
);
CREATE INDEX listener_availability_listener_idx ON public.listener_availability (listener_id);

CREATE TABLE public.listener_blocked_dates (
  listener_id uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day         date        NOT NULL,                                     -- UK local date
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (listener_id, day)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Guard triggers (defence in depth: even a write that skips the API can't
--    change money, roles, approval or suspension)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TRIGGER users_set_updated_at             BEFORE UPDATE ON public.users                 FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER listener_profiles_updated_at     BEFORE UPDATE ON public.listener_profiles     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER listener_applications_updated_at BEFORE UPDATE ON public.listener_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER listener_messages_updated_at     BEFORE UPDATE ON public.listener_messages     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE FUNCTION public.guard_users_insert_cols()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  NEW.is_admin       := false;
  NEW.role           := 'seeker';
  NEW.wallet_balance := 0;
  NEW.is_suspended   := false;
  NEW.is_active      := true;
  RETURN NEW;
END;
$$;
CREATE TRIGGER users_guard_insert BEFORE INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_users_insert_cols();

-- Everyone except the service role: privileged columns keep their old value.
-- This includes the SQL Editor — see CLAUDE.md for the deliberate way to make
-- a manual wallet adjustment.
CREATE FUNCTION public.guard_users_privileged_cols()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  IF public.is_end_user_request() THEN
    IF OLD.is_suspended
       OR EXISTS (SELECT 1 FROM public.listener_profiles lp WHERE lp.user_id = OLD.id AND lp.is_suspended) THEN
      RETURN OLD;
    END IF;
    NEW.avatar_url := OLD.avatar_url;
  END IF;
  NEW.is_admin       := OLD.is_admin;
  NEW.role           := OLD.role;
  NEW.wallet_balance := OLD.wallet_balance;
  NEW.is_suspended   := OLD.is_suspended;
  NEW.is_active      := OLD.is_active;
  RETURN NEW;
END;
$$;
CREATE TRIGGER users_guard_privileged BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_users_privileged_cols();

CREATE FUNCTION public.guard_lp_insert_cols()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  NEW.is_approved    := false;
  NEW.is_verified    := false;
  NEW.is_suspended   := false;
  NEW.rating         := 0;
  NEW.total_sessions := 0;
  RETURN NEW;
END;
$$;
CREATE TRIGGER lp_guard_insert BEFORE INSERT ON public.listener_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_lp_insert_cols();

CREATE FUNCTION public.guard_lp_privileged_cols()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_end_user_request() THEN
    RETURN OLD;   -- listener profiles change only through server routes
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER lp_guard_privileged BEFORE UPDATE ON public.listener_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_lp_privileged_cols();

CREATE FUNCTION public.guard_verif_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  NEW.status      := OLD.status;
  NEW.reviewed_by := OLD.reviewed_by;
  NEW.reviewed_at := OLD.reviewed_at;
  NEW.admin_notes := OLD.admin_notes;
  RETURN NEW;
END;
$$;
CREATE TRIGGER verif_guard_status BEFORE UPDATE ON public.listener_verifications
  FOR EACH ROW EXECUTE FUNCTION public.guard_verif_status();

CREATE FUNCTION public.guard_listener_app_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF public.is_service_role() THEN
    RETURN NEW;
  END IF;
  IF OLD.status IN ('rejected', 'needs_resubmission') AND NEW.status = 'pending' THEN
    NEW.admin_notes := OLD.admin_notes;
    RETURN NEW;
  END IF;
  NEW.status      := OLD.status;
  NEW.admin_notes := OLD.admin_notes;
  RETURN NEW;
END;
$$;
CREATE TRIGGER la_guard_status BEFORE UPDATE ON public.listener_applications
  FOR EACH ROW EXECUTE FUNCTION public.guard_listener_app_status();

-- Suspension → Supabase Auth ban + log out every device (068).
CREATE FUNCTION public.sync_auth_ban(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_suspended boolean;
BEGIN
  SELECT COALESCE((SELECT u.is_suspended FROM public.users u WHERE u.id = p_user_id), false)
      OR COALESCE((SELECT lp.is_suspended FROM public.listener_profiles lp WHERE lp.user_id = p_user_id), false)
    INTO v_suspended;
  IF v_suspended THEN
    UPDATE auth.users SET banned_until = now() + interval '100 years' WHERE id = p_user_id;
    DELETE FROM auth.sessions WHERE user_id = p_user_id;
  ELSE
    UPDATE auth.users SET banned_until = NULL WHERE id = p_user_id AND banned_until IS NOT NULL;
  END IF;
END;
$$;

CREATE FUNCTION public.trg_users_sync_auth_ban()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM public.sync_auth_ban(NEW.id);
  RETURN NULL;
END;
$$;
CREATE TRIGGER users_sync_auth_ban
  AFTER UPDATE OF is_suspended ON public.users
  FOR EACH ROW WHEN (OLD.is_suspended IS DISTINCT FROM NEW.is_suspended)
  EXECUTE FUNCTION public.trg_users_sync_auth_ban();

CREATE FUNCTION public.trg_lp_sync_auth_ban()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  PERFORM public.sync_auth_ban(NEW.user_id);
  RETURN NULL;
END;
$$;
CREATE TRIGGER lp_sync_auth_ban
  AFTER UPDATE OF is_suspended ON public.listener_profiles
  FOR EACH ROW WHEN (OLD.is_suspended IS DISTINCT FROM NEW.is_suspended)
  EXECUTE FUNCTION public.trg_lp_sync_auth_ban();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Money + session functions (called by server routes with the service role)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE FUNCTION public.credit_wallet(p_user_id uuid, p_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'credit_wallet: amount must be positive, got %', p_amount;
  END IF;
  UPDATE public.users SET wallet_balance = wallet_balance + p_amount WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
END;
$$;

CREATE FUNCTION public.deduct_wallet(p_user_id uuid, p_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_balance numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'deduct_wallet: amount must be positive, got %', p_amount;
  END IF;
  SELECT wallet_balance INTO v_balance FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance: has %, needs %', v_balance, p_amount;
  END IF;
  UPDATE public.users SET wallet_balance = wallet_balance - p_amount WHERE id = p_user_id;
END;
$$;

-- Top-up credit that can never double-credit: the ledger row (unique
-- reference_id) is inserted first; the balance moves only if it was new.
CREATE FUNCTION public.credit_wallet_idempotent(
  p_user_id uuid, p_amount integer, p_reference_id text, p_description text DEFAULT 'Wallet recharge'
)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_inserted integer;
  v_balance  numeric;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'credit_wallet_idempotent: amount must be positive, got %', p_amount;
  END IF;
  IF p_reference_id IS NULL OR p_reference_id = '' THEN
    RAISE EXCEPTION 'credit_wallet_idempotent: reference_id is required';
  END IF;
  INSERT INTO public.wallet_transactions (user_id, amount, type, description, reference_id)
  VALUES (p_user_id, p_amount, 'credit', p_description, p_reference_id)
  ON CONFLICT (reference_id) WHERE reference_id IS NOT NULL DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;
  IF v_inserted = 1 THEN
    UPDATE public.users SET wallet_balance = wallet_balance + p_amount
     WHERE id = p_user_id RETURNING wallet_balance INTO v_balance;
    IF v_balance IS NULL THEN
      RAISE EXCEPTION 'User not found: %', p_user_id;
    END IF;
  ELSE
    SELECT wallet_balance INTO v_balance FROM public.users WHERE id = p_user_id;
  END IF;
  RETURN v_balance;
END;
$$;

-- Instant request: inserts a PENDING session and holds the seeker's money.
CREATE FUNCTION public.create_session(
  p_seeker_id uuid, p_listener_id uuid, p_session_type text, p_duration_mins integer,
  p_amount_held numeric, p_platform_fee numeric, p_is_free_trial boolean, p_agora_channel text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id uuid;
  v_balance    numeric;
BEGIN
  SELECT wallet_balance INTO v_balance FROM users WHERE id = p_seeker_id FOR UPDATE;
  IF NOT p_is_free_trial AND (v_balance IS NULL OR v_balance < p_amount_held) THEN
    RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (SELECT 1 FROM sessions WHERE seeker_id = p_seeker_id AND status IN ('active', 'pending')) THEN
    RAISE EXCEPTION 'already_in_session' USING ERRCODE = 'P0002';
  END IF;
  IF NOT p_is_free_trial AND EXISTS (
    SELECT 1 FROM sessions
     WHERE listener_id = p_listener_id AND status IN ('active', 'pending') AND is_free_trial = false
  ) THEN
    RAISE EXCEPTION 'listener_busy' USING ERRCODE = 'P0003';
  END IF;
  INSERT INTO sessions (
    seeker_id, listener_id, session_type, duration_mins,
    amount_held, platform_fee, is_free_trial, agora_channel, status, started_at
  ) VALUES (
    p_seeker_id, p_listener_id, p_session_type, p_duration_mins,
    p_amount_held, p_platform_fee, p_is_free_trial, p_agora_channel, 'pending', NULL
  ) RETURNING id INTO v_session_id;
  IF NOT p_is_free_trial AND p_amount_held > 0 THEN
    UPDATE users SET wallet_balance = wallet_balance - p_amount_held
     WHERE id = p_seeker_id AND wallet_balance >= p_amount_held;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN v_session_id;
END;
$$;

CREATE FUNCTION public.accept_session(p_session_id uuid, p_listener_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE sessions SET status = 'active', started_at = now(), responded_at = now()
   WHERE id = p_session_id AND listener_id = p_listener_id AND status = 'pending';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session_not_found_or_already_handled' USING ERRCODE = 'P0004';
  END IF;
END;
$$;

-- Scheduled booking: one transaction, per-listener advisory lock, wallet row lock.
CREATE FUNCTION public.book_scheduled_session(
  p_seeker_id uuid, p_listener_id uuid, p_session_type text, p_duration_mins integer,
  p_amount_held integer, p_platform_fee integer, p_rate_per_min integer, p_service_fee_rate numeric,
  p_start_at timestamptz, p_buffer_mins integer, p_agora_channel text
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_session_id uuid;
  v_balance    numeric;
  v_end        timestamptz := p_start_at + make_interval(mins => p_duration_mins);
  v_buf        interval    := make_interval(mins => p_buffer_mins);
BEGIN
  IF p_start_at <= now() THEN
    RAISE EXCEPTION 'slot_in_past' USING ERRCODE = 'P0010';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('hwyd-booking:' || p_listener_id::text, 0));
  SELECT wallet_balance INTO v_balance FROM users WHERE id = p_seeker_id FOR UPDATE;
  IF v_balance IS NULL OR v_balance < p_amount_held THEN
    RAISE EXCEPTION 'insufficient_balance' USING ERRCODE = 'P0001';
  END IF;
  IF EXISTS (
    SELECT 1 FROM sessions
     WHERE listener_id = p_listener_id AND status = 'scheduled'
       AND scheduled_start_at < v_end + v_buf
       AND scheduled_start_at + make_interval(mins => duration_mins) > p_start_at - v_buf
  ) THEN
    RAISE EXCEPTION 'slot_taken' USING ERRCODE = 'P0011';
  END IF;
  IF EXISTS (
    SELECT 1 FROM sessions
     WHERE seeker_id = p_seeker_id AND status = 'scheduled'
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

CREATE FUNCTION public.start_scheduled_session(p_session_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE sessions SET status = 'active', started_at = now(), responded_at = now()
   WHERE id = p_session_id AND status = 'scheduled'
     AND seeker_joined_at IS NOT NULL AND listener_joined_at IS NOT NULL;
  RETURN FOUND;
END;
$$;

-- Atomic session counter (app/api/sessions/route.ts; it falls back if missing).
CREATE FUNCTION public.increment_listener_sessions(p_listener_id uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  UPDATE public.listener_profiles SET total_sessions = total_sessions + 1 WHERE user_id = p_listener_id;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Row Level Security — READ policies only. Tables without a policy (push
--    tokens, schedules, audit logs, contact messages, Talk now searches) are
--    invisible to browsers; only the server's service role can use them.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

CREATE POLICY users_select_own ON public.users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY users_select_listener_public ON public.users FOR SELECT
  USING (id IN (SELECT user_id FROM public.listener_profiles WHERE is_approved = true AND is_active = true));
-- Reads sessions; the sessions policy reads no other table, so no recursion (045).
CREATE POLICY users_select_session_participant ON public.users FOR SELECT
  USING (id IN (SELECT listener_id FROM public.sessions WHERE seeker_id = auth.uid()
                UNION
                SELECT seeker_id FROM public.sessions WHERE listener_id = auth.uid()));

CREATE POLICY lp_select_approved ON public.listener_profiles FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY la_select_own ON public.listener_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY listener_own_verification_select ON public.listener_verifications FOR SELECT
  USING (auth.uid() = listener_id);

-- Must never reference another table (see 045: users ↔ sessions cycle).
CREATE POLICY sessions_select_participant ON public.sessions FOR SELECT
  USING (seeker_id = auth.uid() OR listener_id = auth.uid());

CREATE POLICY messages_select_participants ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.sessions s
                  WHERE s.id = messages.session_id
                    AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid())));

CREATE POLICY message_reactions_select_participant ON public.message_reactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.messages m JOIN public.sessions s ON s.id = m.session_id
                  WHERE m.id = message_reactions.message_id
                    AND (s.seeker_id = auth.uid() OR s.listener_id = auth.uid())));

CREATE POLICY wallet_transactions_select_own ON public.wallet_transactions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY listener_own_earnings ON public.listener_earnings FOR SELECT
  USING (auth.uid() = listener_id);
CREATE POLICY payout_select_own ON public.payout_requests FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY refund_select_own ON public.refund_requests FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY notif_select_own ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY users_select_own_reports ON public.reports FOR SELECT
  USING (reporter_id = auth.uid());
CREATE POLICY users_select_own_flags ON public.content_flags FOR SELECT
  USING (reporter_id = auth.uid());
CREATE POLICY users_select_own_blocks ON public.user_blocks FOR SELECT
  USING (blocker_id = auth.uid());

CREATE POLICY lm_seeker_select ON public.listener_messages FOR SELECT
  USING (auth.uid() = seeker_id);
CREATE POLICY lm_listener_select ON public.listener_messages FOR SELECT
  USING (auth.uid() = listener_id);

-- Approved, active, non-suspended listeners only.
CREATE POLICY lounge_select ON public.lounge_messages FOR SELECT
  USING (
    deleted_at IS NULL
    AND EXISTS (SELECT 1 FROM public.listener_profiles
                 WHERE user_id = auth.uid() AND is_approved = true AND is_active = true AND is_suspended = false)
    AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_suspended = true)
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Grants. Browser keys (anon / authenticated) may only SELECT, and RLS
--    decides which rows. The service role (server only) may do everything.
--    Functions are callable by the service role only.
-- ─────────────────────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
REVOKE ALL ON public.lounge_messages FROM anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Realtime: the tables the pages subscribe to (postgres_changes). RLS still
--    applies — each browser only receives rows it can SELECT.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE t text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  FOREACH t IN ARRAY ARRAY['users', 'listener_profiles', 'sessions', 'messages',
                           'message_reactions', 'notifications', 'lounge_messages'] LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables
                    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.listener_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;

COMMIT;

SELECT 'How Was Your Day schema created — now run 02_storage.sql' AS result;
