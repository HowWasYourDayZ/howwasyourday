# How Was Your Day (HWYD) — Project Bible (Source of Truth)

> This file is the durable contract for how How Was Your Day works. It changes rarely.
> Roadmap, build status, account credentials, and cost estimates belong in a
> SEPARATE file (STATUS.md). Do NOT put volatile information here.
>
> **Claude: read this file in full before writing or modifying any feature.
> If a request contradicts anything here, stop and flag it — do not silently
> reinterpret. If a detail you need is not specified here, ask rather than invent.**
>
> HWYD started as a copy of the LeanOn 2.0 codebase (India). Where the code still
> behaves like LeanOn and this file says otherwise, **this file wins** — §16 lists
> the decisions the code does not implement yet.

---

## 0. How to Use This File

- This is the authority on **mission, positioning, workflows, data contracts, and invariants.**
- The tech stack listed in §6 is fixed. Do not substitute libraries or services without an explicit decision being recorded here first.
- When in doubt about *why* a rule exists, see §2 and §4 — the reasoning is intentionally preserved so judgment calls stay aligned.
- Engineering rules learned from production bugs live in `CLAUDE.md`.

---

## 1. Mission (One Line)

**Connect lonely, overwhelmed people in the UK with real humans who have lived through the same thing — now or at a time that suits them, affordably, and safely.**

---

## 1a. Brand (decided 2026-10-26)

**Name:** How Was Your Day (short form **HWYD** internally only; on the site always write it in full).
**Tagline:** *Talk it through. 8 minutes is enough.* — the 8-minute session is the hero of the brand:
a short, affordable, low-commitment conversation with a real person.

**Colours — orange and white.** A soft, warm "sunset" orange that feels calm and trustworthy,
on lots of white space. Never a loud or neon orange, never the LeanOn navy/teal.

| Token | Hex | Use |
|---|---|---|
| Sunset orange (brand) | `#E8743B` | Logo, accents, highlights, large headings, icons, decorative fills |
| Ember (action) | `#B85520` | Buttons with white text, links, focus rings — 4.8:1 on white (WCAG AA) |
| Ember dark (hover) | `#9E4719` | Hover/pressed state of Ember |
| Peach (soft background) | `#FFF6EF` | Section backgrounds, cards, chips |
| Apricot (tint / border) | `#FBE3D2` / `#F2DFD1` | Badges, dividers, card borders |
| White | `#FFFFFF` | Main background — keep it the dominant colour |
| Ink (text) | `#3B2F2A` | Headings and body text (warm charcoal, 12.9:1 on white) |
| Muted text | `#6E5B50` | Secondary text (6.4:1 on white) |

Rules: white text only on Ember (or darker), never on Sunset orange at body sizes (3:1 — large/bold only).
Crisis callouts keep a red tint; nothing else introduces new hues.

**Logo (2026-10-26):** a rounded speech bubble (talk) holding a sun — a circle with eight short rays (your
day) — next to the wordmark *How Was* (ink) / *Your Day* (orange), set in Nunito Black and outlined to vector
paths. Master files live in **`logo/`** (see `logo/README.md`): SVGs in `logo/svg/`, transparent high-res PNGs
and app icons in `logo/png/`. Regenerate with `logo/generate-svg.cjs` + `logo/export.mjs`, which also update
`public/` (logo.png, icons, favicon) and the Android app icons/splash screens. Never redraw it by hand per page —
use `/logo.png` or `/brand/*.svg`.
**Type:** Nunito (self-hosted), 800–900 for headings, 500–700 for body.

**Voice:** warm, plain British English, short sentences, no clinical language, no hype. Prices in £
(`lib/money.ts`). Nothing about India, NRIs or any other country on the site, and the name LeanOn
never appears in anything a user can see.

---

## 2. The Core Insight (never forget this)

People often pay for a conversation that is nominally about something else (a reading, a "consultation", a coaching call) when what they actually want is to be heard. The LeanOn team saw this first-hand: reporting on India's astrology-app boom quotes an astrologer saying *"When I am doing night sessions, most people just wanna talk."*

