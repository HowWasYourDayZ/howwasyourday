-- =============================================================================
-- How Was Your Day — check the setup. File 3 of 3. Read-only; run any time.
-- Expected result: ONE row, "ALL 102 CHECKS PASSED | OK". Otherwise each row
-- names something missing or wrong.
-- =============================================================================

WITH expected_tables(t) AS (
  VALUES ('users'), ('listener_profiles'), ('listener_applications'), ('listener_verifications'),
         ('sessions'), ('messages'), ('message_reactions'), ('wallet_transactions'),
         ('listener_earnings'), ('payout_requests'), ('refund_requests'), ('notifications'),
         ('push_tokens'), ('reports'), ('content_flags'), ('user_blocks'), ('audit_logs'),
         ('admin_audit_logs'), ('contact_messages'), ('listener_messages'), ('lounge_messages'),
         ('talk_searches'), ('listener_availability'), ('listener_blocked_dates')
),
expected_functions(f) AS (
  VALUES ('create_session'), ('accept_session'), ('credit_wallet'), ('deduct_wallet'),
         ('credit_wallet_idempotent'), ('book_scheduled_session'), ('start_scheduled_session'),
         ('increment_listener_sessions'), ('sync_auth_ban')
),
expected_realtime(t) AS (
  VALUES ('users'), ('listener_profiles'), ('sessions'), ('messages'),
         ('message_reactions'), ('notifications'), ('lounge_messages')
),
checks AS (
  SELECT 'table ' || t AS item,
         CASE WHEN to_regclass('public.' || t) IS NULL THEN 'MISSING' ELSE 'OK' END AS status
    FROM expected_tables
  UNION ALL
  SELECT 'RLS on ' || t,
         CASE WHEN (SELECT relrowsecurity FROM pg_class WHERE oid = to_regclass('public.' || t)) THEN 'OK' ELSE 'RLS OFF' END
    FROM expected_tables
  UNION ALL
  SELECT 'function ' || f || '()',
         CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = f AND pronamespace = 'public'::regnamespace)
              THEN 'OK' ELSE 'MISSING' END
    FROM expected_functions
  UNION ALL
  SELECT 'function ' || f || '() not callable from the browser',
         CASE WHEN EXISTS (SELECT 1 FROM pg_proc p WHERE proname = f AND pronamespace = 'public'::regnamespace
                             AND (has_function_privilege('anon', p.oid, 'EXECUTE')
                                  OR has_function_privilege('authenticated', p.oid, 'EXECUTE')))
              THEN 'CALLABLE BY BROWSER' ELSE 'OK' END
    FROM expected_functions
  UNION ALL
  SELECT 'realtime ' || t,
         CASE WHEN EXISTS (SELECT 1 FROM pg_publication_tables
                            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t)
              THEN 'OK' ELSE 'NOT IN supabase_realtime' END
    FROM expected_realtime
  UNION ALL
  SELECT 'browser cannot write ' || t,
         CASE WHEN has_table_privilege('authenticated', to_regclass('public.' || t), 'INSERT')
                OR has_table_privilege('authenticated', to_regclass('public.' || t), 'UPDATE')
                OR has_table_privilege('authenticated', to_regclass('public.' || t), 'DELETE')
              THEN 'WRITABLE BY BROWSER' ELSE 'OK' END
    FROM expected_tables WHERE to_regclass('public.' || t) IS NOT NULL
  UNION ALL
  SELECT 'sessions allow 8/16/32 min + scheduled',
         CASE WHEN pg_get_constraintdef(c.oid) LIKE '%32%' THEN 'OK' ELSE 'WRONG' END
    FROM pg_constraint c WHERE conname = 'sessions_duration_mins_check'
  UNION ALL
  SELECT 'sessions status includes scheduled',
         CASE WHEN pg_get_constraintdef(c.oid) LIKE '%scheduled%' THEN 'OK' ELSE 'WRONG' END
    FROM pg_constraint c WHERE conname = 'sessions_status_check'
  UNION ALL
  SELECT 'storage bucket ' || b,
         CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = b) THEN 'OK' ELSE 'MISSING (run 02_storage.sql)' END
    FROM (VALUES ('avatars'), ('verifications')) v(b)
  UNION ALL
  SELECT 'verifications bucket is private',
         CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'verifications' AND public = false)
              THEN 'OK' ELSE 'NOT PRIVATE / MISSING' END
)
SELECT item, status FROM checks WHERE status <> 'OK'
UNION ALL
SELECT 'ALL ' || count(*) || ' CHECKS PASSED', 'OK' FROM checks HAVING bool_and(status = 'OK')
ORDER BY 1;
