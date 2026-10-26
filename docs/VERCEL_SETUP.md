# Vercel + Google sign-in — first-time setup, step by step

For a brand-new Vercel account, with **Google as the only sign-in** (MSG91 phone
sign-in comes later). Do [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) Part A first;
the database must exist.

Order: **A** deploy the site on a temporary `*.vercel.app` address → **B** set up
Google sign-in → **C** tell Supabase where the site lives → **D** connect
howwasyourday.live → **E** the GitHub timer secret → **F** test.

You need the following ready:
- **Supabase:** the Project URL plus the `anon` and `service_role` keys
  (Project Settings → API Keys → *Legacy API keys*).
- **Three new random secrets.** Make each with `openssl rand -hex 32`, or in PowerShell 7:
  `$b=[byte[]]::new(32); [Security.Cryptography.RandomNumberGenerator]::Fill($b); [Convert]::ToHexString($b)`.
  Every run gives a different value. Keep all three in a password manager.

---

## A. Put the site on Vercel

### A1. Connect GitHub
1. Go to vercel.com and sign up with **Continue with GitHub**.
2. When GitHub asks which repositories Vercel may access, choose **Only select
   repositories → HowWasYourDayZ/howwasyourday**. If it doesn't ask, you'll see an
   *Adjust GitHub App Permissions* link in the next step.

> **Plan note.** Vercel's free **Hobby** plan is for non-commercial use, and it
> may refuse to import a *private* repository owned by a GitHub **organisation**
> (HowWasYourDayZ is one). If the import is blocked, or before you take real
> payments, use **Pro** (about $20 a month; there is a free trial). The other way
> round the block is to transfer the repository to your personal GitHub account.

### A2. Import the project
1. Vercel dashboard → **Add New… → Project** → **Import** next to `howwasyourday`.
2. Check these settings:
   - **Framework Preset:** Next.js (detected).
   - **Root Directory:** `./`.
   - **Build Command:** leave the default (`vercel.json` sets `next build`).
3. Open **Environment Variables** on the same screen and add the variables below
   **before** you click Deploy.

### A3. Environment variables (minimum for a Google-only launch)

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL, e.g. `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key (server only, never share it) |
| `SESSION_PASSWORD_SECRET` | random secret #1. **Required for Google sign-in** (it signs the consent cookie). Never change it later |
| `SELFIE_PATH_SECRET` | random secret #2. Never change it later |
| `CRON_SECRET` | random secret #3 (also goes into GitHub, step E) |
| `ADMIN_EMAIL` | **the Google address you will sign in with.** That account becomes the admin (`/admin`) and receives crisis alerts. Keep it private |
| `ADMIN_SECRET` | random secret #4, a backup admin password for scripts |
| `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED` | `true` |

Leave these out for now; the site works without them, and you can add them later:
- MSG91 (phone sign-in)
- Agora (voice calls; text chat works without it)
- Firebase (push alerts; in-app alerts still work)
- Resend (emails)
- Upstash (shared rate limits; falls back to per-server limits)
- Google Analytics
- Razorpay (top-ups wait for Whop)

### A4. Deploy
Click **Deploy**. It takes about 2–4 minutes. When it finishes, note your address,
for example `https://howwasyourday-abc.vercel.app`. This guide calls it
**`<vercel-url>`**.

If the build fails, open the build log, copy the red lines and send them to Claude.

*Adding or changing a variable later:* Project → **Settings → Environment
Variables**, then **Deployments → ⋯ (latest) → Redeploy**. Variables only take
effect after a redeploy.

---

## B. Google sign-in (Google Cloud Console)

### B1. Create a Google Cloud project
1. Go to console.cloud.google.com and sign in with the company Google account.
2. Use the project picker at the top: **New project** → name it `How Was Your Day` → **Create** → select it.

### B2. Consent screen (Google Auth Platform)
1. Search the console for **"Google Auth Platform"** (older consoles call it
   *APIs & Services → OAuth consent screen*) → **Get started**.
2. Fill in:
   - **App name:** How Was Your Day
   - **User support email:** your support address
   - **Audience:** **External**
   - **Contact email:** yours
3. Agree to the policy → **Create**.
4. **Branding:** set the home page to `https://www.howwasyourday.live`, the privacy
   policy to `https://www.howwasyourday.live/privacy`, and the terms to
   `https://www.howwasyourday.live/terms`. Authorised domain:
   `howwasyourday.live`. **Skip the logo for now**: uploading one triggers a
   Google brand review that can take days.
5. **Data access:** don't add scopes. The app only uses the basic ones (email,
   profile, openid), which need no review.
