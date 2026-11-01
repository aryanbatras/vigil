# Vigil

**The second factor, on the record.**

Vigil is a multi-factor authentication console built with **Next.js, Clerk and Supabase**. It is a deliberate second answer to the same brief as [MFA System](https://github.com/aryanbatras/MFA-system). The first build used Better Auth, Turso and Resend; Vigil moves identity to Clerk and the audit trail to Supabase.

> **Built with [IBM Bob](https://www.ibm.com/bob).** Product direction, interface and the original MFA experiment by **Indeep Kour**. Implementation, review and documentation were produced with IBM Bob.

- Landing page: a type-led, teal-and-paper statement with one credited Pexels photograph.
- Auth: Clerk owns the email factor, authenticator app, backup codes and sessions.
- Console: a protected overview, security settings and an audit ledger.
- Ledger: Supabase Postgres, written only by the Next.js server with the service-role key.
- The browser never receives a Supabase key. Vigil never stores TOTP secrets or backup codes.

---

## Status

The MFA flow and the audit ledger are wired to live services and were exercised end to end.

| Area | State |
|---|---|
| Build, types, lint | Passing. `npm run build`, `npx tsc --noEmit` and `npm run lint` succeed. |
| Clerk instance | Development instance in **test mode**, with `email_code` as the first factor, plus `totp` and `backup_code` as second factors. Require-MFA is on. |
| Sign-up and email verification | **Tested** on the deployed site with a real address. |
| Returning sign-in | **Tested.** Email code, then the TOTP challenge at `/sign-in/factor-two`. |
| TOTP enrollment | **Tested.** Clerk issued the secret, a generated code was accepted, and backup codes were issued. |
| Dashboard gate | **Tested.** `/dashboard` refuses to open until TOTP is enrolled, then opens on the next server read. |
| Supabase ledger | **Connected and tested.** `posture_verified` rows are written through `POST /api/audit` with the service-role key. |
| Ledger immutability | **Tested against the live project.** `PATCH` and `DELETE` on `security_events` return `42501 permission denied`. |
| Clerk webhook | **Live and verified.** Signed `user.created` / `user.updated` deliveries wrote `mfa_state_changed` rows; forged and stale signatures return `401`. |
| Session revocation | **Tested.** Revoking from the UI writes a `session_revoked` row after the server confirms the session is inactive. |
| Vercel | **Deployed** at `vigil-mfa-system.vercel.app`. |

### What was actually tested

All of the following ran against the deployed site at `vigil-mfa-system.vercel.app`, not just localhost.

- Landing page at desktop and mobile widths, and the branded 404.
- Sign-up with a real address, email-code verification, and Clerk's required MFA task.
- TOTP enrollment with a generated six-digit code, followed by backup-code issuance.
- Redirect to `/dashboard/security`, then `/dashboard` opening because `totpEnabled` was true server-side.
- Returning-user sign-in: email code, then the `/sign-in/factor-two` TOTP challenge, then the console.
- `POST /api/audit` writing a verified `posture_verified` row to the live Supabase project.
- `GET /api/audit` rendering rows on `/dashboard/activity`.
- Signed Clerk webhook delivery: `user.created` and `user.updated` produced `mfa_state_changed` rows with real `svix-id` values.
- Session revocation from the UI, with the `session_revoked` row written server-side.
- Webhook rejection: missing, forged and stale-timestamp signatures all return `401`.
- `PATCH` and `DELETE` rejection on `security_events` with the service-role key.
- Production build, lint and TypeScript compilation.

One race was found and fixed during this pass: Clerk can still report a session as `active` for a moment after `revoke()` resolves, so the first audit write could be refused with `409` and silently dropped. `session-list.tsx` now retries the write until Clerk settles and warns if it still cannot record.

Not yet exercised: backup-code sign-in, and MFA removal on a live account (both would lock out the demo account).

### Test mode is deliberate

This build runs on a Clerk **development** instance and uses `pk_test_` / `sk_test_` keys. That is intentional for a college submission: it keeps the demo self-contained and avoids a production instance. Sign-in is email-code based. Two kinds of address work:

- A test address such as `name+clerk_test@example.com` accepts the fixed code `424242` and sends no email.
- A real address receives an actual message from Clerk's development sender. That sender is rate limited, so use a test address for repeated demos.

A production deployment would need its own Clerk instance, `pk_live_` / `sk_live_` keys, and a configured email provider. Nothing in the application code changes.

---

## Architecture

```text
Browser
  ├─ Clerk components ......... sign-up, email verification, sign-in, TOTP challenge
  ├─ Console UI ............... dashboard, security settings, session list
  └─ fetch("/api/audit") ...... same-origin JSON only
        │
        ▼
Next.js server (Node runtime)
  ├─ Clerk Backend API ........ currentUser(), getUser(), getSession()
  ├─ /api/audit ............... verifies the caller, re-reads Clerk, writes a snapshot
  ├─ /api/webhooks/clerk ...... verifies the Svix signature, writes on state change
  └─ Supabase service role .... select + insert only; RLS enabled
        │
        ▼
Supabase Postgres
  └─ public.security_events ... append-only, no browser access
```

### The division of responsibility

| Concern | Owner |
|---|---|
| Identity, email verification, sessions | Clerk |
| TOTP secret and verification | Clerk |
| Backup codes | Clerk |
| MFA challenge at sign-in | Clerk |
| Dashboard authorization gate | Vigil server (`src/proxy.ts` + secured layout) |
| Audit evidence | Supabase Postgres |
| Ledger authorization | Vigil server; service-role key stays server-side |
| Visual design and copy | Vigil |

The ledger deliberately does **not** try to become a second identity store. It keeps a Clerk user ID, the MFA booleans Clerk reports, the source of the write, and a timestamp. No secret, code, email body or session token is stored there.

---

## Authentication and MFA flow

### New account

```text
/sign-up
  -> email address (+ password if the Clerk instance still has passwords on)
  -> six-digit email code
  -> /dashboard/security
  -> "A second factor is required."
  -> scan the authenticator QR
  -> verify one six-digit TOTP code
  -> dashboard gate opens
  -> optionally generate single-use backup codes
```

### Returning account

```text
/sign-in
  -> email code
  -> TOTP code (Clerk challenges automatically when MFA is required)
  -> /dashboard
```

### Gate behaviour

- `src/proxy.ts` runs Clerk middleware and protects `/dashboard(.*)` with `auth.protect()`.
- `src/app/dashboard/layout.tsx` renders the console shell for any signed-in user.
- `src/app/dashboard/(secured)/layout.tsx` is the second line of defence. It calls `currentUser()` and redirects to `/dashboard/security` when `user.totpEnabled` is false.
- `/dashboard/security` stays reachable without TOTP so enrollment is possible. Every other console route lives under the `(secured)` group.
- A user who removes their authenticator immediately loses access to the secured routes. Backup codes do not replace the TOTP gate.
- The gate is enforced on the server. Hiding a link in the UI would not be enough.

### What the app never does

- It never creates or stores a TOTP secret in Supabase.
- It never stores backup codes.
- It never trusts a client claim such as `"totpEnabled": true`.
- It never sends the Supabase service-role key to the browser.
- It never writes an audit row from a client component.

`POST /api/audit` re-reads the user from Clerk's Backend API before every write. The optional webhook verifies the signature first. This means a compromised browser can ask for a state snapshot, but it cannot invent the state that gets recorded.

---

## Security model

| Control | Implementation |
|---|---|
| First factor | Clerk. Intended configuration: email code, no password. |
| Second factor | Clerk authenticator application (TOTP, 30-second rotation). |
| Recovery | Clerk backup codes, single use, shown once. |
| Sign-in challenge | Clerk must have MFA required; the app cannot force the challenge itself. |
| Dashboard gate | Server-side `currentUser().totpEnabled` check in the secured layout. |
| Route protection | Clerk middleware in `src/proxy.ts`. |
| Audit authorization | Signed-in Clerk user + server-side Clerk Backend API read. |
| Audit storage | Supabase service role only; RLS enabled with no policies. |
| Audit integrity | `select` + `insert` grants only; `before update or delete` trigger raises an exception. |
| Webhook authenticity | Svix-compatible HMAC-SHA256, five-minute timestamp window, timing-safe comparison. |
| Webhook idempotency | Unique `clerk_event_id` (`svix-id`); duplicate deliveries return success. |
| Session revocation | Client asks Clerk to revoke; server checks ownership and inactive status before recording. |
| Secret handling | `.env*` ignored except `.env.example`; service-role key and Clerk secret are server-only. |
| Browser data | No TOTP secret beyond the one-time QR render; no backup codes after they are displayed. |
| Motion | Reveal animations respect `prefers-reduced-motion`. |

### Honest limits

- Clerk controls rate limiting, lockout, email deliverability and the MFA challenge. Vigil does not reimplement them.
- The audit API relies on the Clerk session cookie and same-origin JSON requests. There is no separate CSRF token; Next.js does not add permissive CORS headers to these routes.
- The service-role key can bypass RLS by design. The append-only trigger and reduced grants narrow the damage a bug can do, but a database owner can still alter the schema.
- Backup codes are shown once by Clerk. Vigil cannot recover a lost set; it can only ask Clerk to generate a new set.
- The current demo instance is not a production security configuration. It is in Clerk test mode and is explicitly flagged as a development instance.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Radix primitives, Sonner |
| Identity | Clerk 7.9 (`@clerk/nextjs`) |
| Ledger | Supabase Postgres + `@supabase/supabase-js` |
| Icons | Lucide |
| QR rendering | `qrcode.react` |
| Display type | Cabinet Grotesk (local WOFF2) |
| Body / mono | Public Sans, IBM Plex Mono (Google Fonts via `next/font`) |
| Photography | Pexels, downloaded locally and credited |

---

## Repository layout

```text
src/
  app/
    page.tsx                         landing page
    sign-in/[[...sign-in]]/page.tsx  Clerk sign-in
    sign-up/[[...sign-up]]/page.tsx  Clerk sign-up
    dashboard/
      layout.tsx                     console shell, any signed-in user
      security/page.tsx              MFA enrollment (reachable without TOTP)
      (secured)/
        layout.tsx                   TOTP gate
        page.tsx                     overview
        activity/page.tsx            full audit ledger
    api/
      audit/route.ts                 GET ledger, POST verified snapshot
      webhooks/clerk/route.ts        signed Clerk webhook
  components/
    landing/                         hero, record, FAQ, footer, credits
    dashboard/                       MFA manager, session list, audit table
    ui/                              ShadCN-style primitives
  lib/
    audit/store.ts                   server-only Supabase client + queries
    audit/types.ts                   event types and display metadata
    audit/verify.ts                  Clerk Backend API reads
    audit/webhook.ts                 Svix-compatible signature verification
    clerk-appearance.ts              Clerk theme/localization
    site.ts                          site metadata and credits
  proxy.ts                           Clerk middleware
supabase/schema.sql                  table, RLS, grants, append-only trigger
public/media/                        Pexels images + credits.json
public/fonts/                        Cabinet Grotesk WOFF2
```

---

## Quick start

### Prerequisites

- Node.js **20.9 or newer**
- npm
- A Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))
- Optional: a Supabase project ([supabase.com/dashboard](https://supabase.com/dashboard))

### Local setup

```bash
git clone https://github.com/aryanbatras/vigil.git
cd vigil
npm install
cp .env.example .env.local
```

Fill in `.env.local` from the sections below, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is busy, Next.js picks the next free port; update `NEXT_PUBLIC_SITE_URL` if you care about canonical URLs during local development.

Useful checks:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run start
```

---

## Environment variables

Copy `.env.example` to `.env.local`. Never commit `.env.local`.

| Variable | Required | Exposed to browser | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Recommended | Yes | Canonical origin for metadata and Open Graph. Example: `http://localhost:3000`, production: `https://your-domain.tld`. |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Yes | Clerk publishable key (`pk_test_...` or `pk_live_...`). |
| `CLERK_SECRET_KEY` | Yes | **No** | Clerk secret key (`sk_test_...` or `sk_live_...`). Server-only. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Optional | Yes | Sign-in path used by Clerk. Default: `/sign-in`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional | Yes | Sign-up path used by Clerk. Default: `/sign-up`. |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Optional | Yes | Fallback after sign-in. Default in this app: `/dashboard`. |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Optional | Yes | Fallback after sign-up. Default in this app: `/dashboard/security`. |
| `SUPABASE_URL` | Optional* | **No** | Supabase project URL, e.g. `https://abcxyz.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional* | **No** | Supabase service-role key. Bypasses RLS; server-only. |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Optional** | **No** | Svix signing secret (`whsec_...`) for `/api/webhooks/clerk`. |

\* The Supabase pair must be set together. Without both, auth still works and the ledger shows a clear "not connected" state.

\** The webhook also requires the Supabase pair. Without the signing secret, the webhook route returns `501` and the manual "Verify current state" action still works.

The Clerk provider in `src/app/layout.tsx` also passes explicit redirect URLs. The `NEXT_PUBLIC_CLERK_*` variables above are useful when Clerk middleware or hosted components need the same paths; keep them consistent with the explicit props.

---

## Clerk setup

The app is coded against Clerk's current App Router SDK. Clerk's dashboard changes labels occasionally; the concepts below are stable.

### 1. Create or claim the application

1. Open [dashboard.clerk.com](https://dashboard.clerk.com).
2. Create an application named **Vigil**, or open the existing one.
3. If Clerk shows **Claim application**, complete the claim. Some settings and the Clerk CLI are restricted on unclaimed development apps — MFA is not necessarily one of them, but claiming keeps the instance under your control.
4. Start with the **Development** instance. Production needs its own instance and keys.

### 2. Copy the API keys

In **Configure → API keys** (or **API Keys**):

- Copy the **Publishable key** to `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- Copy the **Secret key** to `CLERK_SECRET_KEY`.

Never put the secret key in a `NEXT_PUBLIC_*` variable.

### 3. Set paths and redirects

In **Configure → Paths** (or **User & Authentication → Redirects**):

| Setting | Value |
|---|---|
| Sign-in URL | `/sign-in` |
| Sign-up URL | `/sign-up` |
| After sign-in | `/dashboard` |
| After sign-up | `/dashboard/security` |

Add your local and production origins to the allowed origins list:

```text
http://localhost:3000
http://localhost:3001
https://your-domain.tld
```

The app uses `NEXT_PUBLIC_SITE_URL` for metadata, not for Clerk's origin allow-list. Both must be correct.

### 4. Choose the first factor

The intended flow is **passwordless email code**:

1. **User & Authentication → Email, phone, username**.
2. Enable **Email address** and require it.
3. Set email verification to **Email code**.
4. **Disable Password** if you want a strictly passwordless first factor.
5. Disable social providers such as Google if the only first factor should be the email code.

The instance used for this repository has **Email code** as the first factor and **Google** enabled as an optional social option. It does **not** have Password enabled, so the sign-up screen asks only for an email address. Disable Google if the only first factor should be the email code — the app renders whatever the instance allows and does not hide it.

### 5. Enable and require MFA

In **User & Authentication → Multi-factor**:

1. Enable **Authenticator application**.
2. Enable **Backup code**.
3. Turn on **Require multi-factor authentication** (or the equivalent "require second factor after first factor" setting).

This is the step that makes Clerk challenge the user after the email factor. Without it, a user can sign in with only the first factor even if TOTP is enrolled. The dashboard gate still blocks the console, but the sign-in itself would not be a true two-factor sign-in.

The instance used for this repository has **Authenticator application** and **Backup code** enabled and running on a development instance, so TOTP does not require a paid plan here. If the options are unavailable in your own app, check the instance's plan and settings rather than the application code.

### 6. Optional session policy

The current instance uses single-session mode. That is a product choice, not a requirement. The Sessions tab works with either policy; it lists what Clerk returns and refuses to revoke the current session from the UI.

### 7. Test mode

Clerk development instances support test emails:

```text
your-name+clerk_test@example.com
```

The verification code is `424242`. This is only for development. Never rely on it in production.

### 8. Production instance

Before deploying:

1. Create or switch to the **Production** instance.
2. Add the production domain in Clerk.
3. Copy the `pk_live_...` and `sk_live_...` keys into Vercel.
4. Re-check the sign-in/sign-up paths and allowed origins.
5. Create the production webhook endpoint separately; development and production signing secrets are different.

---

## Supabase setup

Supabase is the audit layer. Auth does not depend on it, but the ledger does.

### 1. Create the project

1. Open [supabase.com/dashboard](https://supabase.com/dashboard).
2. Create a project.
3. Wait for the database to finish provisioning.

### 2. Run the schema

Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.

The script is idempotent and creates:

- `public.security_events`
- indexes on `(user_id, created_at desc)` and `event_type`
- RLS enabled with no policies
- `select` + `insert` grants for `service_role` only
- a `before update or delete` trigger that rejects mutations

If you change the schema later, re-run the whole file; it safely drops and recreates the trigger.

### 3. Copy the server credentials

In **Project Settings → API**:

- Copy **Project URL** to `SUPABASE_URL`.
- Reveal and copy the **service_role** key to `SUPABASE_SERVICE_ROLE_KEY`.

Do **not** use the `anon` key here. The app never talks to Supabase from the browser, and the table has no policies that would let the `anon` role read it anyway.

Restart the dev server after changing env variables.

### 4. Verify

With both variables set, open the console and use **Verify current state**. The server should insert a `posture_verified` row. Then open **Activity** to see it.

If the table is missing, the UI says **"The ledger table is missing."** and points at `supabase/schema.sql`. If credentials are missing, it says **"The ledger is not connected."**

### Table shape

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `gen_random_uuid()`. |
| `user_id` | `text` | Clerk user ID (`user_...`), not a Supabase auth UID. |
| `event_type` | `text` | `posture_verified`, `mfa_state_changed`, `session_revoked`. |
| `totp_enabled` | `boolean` | Verified by the server at write time. |
| `backup_code_enabled` | `boolean` | Verified by the server at write time. |
| `two_factor_enabled` | `boolean` | Clerk's combined flag. |
| `session_id` | `text` | Optional Clerk session ID. |
| `source` | `text` | `server_sync`, `clerk_webhook`, `session_action`. |
| `detail` | `jsonb` | Non-secret context only. |
| `clerk_event_id` | `text` | Unique; Svix message ID for webhook idempotency. |
| `created_at` | `timestamptz` | Database default. |

No secret, code, email body, IP address or user agent is stored in this table.

---

## Clerk webhook setup

The webhook is optional. The manual **Verify current state** button uses the same server-side verification path and is enough to exercise the ledger.

### 1. Create the endpoint

In the Clerk dashboard, open **Configure → Webhooks → Add endpoint**.

- **Endpoint URL:** `https://your-domain.tld/api/webhooks/clerk`
- **Subscribe to events:** `user.created`, `user.updated`

Clerk may deliver other events later; the route returns `{ "ok": true, "skipped": "irrelevant_event" }` for anything it does not handle.

### 2. Copy the signing secret

Copy the endpoint's **Signing secret** (`whsec_...`) into `CLERK_WEBHOOK_SIGNING_SECRET`.

The route verifies:

- `svix-id`
- `svix-timestamp` (rejects anything older or newer than five minutes)
- `svix-signature` (one or more `v1,<base64>` candidates; timing-safe comparison)

It then compares the incoming MFA booleans with the latest row for that user and inserts only when the state actually changed. `clerk_event_id` is unique, so retries are idempotent.

### 3. Local testing

Clerk cannot reach `localhost` directly. Use a tunnel:

```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```

Set the public tunnel URL as the Clerk endpoint, add the signing secret to `.env.local`, restart the dev server, then trigger a user update in Clerk.

If Supabase is not configured, the webhook returns `503`. If the signing secret is missing, it returns `501`. This is deliberate: a webhook that cannot verify or persist should fail visibly.

---

## API routes

### `GET /api/audit`

Returns the signed-in user's latest 50 events.

- `401` when there is no Clerk session.
- `200` with `ok: false` and a reason when the ledger is not configured or the table is missing.
- Never accepts a user ID from the client.

### `POST /api/audit`

Body:

```json
{ "action": "sync" }
```

or

```json
{ "action": "session_revoked", "sessionId": "sess_..." }
```

- `sync`: re-reads the Clerk user, writes a `posture_verified` row.
- `session_revoked`: verifies the session belongs to the caller and is no longer active, then writes a `session_revoked` row.
- `503` when Supabase is not configured.
- `500` when the table is missing or the write fails.
- The browser cannot choose the MFA booleans; they come from Clerk.

### `POST /api/webhooks/clerk`

- Verifies the Svix signature.
- Handles `user.created` and `user.updated`.
- Writes only when the MFA state changed.
- Requires Supabase and `CLERK_WEBHOOK_SIGNING_SECRET`.

---

## Deployment

### Vercel

1. Push the repository to GitHub.
2. In [vercel.com/new](https://vercel.com/new), import the repository.
3. Framework preset: **Next.js**. Build command: `npm run build`. Output: default.
4. Add every variable from `.env.example` under **Project Settings → Environment Variables**:

   ```env
   NEXT_PUBLIC_SITE_URL=https://vigil-mfa-system.vercel.app
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard/security
   SUPABASE_URL=https://<project-ref>.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
   ```

   Mark `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `CLERK_WEBHOOK_SIGNING_SECRET` as **Sensitive**. Never rename any of them with a `NEXT_PUBLIC_` prefix.

5. Deploy.
6. Add the Vercel domain to Clerk's allowed origins and production redirect URLs.
7. Create the Clerk webhook endpoint pointing at the deployment.
8. Redeploy after changing environment variables. Vercel does not apply new env values to an existing build.

`NEXT_PUBLIC_SITE_URL` is read at build time for `metadataBase`. If you deploy to a preview URL first, set it to the final production domain before the production build, or update it and redeploy.

### GitHub

```bash
git init
git add .
git commit -m "Build Vigil MFA console with Clerk and Supabase"
git branch -M main
git remote add origin https://github.com/aryanbatras/vigil.git
git push -u origin main
```

If the repository name differs, update `site.github` in `src/lib/site.ts` so the console's reference links and the landing page point at the real repository.

### Demo checklist (current submission)

- [x] Clerk development instance, test mode, email code as first factor.
- [x] Authenticator application enabled.
- [x] Backup code enabled.
- [x] Require MFA enabled.
- [x] Test keys (`pk_test_`, `sk_test_`) in Vercel.
- [x] Clerk allowed origins include `https://vigil-mfa-system.vercel.app`.
- [x] `NEXT_PUBLIC_SITE_URL` matches the production domain.
- [x] Supabase schema applied to the project.
- [x] Service-role key stored only in Vercel and `.env.local`.
- [x] Webhook endpoint created at `/api/webhooks/clerk` with its own signing secret.
- [x] An account completes email + TOTP + backup-code issuance.
- [x] Returning sign-in completes email + TOTP.
- [x] `/dashboard` opens after enrollment.
- [x] Session revocation writes a `session_revoked` row.
- [x] `security_events` rejects update/delete.
- [x] No `.env.local` or secret is present in the Git history.

### Before calling it production

- [ ] Clerk application claimed and on the intended plan.
- [ ] Switch to `pk_live_` / `sk_live_` keys.
- [ ] Configure a real email provider in Clerk.
- [ ] Decide whether Google stays enabled.
- [ ] Create a separate production webhook endpoint and signing secret.
- [ ] Remove the test account.
- [ ] `/dashboard` redirects to `/dashboard/security` before enrollment.
- [ ] `/dashboard` opens after enrollment.
- [ ] Removing the authenticator closes the gate again.
- [ ] `security_events` rejects update/delete in the SQL editor.
- [ ] No `.env.local` or secret is present in the Git history.

---

## Design and assets

### Direction

The landing page is a type-only statement: deep teal and paper, a two-line `Vigil / MFA` hero, a numbered section system, and one large photograph. The console is the counterpart: graphite, signal teal, compact monospace data, and a persistent gate status. There are no gradients, glass cards or decorative charts; the hierarchy is carried by scale, rules and spacing.

### Type

- **Cabinet Grotesk** for display: local WOFF2 files in `public/fonts/`.
- **Public Sans** for body copy.
- **IBM Plex Mono** for labels, timestamps and ledger data.

### Colour

| Token | Value | Use |
|---|---|---|
| Paper | `#f4f7f2` | Light surfaces |
| Ink | `#06343a` | Light-mode text |
| Teal | `#06525c` | Primary brand surface |
| Teal deep | `#04353c` | Closing sections |
| Mint | `#a9d9d1` | Secondary display type |
| Signal | `#54d6c4` | Console accent |
| Graphite | `#071013` | Console background |

### Photography

The landing page uses one image, `public/media/identity-scan.jpg`, by **panumas nikhomkhai** on Pexels. Six images were sourced and are listed with full attribution in [`public/media/credits.json`](public/media/credits.json). The other five are retained as an unused media library; only the fingerprint image is rendered.

Pexels photos are used under the [Pexels license](https://www.pexels.com/license/). Attribution is included on the page and in the JSON file even where the license does not require it.

### Accessibility

- Semantic headings and landmarks.
- Visible focus rings.
- `prefers-reduced-motion` disables the landing reveal animations.
- Charts and status are expressed with text as well as colour.
- The audit table scrolls horizontally on narrow screens rather than crushing columns.

---

## Credits

- **Indeep Kour** — product direction, interface, original MFA experiment.
- **[IBM Bob](https://www.ibm.com/bob)** — implementation partner: code, review, documentation.
- **[Clerk](https://clerk.com)** — identity, email verification, TOTP, backup codes, sessions.
- **[Supabase](https://supabase.com)** — Postgres audit ledger, RLS, service-role access.
- **[Pexels](https://www.pexels.com)** — photography by panumas nikhomkhai, Christina Morillo, Ketut Subiyanto and Brett Sayles. Full attribution in `public/media/credits.json`.
- **[Fontshare](https://www.fontshare.com/fonts/cabinet-grotesk)** — Cabinet Grotesk.
- **Google Fonts** — Public Sans and IBM Plex Mono.

The first build in this series is [MFA System](https://github.com/aryanbatras/MFA-system), built with Better Auth, Turso and Resend. Vigil is not a migration of that code; it is a second answer to the same brief.

---

## License

MIT. See [`LICENSE`](LICENSE).

Third-party assets keep their own licenses: Cabinet Grotesk (Fontshare), Public Sans and IBM Plex Mono (SIL Open Font License), and the Pexels photographs (Pexels license).
