# Zaltrex Technology · v2

A bilingual, motion-led corporate website built with **Next.js App Router, React, TypeScript and Tailwind CSS**. Arabic/RTL is the default; English/LTR is one click away. A server-side Gemini assistant helps customers understand the next step without inventing commercial information.

## What changed

- A bespoke blue/white/navy interface, floating digital studio and three interactive concepts: websites, automation and AI. **No video files, fake dashboards or fabricated achievement metrics.**
- Scroll reveals, hover details, animated connections, a global animation-pause control and support for reduced-motion preferences. All content remains readable without JavaScript.
- All five routes, navigation, metadata, forms, validation, statuses and error messages have Arabic and English copy.
- Local IBM Plex Sans Arabic and Manrope WOFF2 fonts; no browser font CDN. Font licenses are in `public/fonts/`.
- A responsive, keyboard-accessible AI chat with prompts, conversation context, loading/error/retry states and a human-contact path.
- The original shared Supabase schema and strict RLS remain intact; a follow-up migration adds bilingual content.

## Actual integration status

- **Supabase remote setup has NOT been executed or verified.** No Supabase MCP tool/project configuration was available. Local PostgreSQL tests are not proof of a deployed database.
- Until Supabase is configured, catalog/forms display honest setup states. A form only reports success after a real insert. There are no fake leads or requests.
- **Live Gemini replies were verified in Arabic through `/api/chat` and in English through the actual browser chat.** These were real provider responses, not fixtures.
- The supplied `gemini-flash-latest` model returned HTTP 503 during testing. The server keeps it as primary and can fall back to the successfully tested `gemini-3.1-flash-lite`. Neither credentials nor raw provider errors go to the browser.
- Live preview uses a development-only memory quota. **Production chat fails closed until durable Redis and a private rate-limit salt are configured.** See [AI_SETUP.md](AI_SETUP.md).
- The separate Admin Panel is not included in this project. It must connect to the same Supabase project and obey the same RLS policies.

## Start locally

Use **Node.js 22+** (`.nvmrc` contains `22`).

```bash
npm ci
cp .env.example .env.local
# Fill in your own values; never commit .env.local.
npm run dev
```

Open `http://localhost:3000`. The server binds to `0.0.0.0` for live-preview environments. Arena's preview hosts, localhost and 127.0.0.1 are allowed in development; production retains same-origin request checks.

For a production build:

```bash
npm run build
npm run start
```

Set the deployment environment variables on your hosting platform. Do not put private keys in `NEXT_PUBLIC_*` variables. The downloadable archive contains only `.env.example`, **not** the private local environment.

## Environment

| Variable                                              | Purpose                                                                                 |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                            | Shared Supabase project URL                                                             |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`                | Public publishable key; preferred                                                       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`                       | Optional legacy public anon key, if not using a publishable key                         |
| `GEMINI_API_KEY`                                      | Private server-side Google credential                                                   |
| `GEMINI_MODEL`                                        | Primary model; defaults to `gemini-flash-latest`                                        |
| `GEMINI_FALLBACK_MODEL`                               | Secondary model; defaults to `gemini-3.1-flash-lite`; `none` disables fallback          |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Private durable production rate limiter; HTTPS `*.upstash.io` endpoint                  |
| `AI_RATE_LIMIT_SALT`                                  | Private random string, at least 32 characters; required in production                   |
| `AI_TRUST_PROXY`                                      | `false` by default. Set `true` only behind a proxy that overwrites forwarded-IP headers |
| `SITE_URL`                                            | Canonical full HTTPS site URL for production metadata and origin validation             |

Never use a Supabase **service-role/secret key** in the public website or the Admin Panel browser. Admin privileges come from authenticated profiles and RLS, not from a privileged frontend credential.

## Routes

| Route              | Experience / data                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `/`                | Interactive hero, concept cards, process, AI CTA and FAQ; localized published hero copy when available  |
| `/about`           | Proposed brand copy plus localized published about/mission text and optional Cloudinary image           |
| `/solutions`       | Concept overview plus genuinely published active services                                               |
| `/contact`         | Validated contact insert into `contact_messages`; no public read permission                             |
| `/request-service` | Existing-account sign-in, active-service selection, authenticated insert and five latest owned requests |
| `/api/chat`        | Server-only Gemini generation; read-only public knowledge, never private customer records               |

A locale cookie (`zaltrex_locale`) remembers `ar` or `en`. It is validated, HTTP-only, SameSite=Lax and secure in production. Routes retain the requested paths rather than introducing `/ar` and `/en` URL prefixes. Dynamic content is not automatically machine-translated.

## Supabase setup — shared with the Admin Panel

In an empty/new Supabase project, apply these files **in order**, using the SQL Editor or an authorized Supabase MCP connection:

1. `supabase/migrations/202610020001_zaltrex_initial.sql`
2. `supabase/migrations/202610030001_bilingual_content.sql`

Then run the read-only checks in:

- `supabase/verify.sql`
- `supabase/verify-bilingual.sql`

The initial migration is atomic and intentionally rejects incompatible existing tables rather than dropping data or silently accepting an insecure schema. Back up and review existing databases first.

Create client accounts through Supabase Auth. The Auth trigger/backfill always assigns `client`, regardless of user-supplied metadata. Follow the trusted SQL-owner bootstrap instructions in `verify.sql` for the first admin, substituting your own existing Auth UUID. **Do not let clients choose their role.**

