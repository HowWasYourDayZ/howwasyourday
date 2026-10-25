# Google sign-in — setup and design

Decided 2026-10-25 (PROJECT.md §8.1). Code: `app/auth/page.tsx` (button),
`app/api/auth/consent-intent` (consent cookie), `app/auth/callback/route.ts`
(code exchange), `lib/signin-consent.ts`.

## One-time setup (owner)

1. **Google Cloud Console → APIs & Services → OAuth consent screen**: External,
   app name "How Was Your Day", support email, logo, links to
   https://www.howwasyourday.live/privacy and /terms. Scopes: **only**
   `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile` (non-sensitive —
   no Google verification review needed). Publish the app.
2. **Credentials → Create OAuth client ID → Web application**. Authorised
   redirect URI: `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`.
3. **Supabase → Authentication → Providers → Google**: enable, paste the client
   ID and secret. Leave "Skip nonce check" off.
4. **Supabase → Authentication → URL Configuration**: Site URL
   `https://www.howwasyourday.live`; add Redirect URL
   `https://www.howwasyourday.live/auth/callback` (and preview/localhost URLs
   if needed).
5. **Vercel env**: `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` (and make sure
   `SESSION_PASSWORD_SECRET` is set), then redeploy.

## How it works

1. The user ticks "18+ / Terms" and the separate explicit-consent box (GDPR
   Art. 9). The button stays disabled until both are ticked.
2. `POST /api/auth/consent-intent` checks both and sets `hwyd_signin_consent`, an
   HMAC-signed httpOnly cookie valid 15 minutes.
3. `supabase.auth.signInWithOAuth({ provider: 'google' })` (PKCE) → Google →
   Supabase → `/auth/callback?code=…`.
4. The callback exchanges the code for a session, **signs the user out again
   unless the consent cookie is valid**, refuses suspended accounts, creates the
   `public.users` row, stores the Google **email** (not name/photo), records
   `sensitive_data_consent_at`, then redirects to `/auth?oauth=1`.
5. `/auth` runs the normal new-vs-returning step: new users choose the first
   name listeners will see.

## Rules

- Listeners never see a seeker's email or Google profile — only the chosen name.
- A Google-only account has no phone: it can book sessions but **cannot apply
  as a listener** (`/api/listener/apply` → `phone_required`).
- Google and phone sign-in are separate accounts until account linking exists.