How Was Your Day removes the wrapper and offers the real thing: **human connection and lived-experience peer support.**

- Many adults have nobody they can be completely honest with, or do not want to burden friends and family.
- Professional help is often a long wait or more than they can pay, and many people do not want a diagnosis — they want to be heard.
- Text matters: people who cannot speak freely at home or at work still need to talk.
- People will pay when they are hurting, including late at night — and some would rather book a calm, predictable time.

Do not invent statistics about UK loneliness or mental health in copy; cite only sourced facts. Never disparage other services or their users, and never name a competitor by brand in comparisons.

---

## 3. What How Was Your Day Is NOT (critical positioning)

How Was Your Day is a **PEER SUPPORT** platform. It is not a mental health, clinical, or therapy platform.

- ❌ Not therapy, counselling, or treatment
- ❌ Not clinical or psychiatric care
- ❌ Not a substitute for professional help (NHS, GP, or private practitioners)
- ✅ Real people with lived experience
- ✅ Pay-per-session peer conversations
- ✅ Emotional support from someone who has been there

**Language rules (enforce in all UI, copy, and data models):**
- NEVER use the words *therapy, counselling, counsellor, treatment, patient, clinician, diagnosis* to describe what HWYD or its listeners provide, anywhere user-facing or in schema names. (Saying what HWYD is *not* — "not therapy" — is fine.)
- Use *listener, seeker, session, lived experience, peer support.*

**Why it matters:** in the UK, "counselling" and "psychotherapy" carry professional expectations (accredited registers such as the BACP/UKCP; regulated titles such as "clinical psychologist" under the HCPC). Peer support does not, and must not be presented as if it did. This is both the legal shield and the ethical line — HWYD is to therapy what a support group is to clinical care: legitimate, needed, and deliberately different.

**Do not build:** diagnostic tools, assessment forms, symptom trackers, or medical intake logs.

---

## 4. Who Uses How Was Your Day

**Launch market: the United Kingdom only** (decided 2026-10-25). Seekers and listeners are UK-based adults (18+). See §14.

### Seekers (book sessions)
- UK adults, ~22–45 at launch.
- Lonely, stressed or going through something: breakups, family pressure, work stress, career confusion, grief, loneliness, student pressure, or simply a hard day.
- Want someone to listen — now, or at a booked time — without a waiting list or a diagnosis.

### Listeners (earn)
- Everyday UK-based adults with **lived experience** of a specific situation — NOT professionals. (The LeanOn v1 product used professionals and failed on supply — see §11.)
- Examples: someone who rebuilt after a breakup or divorce, survived burnout, lost a parent, changed career, got through exams.
- Work from their phone: they go online for instant sessions, and/or publish weekly hours for scheduled sessions (§8.4).

---

## 5. Business & Wallet Model

All money is **GBP**, stored and computed as **integer pence** (see `CLAUDE.md`, `lib/money.ts`).

| Element | Specification |
|---|---|
| Listener rate | Each listener sets their own **text** rate per minute: **10p–£5/min**, standard starting rate **40p/min** (`MIN_/MAX_/DEFAULT_LISTENER_RATE`). |
| Text vs voice | **Voice = text + 10p/min** (`VOICE_RATE_PREMIUM`), always. Only the text rate is stored. The booked mode's rate is saved on the session (`listener_rate_per_min`) and settlement uses it. Kill switch: `NEXT_PUBLIC_VOICE_PRICING=false`. |
| Session lengths (2026-10-25) | Fixed only: **8 min**, **16 min**, or **32 min**. **8 minutes is the minimum.** No open-ended metered calls. Same lengths for instant and scheduled sessions. |
| Free sessions (2026-10-25) | **None. Every session is paid.** There is no free trial or free intro. The 8-minute session is the low-cost way to try a listener. |
| Platform fee (seeker) | **Flat £1 per session**, paid by the seeker on top of the listener's rate, shown as a separate line before booking. The payment processor's fee is borne by the seeker at top-up. |
| Example prices (standard 40p/min) | Text: 8 min **£4.20** · 16 min **£7.40** · 32 min **£13.80**. Voice (50p/min): **£5** · **£9** · **£17**. |
| Service fee (listener) | **40% of listener earnings** (`LISTENER_SERVICE_FEE_RATE`), deducted at settlement (`lib/session-billing.ts`); the rate is locked at session start from the dated `SERVICE_FEE_SCHEDULE`. Listeners keep **60%**. Listener-facing copy leads with what they keep and what the fee covers, but always states the 40% plainly. Never call it a "commission" — "service fee" only. Entirely separate from the seeker's £1. |
| Wallet | Top up **£5 / £10 / £20 / £50** or a custom £5–£200. **Unused balance refundable anytime.** |
| Payments | **Whop** (decided 2026-10-25; replaces Razorpay). Card top-ups, refunds, and listener payouts. |

