# Setup

This repo is a whitelabel fork of [hackclub/beest](https://github.com/hackclub/beest), the
platform behind a "You Ship We Ship" (YSWS) program: participants sign in, ship projects, get
reviewed, and spend earned currency in a shop. It keeps beest's full backend (NestJS + TypeORM +
Postgres) and frontend (SvelteKit) functionality and UI shape, with the program-specific branding,
currency name, and dates pulled out into one config file, and an original (non-beest) visual theme.

## 1. Configure your program

Copy the example config and fill in your own values:

```bash
cp ysws.config.example.json ysws.config.json
```

See `ysws.config.schema.json` for the full field list. Key ones:

- `program.name` / `program.shortName` — display name and a lowercase-hyphenated slug. The slug is
  used as the JWT issuer/audience and in OAuth `return_to` paths, so pick it once and don't change
  it after real users exist.
- `currency.nameSingular` / `namePlural` / `symbol` — every user-facing mention of the platform's
  reward currency reads from this (internal DB columns stay named `pipes`/`pipesGranted` regardless
  — that's an implementation detail, not something participants see).
- `theme.accentColor` — the one deliberate accent color used across the UI (see "Theming" below).
- `admin.contactEmail`, `event.*`, `integrations.*`, `shop.categories`, `social.*` — see the schema.

`ysws.config.json` is gitignored — it's meant to hold your program's real values, not go in version
control. Both the backend and frontend fall back to `ysws.config.example.json` if `ysws.config.json`
is missing, so a fresh checkout still boots (with placeholder values) before you've configured it.

## 2. Auth — you need Hack Club Auth (HCA) access

`backend/src/auth/auth.service.ts` authenticates through `auth.hackclub.com` (HCA), Hack Club's own
identity/age-verification OAuth provider. This is genuinely Hack Club infra, not just a branding
string — this template assumes your program is a Hack Club program with an HCA client ID/secret. If
that's not true for you, you'll need to swap this module for your own OAuth provider; that's a real
code change, not a config toggle.

Backend env vars needed: `CLIENT_ID`, `CLIENT_SECRET` (from HCA), `JWT_SECRET` (any random 32+ byte
value — signs your own session JWTs, not HCA-related), `REDIRECT_URI`.

Similarly, `hackatime` (coding-time tracking) and `hcb` (Hack Club Bank, for reward card grants) are
Hack Club-specific integrations — `ysws.config.json`'s `integrations.hackatimeEnabled` /
`hcbEnabled` flags let you turn them off if your program doesn't use them, but turning them on means
you need real Hack Club API access for those services too.

## 3. Database

Postgres via TypeORM. `DATABASE_URL` env var, standard `postgres://user:pass@host:port/db` format.
Migrations run automatically at boot (`migrationsRun: true` in `backend/src/app.module.ts`) — never
rely on `synchronize`, it's off on purpose.

## 4. Deploying

This repo builds cleanly for two different targets from the same code — pick one, or use both:

### Vercel

- Frontend: import the repo into Vercel with **root directory `frontend`**. It uses
  `@sveltejs/adapter-vercel` automatically (`svelte.config.js` detects Vercel's `VERCEL=1` build env
  var and switches adapters — see "Dual adapter" below).
- Backend: import the repo again as a **second** Vercel project, root directory `backend`. The whole
  NestJS app runs behind one serverless function (`backend/api/index.ts` wraps it via
  `backend/src/serverless.ts`, an Express instance cached across warm invocations).
  `backend/vercel.json` rewrites every request to that function and bundles `ysws.config*.json`
  into the function (`includeFiles`) so the config loader can find it at runtime.
- Env vars: set `BACKEND_URL` on the frontend project (pointing at the backend project's URL) and
  `FRONTEND_URL` on the backend project (for CORS), plus everything in sections 2–3 above on the
  backend project. For Postgres, Vercel's own Postgres product (Neon-backed) works out of the box —
  just set `DATABASE_URL` to what it gives you.

### Docker / self-hosted (Orchard, Railway, Fly, a VPS, anything that runs containers)

- `backend/Dockerfile` and `frontend/Dockerfile` both already exist (vendored from beest's own
  production setup) and work unmodified — `docker build` each, run with the env vars from sections
  2–3, backend listens on `:3001`, frontend on `:3000`.
- `.github/workflows/docker-publish.yml` builds and pushes both images to
  `ghcr.io/<owner>/ysws-template-{backend,frontend}:latest` on every push to `master` — point your
  host's deployment at that image rather than building from source, if it works that way (this is
  how Hack Club's own Orchard PaaS expects it — it deploys from a pre-built image reference, not by
  building your Dockerfile itself).
- The two containers need to reach each other: same as Vercel, set `BACKEND_URL` on the frontend
  container and `FRONTEND_URL` on the backend container to wherever the other one is actually
  reachable (internal service DNS name, or a public URL — whatever your platform gives you).

### Dual adapter (why this matters if you touch `svelte.config.js`)

`frontend/svelte.config.js` picks `@sveltejs/adapter-vercel` when `process.env.VERCEL` is set (Vercel
sets this automatically during its own build) and `@sveltejs/adapter-node` otherwise (what the
Dockerfile's `npm run build` produces — outputs to `build/`, run with `node build`). If you hardcode
one adapter, you silently break the other deploy path — verify both `npm run build` (plain) and
`VERCEL=1 npm run build` still work if you change this file.

## 5. Theming

`frontend/src/routes/+layout.svelte` defines a token-based design system at `:global(:root)`:
`--color-bg`, `--color-bg-elevated`, `--color-bg-elevated-2`, `--color-border`, `--color-text`,
`--color-text-muted`, `--color-text-faint`, `--color-danger`, `--color-success`, `--color-warning`,
and `--color-accent`/`--color-accent-hover`/`--color-accent-text` (the last two derived from
`--color-accent` via `color-mix()`). Only `--color-accent` is config-driven (`theme.accentColor`) —
the neutral scale is fixed, chosen deliberately to avoid the generic AI-slop tells (default shadcn
zinc/slate, cream backgrounds, purple/blue gradients). If you want a different neutral palette,
edit the `:root` block directly.

Most of beest's original UI still has its own hardcoded colors in per-component `<style>` blocks
(it never had a central stylesheet) rather than referencing these tokens yet — see `PROGRESS.md` for
the state of that migration if you're picking this work up.

## 6. What's genuinely Hack-Club-specific vs. generic

Kept as-is (real integrations, not branding — see the auth section above): `auth.hackclub.com` (HCA),
`hackatime.hackclub.com`, HCB (`hcb.hackclub.com`), Slack OAuth, `attend.hackclub.com`. "Hack Club"
as organizer wording is also kept throughout — this template is meant for other Hack Club-affiliated
YSWS programs, not fully external orgs (per the operator: "all YSWSs are under hack club").

Stripped/genericized: the "Beest" program name and its "pipes" currency display name, event-specific
dates/locations, Beest's custom visual theme (colors, and its two custom display fonts — removed
outright, unknown license, not safe to redistribute), and any references to specific people.
