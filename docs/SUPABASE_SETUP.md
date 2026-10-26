# Supabase setup — new How Was Your Day project, step by step

How Was Your Day uses its **own new Supabase project**. It does not share LeanOn's
database. Everything the app needs is built by **three SQL files** in
`supabase/setup/`, run once in the Supabase SQL Editor:

| File | What it does | Expected result |
|---|---|---|
| `01_schema.sql` | 24 tables, constraints, indexes, guard triggers, money and session functions, Row Level Security, grants, Realtime | `How Was Your Day schema created — now run 02_storage.sql` |
| `02_storage.sql` | Two storage buckets: `avatars` (public photos) and `verifications` (private selfies), plus the photo-upload rules | `Storage buckets ready — now run 03_verify.sql` |
| `03_verify.sql` | Read-only check of the other two files | One row: `ALL 102 CHECKS PASSED · OK` |

> ⚠️ **Never run anything in `db/leanon-migrations/`.** Those 83 archived files are LeanOn's
> patch history; `01_schema.sql` already contains their end result, converted for
> the UK (pence, 8/16/32-minute sessions, scheduled sessions, GDPR consent).

Allow about 30 minutes. Steps 1–6 build the database; steps 7–12 connect the app to it.

---

## Part A — Build the database

### 1. Check the project's region

The project must be in **London**: the Privacy Policy says so (`lib/legal.ts →
hostingRegion`), and it keeps UK users' data in the UK.

In the Supabase dashboard, open your project and look at **Project Settings → General**.
The region should read **West EU (London) / eu-west-2**.

The region can't be changed later. If it is not London, delete this project and
create a new one: **New project** → Name `howwasyourday` → **Generate a password**
(save it in a password manager) → Region **West EU (London)** → Free plan. Leave
the **Data API** switched on.

### 2. Run `01_schema.sql`