**Wallet integrity:** balance must be validated **server-side** before any session is requested or booked. See §9 race-condition rules.

**Open owner decision:** at 8 minutes the £1 fee is ~24% of a standard-rate session. Confirm £1 flat, or set a lower fee for 8-minute sessions.

---

## 6. Tech Stack (FIXED — do not substitute)

| Layer | Tool |
|---|---|
| Frontend + Backend | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Database + Auth + Realtime | Supabase (PostgreSQL, Auth, Realtime) — project in the **London (eu-west-2)** region |
| Sign-in | **Google sign-in** (Supabase Auth Google OAuth provider, 2026-10-25) **and** phone one-time code (MSG91 OTP Widget; the server mints the Supabase session — see CLAUDE.md). See §8.1 and §16. |
| User notifications | **In-app** (realtime bell) + push where the user allowed it + **service email** (Resend) for scheduled-session confirmations and reminders. **No SMS** to users except the sign-in code. |
| Scheduling | **Built in-house on Supabase** (decided 2026-10-25 — see §8.4). Calendar files (.ics) / "Add to calendar" links for users; Google Calendar is an optional export, never the system of record. |
| Voice calls | Agora.io Web SDK (RTC tokens generated server-side, never client-side) |
| Payments | **Whop** (server-created checkouts; webhook-validated). Replaces Razorpay. |
| Moderation | **Rule-based checks + human review** (`lib/contact-guard.ts`, crisis-word alerts, reports). **No AI** processes conversation content (GDPR — see CLAUDE.md). |
| Email | Resend |
| Admin panel | Internal secure Next.js API routes + admin UI |
| Hosting | Vercel |
| Identity checks (listeners) | Live camera selfie + manual review; optional UK photo ID (passport / driving licence / BRP). No national ID numbers. |

> If any service above needs to change, record the decision in this file **before** building against the new service.

---

## 7. Screens & Routing Map

| Path | Access scope | Notes |
|---|---|---|
| `/` | Public | Landing / conversion |
| `/auth` | Public | **Continue with Google** or phone + one-time code |
| `/talk` | Public → authenticated | Instant: matches an online listener now |
| `/browse` | Public → authenticated seekers | Listener cards; "Talk now" (online) or "Book a time" (has availability) |
| `/listener/[id]` | Public → authenticated seekers | Single profile: instant request **and** next available slots |
| `/sessions` | Authenticated | Upcoming scheduled sessions + history; cancel / add to calendar |
| `/wallet` | Authenticated seekers | Top-up, balance, refunds |
| `/session/[id]` | Validated seeker + assigned listener only | Live session (also the join link for scheduled sessions) |
| `/dashboard` | Verified listeners only | Online toggle, **weekly availability**, upcoming bookings, earnings |
| `/become-listener` | Authenticated users | Onboarding form |
| `/privacy`, `/terms`, `/cookies` | Public | Legal (UK GDPR) |
| Admin | Admin role only | Verification, finance, moderation, scheduled-session exceptions |

---

## 8. Core Workflows