The public request flow accepts existing email/password accounts; this version does not expose public signup. New prospects can use Contact or the AI assistant. The Admin Panel and website can share the database without automatically sharing browser sessions across different origins.

### Tables and privileges

| Table              | Public / client access                                                                                | Admin access                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `profiles`         | Authenticated own read/name update; no self-promotion or Auth-owned email changes                     | Read/update profiles under policy                                                         |
| `services`         | Active records only; no client mutations                                                              | Read, insert, update, delete; referenced services must be deactivated rather than deleted |
| `contact_messages` | Public insert with an unread default; no public read/update/delete                                    | Read/update/delete                                                                        |
| `service_requests` | Verified client can insert their own pending request for an active service and read their own history | Read/update all; no delete permission                                                     |
| `site_content`     | Public read                                                                                           | **Update existing rows only**, not insert/delete through the normal API                   |

Auth UUID foreign keys, cascading client deletion, restricted service deletion, column grants, profile guards and a non-recursive private admin helper enforce these boundaries. Application inserts do not append `.select()` where the role lacks read permission. `client_id` comes exclusively from a verified Auth user, never from a hidden field.

### Bilingual editable content

Services keep their existing `title` and `description`, with optional translation objects:

```json
{
  "title_i18n": { "ar": "اسم الخدمة", "en": "Service name" },
  "description_i18n": { "ar": "وصف الخدمة", "en": "Service description" }
}
```

Only `ar` and `en` string values are allowed, with size constraints. The original values remain a fallback for old data. Prices have **no configured currency**; the app does not fabricate one.

The follow-up migration provisions twelve blank locale-specific `site_content` rows alongside the six original keys. Use `<section>_ar` and `<section>_en`. English can fall back to a legacy base key; Arabic falls back to Arabic UI copy instead of displaying English company prose. Admins update predefined rows and use HTTPS `res.cloudinary.com` image URLs.

## AI behavior and limits

See the Arabic deployment guide in [AI_SETUP.md](AI_SETUP.md).

- The assistant identifies as AI and explains/drafts requirements, rather than pretending to be a human sales agent.
- Its context contains only up to ten active public services and localized public About copy. It cannot read profiles, contact messages, or requests, and has no write/action tools.
- It does not submit a message or request on the customer's behalf. A real form submission and, for requests, real authentication are required.
- The server enforces same-origin requests, JSON-only bounded bodies, strict roles/history, timeouts and localized sanitized errors.
- Fallback is limited to transient failures/network errors or a missing primary model. It is **not** used to evade provider rate limits, invalid credentials, or safety refusals.
- Production quotas: 8/minute and 60/day per hashed visitor bucket, plus 500/day globally. With proxy trust off, the visitor bucket is intentionally shared. Redis errors **and the SDK's fail-open timeout responses are explicitly denied**.
- Development quotas: 12/minute and 100/day, shared and reset on process restart. These are not a deployment substitute for Redis.
- Conversation lives in component memory, not the app database. Messages are sent to Google to generate replies. The UI warns users not to send secrets; configure your own privacy policy and provider account/data terms before launch.

Public Supabase contact insertion can be called outside your UI. RLS prevents unauthorized data access, but does not by itself prevent public-form spam. Add an appropriate CAPTCHA/edge rate limiter before exposing a high-traffic production contact endpoint.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run test:db
npm run test:ai-security
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

Current suites contain **85 local PostgreSQL/schema/RLS checks**, **35 browser checks** and **9 local AI quota/fail-closed checks**. Browser response/outage fixtures are clearly labeled as mocks and are distinct from the separately performed live Gemini calls.

**Final local validation passed:** TypeScript, ESLint (zero warnings), production build, 85 SQL/RLS checks, 35 browser checks against the production build, and 9 AI guard checks. Production dependency audit: **0 vulnerabilities**. The supplied Gemini credential occurred **0 times in 21 scanned browser-build assets**. The unconfigured production chat correctly refused requests with HTTP 503/private no-store rather than calling a paid API without durable protection. Final desktop/mobile review reported 0 browser runtime errors and 0 reduced-motion hydration warnings.

These results do not constitute remote Supabase execution or a configured production Redis deployment. Live provider success was separately verified in the development integration; provider availability can change.

Development lint dependencies currently have five high advisories in `npm audit`; the forced recommendation downgrades framework tooling. Do not blindly run `npm audit fix --force`. Recheck advisories and compatible releases before release; production dependencies are audited separately.

## Project map

```text
src/app/                 Five routes, localized actions, root layout and /api/chat
src/components/          Brand, responsive chrome, motion studio, forms and chat
src/lib/i18n.ts          Arabic/English dictionaries and service localization
src/lib/ai/              Public knowledge and server-only rate limiting
src/lib/supabase/        Public-env validation and per-request SSR/browser clients
src/proxy.ts             Auth-cookie refresh and private cache safeguards
supabase/migrations/     Initial strict schema and bilingual follow-up
supabase/verify*.sql      Remote verification/bootstrap instructions
scripts/                 Isolated PostgreSQL and AI guard tests
public/fonts/            Self-hosted WOFF2 fonts and OFL licenses
```

`npm run format` formats source and test files. The central App Router layout is `src/app/layout.tsx`. Both migrations and the lockfile are included in the archive; dependencies, build outputs, test traces and credentials are not.
