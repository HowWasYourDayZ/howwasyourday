-- 074_sensitive_data_consent.sql — UK/EU GDPR Art. 9(2)(a).
-- When a user first gave explicit consent, on the sign-in page, to How Was
-- Your Day processing sensitive (health-related) information they share.
-- Written server-side only (lib/consent-record.ts, service role) on sign-in;
-- NULL = consent not yet recorded. Withdrawal = account deletion.
-- The users_guard_privileged_cols trigger (025) blocks browser writes to
-- privileged columns; this column is never written from the browser.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS sensitive_data_consent_at timestamptz;
