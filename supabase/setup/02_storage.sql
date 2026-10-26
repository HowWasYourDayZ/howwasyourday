-- =============================================================================
-- How Was Your Day — storage buckets. File 2 of 3 (run after 01_schema.sql).
-- Safe to run more than once.
--
--   avatars        PUBLIC. Profile/display photos. The browser uploads its own
--                  file, named "<user id>.<anything>" (e.g. <uid>.display-<ts>.jpg);
--                  the server decides which URL goes live (photo review).
--   verifications  PRIVATE. Listener verification selfies (lib/selfie-storage.ts).
--                  No policies at all: only the server's service role can read or
--                  write; the admin sees selfies through short-lived signed URLs.
-- =============================================================================

-- No size/type limits on the buckets: the pages compress photos first, and
-- the selfie route checks type and size itself (lib + app/api/listener/selfie).
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',       'avatars',       true),
  ('verifications', 'verifications', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS avatars_public_read ON storage.objects;
CREATE POLICY avatars_public_read ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
CREATE POLICY avatars_insert_own ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND starts_with(name, auth.uid()::text || '.'));

DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
CREATE POLICY avatars_update_own ON storage.objects FOR UPDATE TO authenticated
  USING      (bucket_id = 'avatars' AND starts_with(name, auth.uid()::text || '.'))
  WITH CHECK (bucket_id = 'avatars' AND starts_with(name, auth.uid()::text || '.'));

DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
CREATE POLICY avatars_delete_own ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND starts_with(name, auth.uid()::text || '.'));

SELECT 'Storage buckets ready — now run 03_verify.sql' AS result;
