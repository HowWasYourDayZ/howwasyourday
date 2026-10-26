# LeanOn migration history — archive, NEVER RUN

These 83 files patched LeanOn's database over time. How Was Your Day's database
was built from `supabase/setup/01_schema.sql`, which already contains their end
result (converted to pence, 8/16/32-minute and scheduled sessions). Running any of
them on How Was Your Day's database would damage it (several drop and recreate
tables or policies, and several hold rupee values).

Kept only so that code comments like "migration 068" can still be looked up.