6. **Audience → Publish app → Confirm**, so the status reads *In production*.
   While it says *Testing*, only the test users you list can sign in.

### B3. OAuth client
1. In Supabase, open **Authentication → Sign In / Providers → Google** and copy
   the **Callback URL** it shows: `https://<your-ref>.supabase.co/auth/v1/callback`.
2. In Google, go to **Google Auth Platform → Clients → Create client** and set:
   - **Application type:** Web application
   - **Name:** `HWYD web`
   - **Authorised JavaScript origins:** `https://www.howwasyourday.live` and `<vercel-url>`
   - **Authorised redirect URIs:** the Supabase **Callback URL** from step 1 (only that one)
3. Click **Create** and copy the **Client ID** and **Client secret**. The secret
   is shown in full only once.

### B4. Turn Google on in Supabase
Go to **Supabase → Authentication → Sign In / Providers → Google** and set:
- **Enable Sign in with Google:** ON
- Paste the **Client ID** (under *Client IDs*) and the **Client Secret**
- **Skip nonce checks:** OFF

Then click **Save**.

While you are on the providers page:
- **Email: OFF**
- **Phone: OFF** for now. Turn it on when MSG91 is set up.
- **Allow new users to sign up: ON**

---

## C. Tell Supabase where the site lives

Go to **Supabase → Authentication → URL Configuration** and set:

- **Site URL:** `<vercel-url>` for now (switch to `https://www.howwasyourday.live` in step D4).
- **Redirect URLs** (*Add URL*, one at a time):
  - `<vercel-url>/auth/callback`
  - `https://www.howwasyourday.live/auth/callback`
  - `http://localhost:3000/auth/callback`

Then click **Save**.

Google sign-in now works on `<vercel-url>`. Try it: open `<vercel-url>/auth`, tick
both boxes, then **Continue with Google**.

---

## D. Connect howwasyourday.live

1. In Vercel, go to the project → **Settings → Domains → Add** and enter
   `www.howwasyourday.live`. Then add `howwasyourday.live` too, and choose
   **Redirect to www.howwasyourday.live** (the site, sitemap and app all use `www`).
2. Vercel shows the DNS records to create. Typically:
   - `A` record for `@` → `76.76.21.21`
   - `CNAME` record for `www` → `cname.vercel-dns.com` (or a project-specific
     `…vercel-dns…` value)

   **Use exactly the values Vercel shows you.**
3. At the company you bought the domain from, open **DNS settings**:
   - Delete any existing `A`, `AAAA` or `CNAME` records for `@` and `www` (parking pages).
   - Add the records from step 2.

   DNS usually updates within an hour (sometimes up to 48 hours). Vercel then
   shows ✅ *Valid Configuration* and issues the HTTPS certificate on its own.
4. Once ✅ appears, go to **Supabase → Authentication → URL Configuration** and
   change the **Site URL** to `https://www.howwasyourday.live`.

---

## E. GitHub secret for the scheduled-sessions timer

`.github/workflows/scheduled-tick.yml` calls
`https://www.howwasyourday.live/api/sessions/scheduled-tick` every 5 minutes. It
sends booking reminders and handles no-shows, so it only works once step D is done.

1. In GitHub, open **HowWasYourDayZ/howwasyourday → Settings → Secrets and
   variables → Actions → New repository secret**.
2. Name: `CRON_SECRET`. Value: the **same** value as in Vercel.

Until the domain is live, the timer's runs will fail. That is harmless.
Vercel's own daily job (`/api/sessions/cleanup`, from `vercel.json`) needs no setup.

---

## F. Test

1. Open `https://www.howwasyourday.live/auth` (or `<vercel-url>/auth`), tick both
   boxes and choose **Continue with Google**. Sign in with the `ADMIN_EMAIL` account.
2. Pick the first name listeners will see. You land in the app.
3. In **Supabase → Table Editor → users**, check that one row exists with your
   email, and that `sensitive_data_consent_at` holds a timestamp.
4. Open `/admin`. You should get the admin dashboard, because your Google email
   matches `ADMIN_EMAIL`.

If sign-in sends you back to `/auth` with an error, check these in order:
1. Is the redirect URL in Supabase step C exactly `…/auth/callback`?
2. Is `SESSION_PASSWORD_SECRET` set in Vercel, and did you redeploy afterwards?
3. Is the Google app *In production*?
4. Are the Google client ID and secret pasted in Supabase?

Vercel → project → **Logs** shows the server errors.

## Every push deploys

From now on, each push to `main` deploys automatically. Pull-request and
other-branch pushes get their own *Preview* address. Previews can't use Google
sign-in unless that preview URL is added to Supabase's Redirect URLs.