### 8.1 Sign-in (2026-10-25)
1. **Continue with Google** (Supabase Google OAuth, scopes `openid email profile` only — no Calendar or other scopes at sign-in), **or** phone number → one-time code.
2. Before signing in, the user confirms they are **18+**, accepts the Terms, and gives the separate **explicit consent** for sensitive information (UK GDPR Art. 9). The server refuses sign-in without both (`sensitiveDataConsent`) — this applies to Google sign-in too.
3. Google gives us an email address and a name. **The listener/seeker sees only the first name the user chooses** — never the email, Google profile photo, or phone number. The email is used only for account recovery and scheduled-session emails.
4. One sign-in method per account at launch. Account linking (Google ↔ phone) is a later feature; until then the same person signing in both ways gets two accounts — say so on `/auth`.
5. Listeners may sign in with Google, but a **verified UK mobile number** is still required before they go live (payout and safety contact).

### 8.2 Seeker workflow
1. **Discovery:** browse listeners; filter by topic, language and gender. Profiles show bio + lived experience. **No prominent profile photos** (§10).
2. **Top-up:** user initiates → backend creates a Whop checkout → **webhook** validates → wallet credited atomically.
3. **Instant session:**
   a. Server checks `balance >= (rate × minutes) + platform_fee`.
   b. One RPC reserves funds, creates the session as `requested`, and notifies the listener in real time (+ push).
   c. Listener accepts within `REQUEST_RESPONSE_WINDOW_SECS` → `active`. Otherwise `timed_out` and full refund.
4. **Scheduled session:** see §8.4.
5. **Billing:** pay pro-rata for minutes used (8-minute minimum does not apply to an early end — the seeker who ends after 3 minutes pays for 3); nothing if under a minute or if the listener never connects.

### 8.3 Listener workflow
1. **Onboarding & vetting:** sign up → profile details → live selfie (+ optional photo ID) → screening quiz → payout setup via Whop → admin review.
2. **Profile status lifecycle:** `unverified` → `pending_review` (on submission) → `verified` (on admin approval).
3. **Instant availability:** persistent Online/Offline toggle.
   - *Heartbeat guard:* going online sets `is_available = true` and stamps `last_heartbeat_at`; the client re-stamps it every **60 seconds**; a background sweep removes a listener from discovery once that timestamp is older than **15 minutes**.
   - **Why 15 minutes, not 3:** mobile browsers throttle and suspend background timers. At 3 minutes, genuinely-online listeners who switched apps were repeatedly swept offline — the most-reported listener bug. **Treat 15 as load-bearing: do not lower it without proving heartbeats survive mobile backgrounding.**
   - `is_available` is written ONLY by the authenticated toggle. Heartbeats refresh the timestamp and may never set availability back to `true`.
   - **Presence:** no heartbeat for 15 min → offline, unless push can reach the listener (then up to 60 min "away mode"). Closing the last tab sets the listener offline ~3 min later. A missed request sets an away listener offline at once, and an active one on the second miss in a row. Full design: `docs/NOTIFICATIONS.md`.
4. **Incoming instant request:** accept/decline with a **3-minute countdown** (`REQUEST_RESPONSE_WINDOW_SECS`), plus push to every registered device. If ignored → `timed_out`, seeker refunded.
5. **Scheduled availability:** weekly hours + booked sessions — see §8.4.
6. **Earnings ledger:** on completion, `payout = (rate × minutes used) × 60%`. The seeker's £1 platform fee is separate and never deducted from the listener's share. Recorded in `listener_earnings`.

### 8.4 Scheduled sessions (decided 2026-10-25)

**Decision: build scheduling in-house (Supabase is the system of record). Do not build on Google Calendar.** Validation:

