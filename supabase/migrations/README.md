# supabase/migrations

How Was Your Day's schema changes **after** the initial setup go here, numbered
from `078_<what>.sql`, `079_…`. The owner runs each one in the Supabase SQL Editor,
then refreshes `db/LIVE_SCHEMA.md`.

- The database itself was built in one step from [`../setup/`](../setup/)
  ([`docs/SUPABASE_SETUP.md`](../../docs/SUPABASE_SETUP.md)).
- LeanOn's 83 old files (001–077, 2025*, 999) are archived in
  [`db/leanon-migrations/`](../../db/leanon-migrations/) for reference only
  (code comments cite them as "migration 068"). **Never run them.**
- Every new table: `ENABLE ROW LEVEL SECURITY` and
  `REVOKE INSERT, UPDATE, DELETE, TRUNCATE … FROM anon, authenticated`.
  Every new function: `REVOKE ALL … FROM PUBLIC, anon, authenticated`.
