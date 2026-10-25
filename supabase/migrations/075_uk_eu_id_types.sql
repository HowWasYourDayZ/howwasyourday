-- 075_uk_eu_id_types.sql — listener identity documents for UK/EU listeners.
-- Adds 'national_id_card' and 'residence_permit'; the Indian types stay in the
-- check so no existing row can fail it, but the app no longer offers them
-- (app/become-listener/verify/page.tsx, app/api/listener/verify/route.ts).

ALTER TABLE public.listener_verifications
  DROP CONSTRAINT IF EXISTS listener_verifications_id_type_check;

ALTER TABLE public.listener_verifications
  ADD CONSTRAINT listener_verifications_id_type_check
  CHECK (id_type IN ('passport', 'driving_license', 'national_id_card', 'residence_permit',
                     'aadhaar', 'pan', 'voter_id'));