| | Own scheduling (chosen) | Google Calendar as the backbone |
|---|---|---|
| Money | Booking, fund hold, refund and settlement in one DB transaction (§9.2) | Calendar can't hold or move money; we'd still need our own booking table and have to keep two systems in sync |
| Instant + scheduled together | One table tells us a listener is busy, so instant requests never collide with a booking | Needs constant two-way sync; race conditions between a calendar event and an instant request |
| Privacy (special category data) | Seeker stays pseudonymous; nothing leaves our system | Events with attendees reveal both parties' email addresses to each other and put session details in Google — breaks the "listener never sees your contact details" rule (CLAUDE.md contact-guard) |
| Who can use it | Every seeker and listener | Only people with Google accounts who grant Calendar access |
| Effort and approval | Normal feature work | Calendar scopes are *sensitive* → Google OAuth app verification, plus per-user consent screens; webhooks/watch channels to maintain |
| Rules (cancellation, no-shows, buffers) | Enforced server-side | Can't be enforced |

**What we use Google Calendar (and other calendars) for:** a downloadable **.ics** file and an **"Add to Google Calendar" link** after booking, with a neutral title ("How Was Your Day session"), the time, and the join link — **no names, topic, or other details**. Later and optional: let a listener connect Google Calendar **read-only (free/busy)** so their personal events block slots. That needs Google verification of the Calendar scope and is not part of launch.