1. On GitHub, open
   [`supabase/setup/01_schema.sql`](https://github.com/HowWasYourDayZ/howwasyourday/blob/main/supabase/setup/01_schema.sql)
   and click the **Copy raw file** button (two overlapping squares, top right of the file).
2. In Supabase: **SQL Editor** (left sidebar) → **+ New query** (or **New SQL snippet**).
3. Paste everything, then click **Run** (or press Ctrl + Enter).
4. If Supabase shows a warning that the query has destructive operations, click
   **Run this query**. The script only creates objects; the warning is triggered
   by its `REVOKE` lines.
5. The result panel should show **`How Was Your Day schema created — now run 02_storage.sql`**.

If you see an error instead, **nothing has been created**: the script runs as a
single transaction. Copy the error and send it to Claude. The script refuses to
run a second time once it has succeeded, so it can't create duplicates.

### 3. Run `02_storage.sql`

Click **+ New query**, paste
[`02_storage.sql`](https://github.com/HowWasYourDayZ/howwasyourday/blob/main/supabase/setup/02_storage.sql),
click **Run**, and confirm the destructive-operation warning if it appears (it
removes old photo rules before re-adding them). It is safe to run again.

Expected: **`Storage buckets ready — now run 03_verify.sql`**.

### 4. Run `03_verify.sql`

Click **+ New query**, paste
[`03_verify.sql`](https://github.com/HowWasYourDayZ/howwasyourday/blob/main/supabase/setup/03_verify.sql)
and click **Run**.

Expected: **one row** reading `ALL 102 CHECKS PASSED | OK`. Any other row names
what is missing (for example `storage bucket avatars | MISSING (run 02_storage.sql)`).

### 5. Look around (optional)

- **Table Editor** lists 24 tables, all showing **RLS enabled**.
- **Storage** shows `avatars` (Public) and `verifications` (Private).
- **Database → Publications → supabase_realtime** lists 7 tables.

The Security Advisor (**Advisors → Security**) may report "RLS enabled, no policy"
on tables such as `push_tokens` and `talk_searches`. That is intentional: only
the server may read those tables.

### 6. Refresh the schema snapshot

Run [`db/dump-live-schema.sql`](https://github.com/HowWasYourDayZ/howwasyourday/blob/main/db/dump-live-schema.sql)
in a new query, then **Export → Download CSV** (or copy the results) and send the
file to Claude. Claude will swap the *expected* snapshot in `db/LIVE_SCHEMA.md`
for the real one. The two should be identical.

---

## Part B — Authentication settings

> **Launching with Google sign-in only (no MSG91 yet)?** Follow
> [`VERCEL_SETUP.md`](VERCEL_SETUP.md) instead of steps 7–12; it covers Vercel,
> Google and these Supabase settings in the right order (Phone stays OFF until MSG91).

### 7. Sign-in methods (Authentication → Sign In / Providers)

- **Allow new users to sign up: ON.**
- **Phone: ON.** The code (`app/api/auth/phone-widget`) creates phone users and
  signs them in on the server after **MSG91** has verified the code; Supabase
  itself never sends an SMS. If the form insists on an SMS provider, choose
  Twilio and type `unused` in its fields. The values are never used, because the
  app never asks Supabase to text anyone.
- **Email: OFF.** Nothing in the app signs in by email or password. Leaving email
  on would let anyone create auth accounts through the public API.
- **Google:** follow [`docs/GOOGLE_SIGN_IN.md`](GOOGLE_SIGN_IN.md). You can do this
  later; the Google button stays hidden until `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true`.

### 8. URLs (Authentication → URL Configuration)

- **Site URL:** `https://www.howwasyourday.live`
- **Redirect URLs:** add
  - `https://www.howwasyourday.live/auth/callback`
  - `http://localhost:3000/auth/callback` (local development)

### 9. Leave CAPTCHA off (Authentication → Attack Protection)

Keep **Enable CAPTCHA protection OFF**. The server signs users in with
`signInWithPassword` after MSG91 has verified them, and that call carries no
CAPTCHA token. Switching this on would make **every** login fail. Bot protection
for OTP comes from MSG91's widget.

### 10. Test phone numbers (optional)

To run `tests/e2e-authenticated.spec.ts`: **Authentication → Sign In / Providers →
Phone → Test phone numbers**. Add a UK number such as `447700900123=123456`
(07700 900xxx numbers are Ofcom's range reserved for drama and testing).

---

## Part C — Connect the app

### 11. Copy the keys into Vercel

In Supabase:

- Open **Project Settings → Data API** and copy the **Project URL**.
- Open **Project Settings → API Keys** and select the **Legacy API keys** tab.
  Copy **`anon` `public`** and **`service_role` `secret`**.

Use the legacy JWT keys: the app's Supabase libraries (`@supabase/ssr` 0.3.0,
`supabase-js` 2.43) were built and tested with them. If your project only offers
*Publishable* and *Secret* keys, tell Claude before using them.

In **Vercel → the howwasyourday project → Settings → Environment Variables**, set
these for **Production** (and Preview if you use it):

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL, e.g. `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | the `service_role` key — **server only, never share it** |
| `SESSION_PASSWORD_SECRET` | a NEW random secret (see below). **Never change it once users exist** — changing it logs everyone out |
| `SELFIE_PATH_SECRET` | another NEW random secret. **Never change it** — the private selfie file names are derived from it (`docs/SELFIE_STORAGE.md`) |
| `CRON_SECRET` | another NEW random secret (also goes into GitHub, step 12) |

To make a random secret, use one of these (each run gives a different value):

- Mac/Linux terminal: `openssl rand -hex 32`
- Windows PowerShell 7:
  `$b=[byte[]]::new(32); [Security.Cryptography.RandomNumberGenerator]::Fill($b); [Convert]::ToHexString($b)`
- A password manager's generator: 64 characters, letters and digits only.

Use **new** values; don't copy LeanOn's. The other variables (MSG91, Agora,
Firebase, Resend, admin login) are listed in `.env.example`.

Then **Deployments → ⋯ → Redeploy** so the new values take effect.

### 12. GitHub secret for the scheduled-sessions timer

`.github/workflows/scheduled-tick.yml` calls `/api/sessions/scheduled-tick` every 5
minutes; it sends reminders and handles no-shows. In **GitHub → HowWasYourDayZ/howwasyourday
→ Settings → Secrets and variables → Actions → New repository secret**, add
`CRON_SECRET` with **the same value** you put in Vercel.

---

## Part D — Check it works

1. Open https://www.howwasyourday.live/auth and sign in with your phone.
2. In Supabase **Table Editor → users** there is now one row with your number, and
   `sensitive_data_consent_at` holds a timestamp.
3. Open the wallet page. It loads, showing £0.00. (Top-ups wait for Whop.)
4. **Authentication → Users** shows the same person.

If sign-in fails, check Vercel's logs for `phone-widget:` messages. The usual
causes are a missing `SESSION_PASSWORD_SECRET`, the Phone provider being off, or
CAPTCHA being on.

## Free plan limits worth knowing

- **Pausing:** a Free project with no activity for about a week is paused, and
  you have to press *Restore* in the dashboard. Real traffic or the 5-minute
  GitHub cron keeps it awake.
- **Size:** about 500 MB of database and 1 GB of file storage. That is plenty
  for launch.
- **Backups:** the Free plan gives no backups you can restore yourself. Before
  real people put real money in wallets, move to **Pro**, which adds daily
  backups and stops pausing.

## Changing the schema later

- Write a new file `supabase/migrations/078_<what>.sql` (then 079, …). Run it in
  the SQL Editor, then refresh `db/LIVE_SCHEMA.md` (step 6).
- **A new table must get RLS and lose browser write access in the same file.**
  Supabase grants new tables to the browser roles by default:
  ```sql
  ALTER TABLE public.<t> ENABLE ROW LEVEL SECURITY;
  REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.<t> FROM anon, authenticated;
  ```
- **A new function must not be callable from the browser:**
  `REVOKE ALL ON FUNCTION public.<f>(<args>) FROM PUBLIC, anon, authenticated;`
