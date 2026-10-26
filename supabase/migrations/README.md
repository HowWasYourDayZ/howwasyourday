# supabase/migrations

**Files `001_…` to `077_…`, `2025*` and `999_…` are LeanOn's history. Do not run them.**

They record how LeanOn's production database was patched over time, with
duplicates, re-orderings and drift. How Was Your Day's database was built in one
step from [`../setup/`](../setup/) (see [`docs/SUPABASE_SETUP.md`](../../docs/SUPABASE_SETUP.md)),
whose `01_schema.sql` is the end state of all of them. They stay here because code
comments and docs refer to them by number ("migration 068").

New schema changes go here as `078_<what>.sql`, `079_…`. The owner runs each one
in the SQL Editor, then refreshes `db/LIVE_SCHEMA.md`.