**How it works:**
1. **Listener availability:** weekly recurring windows (e.g. Mon 18:00–21:00) plus one-off blocked dates, all in **UK time (Europe/London)**, stored as UTC. A listener can offer scheduled sessions without ever going "online".
2. **Slots:** generated from availability for the session lengths (8/16/32 min) on a fixed grid (every 15 minutes), with a **buffer** (proposed 10 min) between sessions. Bookable from **2 hours** to **14 days** ahead (proposed).
3. **Booking:** seeker picks listener → mode (text/voice) → length → slot. One RPC checks the slot is still free (row lock on the listener's bookings), reserves the full price from the wallet, and creates the session with status `scheduled` and `scheduled_start_at`. The listener's text/voice rate is locked at booking.
4. **Confirmation and reminders:** in-app + push + email (if we have an email): at booking, **24 hours** and **15 minutes** before. Includes the .ics / Add-to-calendar link. No SMS.
5. **Joining:** the session page opens from **5 minutes before** the start. When both have joined, the session becomes `active` and the timer runs for the booked length (it may start up to the grace limit late but never runs past `scheduled_start_at + length + 5 min`).
6. **Conflicts with instant sessions:** a listener is not offered for instant requests from **15 minutes before** a booking until it ends, and cannot accept an instant request that would overlap it.
7. **No-shows:** if the listener has not joined **5 minutes** after the start → `cancelled` (`cancel_reason = 'listener_no_show'`), **full refund**, counts as a missed request for the listener. If the seeker has not joined after **10 minutes** → `cancelled` (`'seeker_no_show'`) — refund policy per the open decision below.
8. **Cancellation:** a seeker can cancel for a **full refund up to 2 hours before** the start (proposed); a listener cancelling at any time → full refund to the seeker and a reliability flag on the listener.

**Open owner decisions (proposed defaults above):** seeker late-cancellation and no-show charge (e.g. 50% of the booked price to the listener vs. full refund); buffer length; booking window; whether listeners can require a minimum notice.

---

### 8.5 Admin workflow
1. **Verification desk:** profiles in `pending_review`; Approve / Reject.
2. **Financial exceptions:** wallet transactions; manual refunds to the original Whop payment for failed sessions.
3. **Scheduled-session exceptions:** no-shows, disputes over who failed to join.
4. **Moderation:** flagged conversations and reports. Read only when reported or flagged, for safety or disputes.

---

## 9. Critical State & Data Contracts

### 9.1 Session status enum (authoritative)
- `scheduled` — **(2026-10-25)** booked for a future time; funds reserved; waiting for the start time.
- `requested` — instant request; funds reserved; awaiting listener response.
- `active` — live; timer running; sockets open.
- `completed` — ended by timer expiry or clean exit; funds settled.
- `cancelled` — declined, withdrawn, cancelled before start, or a scheduled no-show (`cancel_reason` says which).
- `timed_out` — instant request not answered within the response window.

No other session states may exist. Any new state requires updating this file first.

### 9.2 Race-condition protection (non-negotiable)
- Wallet balance checks and fund allocation must **never** run on the client or as two separate client queries.
- They execute inside a **single Supabase RPC** using row locking (`SELECT ... FOR UPDATE`) to prevent multi-click wallet-drain exploits.
- Fund reservation and session creation (instant **or** scheduled) happen in the same transaction. For bookings, the same transaction must lock the listener's overlapping sessions so a slot can never be double-booked.

### 9.3 Token & secret rules
- Agora RTC tokens: server-generated only.
- Whop checkout creation and webhook verification: server-side only.
- Google OAuth client secret lives in Supabase Auth settings only, never in the repo or client code.
- No API keys or secrets in client code or in this repo's committed files.

---

## 10. Non-Negotiable Product Principles

1. **Low-friction sign-in.** Google sign-in or a phone code — no passwords. Mobile-first. (Replaces the LeanOn "phone OTP only" rule, 2026-10-25.)
2. **Session-based, not open-ended.** 8, 16 or 32-minute blocks. No meter anxiety.
3. **Every session is paid; nothing is charged for time not used.** No free sessions. Pro-rata for early ends; full refund if nobody connects.
4. **Wallet refundable anytime.** Trust driver.
5. **Flat £1 seeker fee, shown transparently** as a separate line before booking. Don't over-advertise it in marketing copy. The listener service fee (§5) is separate; never call it a "commission".
6. **No photo prominence.** Lived experience first; prevents attractiveness-based selection.
7. **No parasocial hooks.** No tipping, gifting, public comments, profile-photo enlargement, or login streaks. Scheduling must not become a "standing date" feature: no recurring auto-bookings with the same listener at launch.
8. **Text-first.** Voice is secondary; many people cannot speak freely where they are.
9. **Pseudonymous by default.** Listeners and seekers see only a chosen first name — never email, phone, or Google profile details, including in calendar invites.
10. **Mobile-width layout.** Centered mobile container (`max-w-md` / ~480px).

---

## 11. Key Risks (keep front of mind)

1. **Supply side.** Professionals didn't onboard in LeanOn v1. HWYD recruits UK peer listeners; recruitment and vetting must stay lightweight. Scheduled availability helps people with day jobs listen in the evenings.
2. **No free trial.** Removing it raises the first-session barrier. Watch first-session conversion; the 8-minute session must feel low-risk (clear price, pay only for minutes used).
3. **Platform drift.** Monetising attention risks parasocial/romantic dynamics (§10.6–10.7).
4. **AI companions.** General AI keeps improving at emotional support. The moat is **human lived experience**.
5. **Professional backlash / regulation.** Strict "peer support" positioning (§3) is the shield.
6. **Moderation.** Sexual content, manipulation, fake identities, off-platform contact. Rule-based checks are the first line; human review at scale.
7. **No-shows.** Scheduled sessions add a new failure mode; listener no-shows must be refunded instantly and tracked.

---

## 12. Crisis Safety Rail (mandatory)

Every screen showing an active, pending or upcoming conversation must render a fixed, **un-dismissible** footer with **only** these official resources — no others permitted anywhere on the platform:

- **Samaritans:** 116 123 (free, 24/7)
- **Shout:** text SHOUT to 85258 (free, 24/7)
- **Emergency:** 999 (or 112)

If a user appears to be in crisis, surface these and do not attempt to handle the crisis through the peer-support flow.

---

## 13. Engineering Rule: No Regressions

**Every fix must preserve existing working functionality.** Before shipping any change, trace the full user flows that touch the modified code — seeker browse, instant request, scheduled booking, session, listener dashboard, admin panel, wallet — and confirm none are broken. When a column or behaviour did not previously exist in production, the code must degrade gracefully for rows that predate the migration.

---

## 14. Geographic Strategy (decided 2026-10-25)

**Launch: United Kingdom only — UK listeners and UK seekers.**

- Sign-in accepts **UK (+44) mobile numbers** only; Google sign-in is available to anyone but the service, prices and Terms are for people in the UK.
- One price list in GBP; no country-based pricing.
- Listeners must live in the UK (identity, payouts, and UK safeguarding expectations).
- Crisis resources are UK ones (§12).
- **EU later:** the code already has groundwork from the first UK/EU pass (EU phone codes, EU GDPR wording, findahelpline.com). Expanding to the EU needs: an EU representative (GDPR Art. 27), EU payment/VAT handling, local crisis lines per country, and a decision on listener supply. Do not market to EU users until then.
- The LeanOn India / NRI pages and copy are out of scope for HWYD and are to be removed or redirected.

---

## 15. Product-Market Fit Learnings (inherited from LeanOn, Sept 2026)

These come from LeanOn's live usage in India. Treat them as hypotheses to re-test in the UK, not as UK facts.

### The core mechanism that drove paid repeat usage
A single LeanOn listener ("Listener A") earned a large share of one seeker's spend over two days. The seeker ("Seeker B") had tried other listeners and rejected them; he paid specifically for one person who genuinely engaged. His stated reason: "no one else actually listens."

**What this means for the product:** people do not pay for access to listeners. They pay for a specific human who makes them feel genuinely heard. The loop is *discover the right listener → feel heard → return and pay repeatedly*. This is a relationship marketplace, not a commodity chat marketplace. **Scheduled sessions serve this loop** — a seeker can book the listener who helped them — but must stay within §10.7 (no auto-recurring bookings).

### The supply-side fraud problem (highest priority risk)
Some listeners accepted calls and then said nothing, to earn per-minute fees. A seeker who meets a silent listener blames the platform. It is detectable (very short or silent sessions). **Monitor and act on it before scaling acquisition.** With no free trial, a silent first paid session is even more damaging.

### Concentration risk
Very high spend with one listener is a revenue signal AND a platform-drift warning (§10.7). Flag it so the seeker's wellbeing stays the goal — don't block it.

### What to measure (priority order)
1. **Repeat paid sessions per listener** (3+ paid sessions from the same seeker).
2. **First-session conversion** — signed-up seekers who book a first paid session (replaces "free-to-paid" now that there is no free trial).
3. **Silent session rate** — sessions under 2 minutes after acceptance. >10% for a listener → review.
4. **Scheduled no-show rate** — per listener and per seeker.
5. **Seeker concentration** — >70% of paid sessions with one listener. Monitor, don't block.
6. **Session completion rate** — sessions ending much earlier than booked.

### What NOT to build based on this signal
- ❌ A "favourite listener" / follow feature (§10.7).
- ❌ Public ratings or reviews on listener profiles — use quality metrics internally only.
- ❌ Tipping or gifting.
- ❌ Any individual seeker's spend as a marketing angle — it is private data.

### The listener playbook
What made the best LeanOn listeners work: genuine, active listening (asking, engaging, remembering); consistency (seekers can predict they'll be there — published weekly hours now make this visible); and treating the seeker's stories as worth hearing, not as a job. Screen for **empathy and active listening** above credentials. The admin review should probe this, not just check documents.

---

## 16. Decided but not yet built (code still behaves like LeanOn)

Implementation status belongs in STATUS.md; this list exists only so nobody mistakes current code for the decision. Remove an item when it ships.

| Decision (2026-10-25) | Code today |
|---|---|
| Google sign-in | Built; off until configured (`NEXT_PUBLIC_GOOGLE_AUTH_ENABLED`, docs/GOOGLE_SIGN_IN.md). Account linking (Google ↔ phone) not built |
| Scheduled sessions | Built (migration 077, docs/SCHEDULED_SESSIONS.md). Partial charges for late cancellation / seeker no-show not built (all refunds are full until decided) |
| Whop payments and payouts | Razorpay / RazorpayX still wired (`TODO(whop)`); listener application still asks for Indian bank details (IFSC/UPI) |
| Rule-based moderation only | Matches code; the LeanOn "Claude moderation" plan is dropped |
| India / NRI content removed | Done 2026-10-26: India/NRI/other-country pages, blog and support hubs deleted; home page rebuilt for the UK. Remaining gaps: listener payout details (IFSC/UPI) until Whop |
