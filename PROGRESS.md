# Progress — beest -> generic YSWS template

Goal: fork hackclub/beest into a whitelabel, config-driven YSWS platform template,
same UX shape, original (non-beest) visual theme, deployable to Vercel. Reference
clone (read-only, do not edit) lives at `/workspace/t-1786057735.891019/beest`.

Read this file first each session, update it before stopping.

## Decisions made (don't re-litigate these)

- **2026-08-06 update from operator**: "Hack Club" wording STAYS — all YSWS programs
  are Hack Club programs, so hackclub.com URLs, HCA auth, "Hack Club" branding text
  are correct to keep, not strip. Genericize only: the "Beest" name itself, the
  "pipes" currency display name, event-specific dates/location, and any specific
  people's names — not the Hack Club org affiliation. This narrows scope: don't
  touch hackclub.com references or "Hack Club" copy going forward.
- Repo is live: https://github.com/EDRipper/ysws-template (private, under the bot's
  own account for now — pushes there run without a manual click per policy, so this
  is the fast-iteration home; can be moved/forked to the hackclub org later).
  Push after every meaningful chunk, not just at milestones — operator wants
  frequent pushes, not batched ones.
- **Vercel is live, two projects, git-connected (auto-deploy on every push to
  `master`, no click needed)**:
  - `ysws-template` (prj_yne5UasoeJeyOZeG5EDj875UO5Qj) — frontend, rootDirectory
    `frontend`, uses `@sveltejs/adapter-vercel`. Env: `BACKEND_URL` set.
  - `ysws-template-api` (prj_usZkQUt9DRJeljF0edxm5dmI7myh) — backend, rootDirectory
    `backend`, single serverless function at `backend/api/index.ts` wrapping the
    whole Nest app (`backend/src/serverless.ts`, cached Express instance across
    warm invocations), `backend/vercel.json` rewrites everything to it and
    `includeFiles`s `../ysws.config*.json` so the config loader can find it at
    runtime. Env set: `FRONTEND_URL`, `JWT_SECRET` (generated). NOT set (operator
    must add via Vercel dashboard before the backend actually boots):
    `DATABASE_URL` (needs a real Postgres — Vercel Postgres/Neon marketplace
    product, didn't provision this myself since it's a billing-adjacent decision),
    `CLIENT_ID`/`CLIENT_SECRET` (HCA OAuth app credentials for whatever program
    this deployment is for).
  - Vercel token stored locally at `/workspace/t-1786057735.891019/.secrets/vercel_token`
    (outside the git repo, gitignored anyway) — full-scoped, given by operator
    2026-08-06. Team: `team_MySQEwuYuxDGtRioxitcuriY` (euan@hackclub.com).
  - Verified locally before pushing: `cd frontend && npm install --include=dev &&
    npm run build` succeeds end to end with the vercel adapter output
    (`.vercel/output/{config.json,functions,static}`). Backend: `npm install
    --include=dev && npx tsc --noEmit` is clean (includes `api/index.ts` and
    `src/serverless.ts`).
  - **Sandbox gotcha, don't lose an hour to this again**: this environment sets
    `NODE_ENV=production` globally, so plain `npm install` silently skips
    devDependencies (kit/vite/adapter/nest-cli/typescript all vanish with zero
    error). Always use `npm install --include=dev` here for a real local check.
  - Repo pushes are git/gh on an EDRipper-owned repo, so `run_privileged` runs
    them immediately with just a notice, no click — push after every meaningful
    chunk per operator's instruction, don't batch.

- **Currency**: do NOT rename internal DB columns / entity fields / variable names
  (`pipes`, `pipesGranted`, `pipesSpent` stay as-is in backend/src — renaming touches
  migrations and is not worth the risk). Instead, all USER-FACING currency text goes
  through `YswsConfigService.currency` (`nameSingular`/`namePlural`/`symbol`) and
  `formatCurrency(amount)`. Frontend gets the same values via the config endpoint
  (TODO: expose `GET /config/public` or bake into `+layout.server.ts` — not done yet).
- **Vercel + NestJS**: not rewriting the backend into Vercel route handlers (too
  invasive, breaks "full functionality"). Wrapping the existing Nest app as ONE
  serverless function (`api/index.ts`) via `@vercel/node` + Nest's Express adapter.
  Not yet implemented (task #6).
- **Postgres**: Vercel Postgres (Neon-backed) via `DATABASE_URL` env var, no code
  changes needed beyond what's already there (`TypeOrmModule.forRootAsync` already
  reads `DATABASE_URL`). Just needs documenting in SETUP.md (not done yet).
- **Config file**: `ysws.config.json` (gitignored, real deployment secret-adjacent
  values like admin emails/slack IDs) + `ysws.config.example.json` (committed,
  filled with placeholder values, doubles as the fallback so a fresh checkout boots).
  Schema at `ysws.config.schema.json`. Backend loader:
  `backend/src/ysws-config/ysws-config.{module,service}.ts` — `@Global()` module,
  injectable `YswsConfigService`, loaded synchronously in the constructor (not
  `onModuleInit`, to avoid factory-ordering races with other modules that inject it
  during `useFactory`, e.g. `JwtModule.registerAsync` in `auth.module.ts`).

## Done

- [x] Vendored `backend/`, `frontend/`, `asset pack/` from the beest reference clone.
- [x] `ysws.config.schema.json` + `ysws.config.example.json` at repo root.
- [x] `YswsConfigModule`/`YswsConfigService` (backend/src/ysws-config/), wired
      globally into `app.module.ts`.
- [x] `auth.module.ts` JWT issuer/audience now reads `yswsConfig.program.shortName`
      instead of hardcoded `'beest'` (proof-of-concept for the pattern — repeat this
      for every other hardcoded 'beest'/'Hack Club'/'pipes' string).
- [x] `auth.service.ts` `return_to: '/join/beest'` -> `` `/join/${yswsConfig.program.shortName}` ``.

## Scope found (grep counts, backend/src + frontend/src, 2026-08-06)

- `beest`/`Beest`: 36 files (mostly comments/JSDoc — low priority to fix but do it;
  a handful are functional: `auth.module.ts` issuer/audience [DONE], `return_to:
  '/join/beest'` in `auth.service.ts` [TODO], `ATTEND_EVENT_SLUG: 'beest'` [already
  env-driven via `attend.service.ts`, no fix needed — that hardcoded value only
  appears in `.spec.ts` test fixtures, leave it]).
- `pipe`/`pipes`: 45 files. Internal field/column names — leave alone (see decision
  above). Grep for user-facing strings specifically: search for `pipes` inside
  string literals/template strings that reach an HTTP response or a Svelte
  component, not inside comments or DB column refs.
- `hack club`/`hackclub`: 32 files — mostly URLs to hackclub.com services
  (hackatime, hcb, attend, slack) which are legitimate integrations, not branding
  to strip. Only touch actual display copy ("Hack Club", "powered by Hack Club"
  strings shown in UI), not integration hostnames/API endpoints.

## Next up (in order)

1. **Task #4 — backend genericization**: systematically walk the 36 `beest`-mention
   files and replace functional (non-comment) hardcoded strings with
   `YswsConfigService` calls. Priority order: `auth.service.ts` (`/join/beest`
   redirect path), anything under `admin/` that emits user-facing labels,
   `entities/*.ts` doc comments (low priority, do last).
2. **Frontend**: add a way for SvelteKit to read `ysws.config.json` — likely a
   `src/lib/config.ts` that imports it at build time (SvelteKit can import JSON
   directly) plus expose `theme.accentColor` etc to a root layout. Then start the
   visual restyle (task #5) — grep `frontend/src` for hex colors / tailwind color
   classes to scope the theme work before touching component-by-component.
3. Don't forget: `frontend/static/images` and `asset pack/` likely contain
   Beest-branded illustrations/mascot art — inventory these, they need placeholder
   replacements or removal, not just CSS changes.
4. Vercel wiring (task #6) and SETUP.md (task #7) come after the genericization
   passes are substantially done, not before — no point wiring hosting for code
   that still says "Beest" everywhere.
5. Once frontend build is verified (`npm run build`, static only, no real secrets),
   report to operator in the Slack thread and ask before creating a real repo or
   deploying.

## Architectural flag (not fixing this pass, just documenting)

`auth.service.ts` authenticates via `auth.hackclub.com` (HCA — Hack Club's own
identity/age-verification OAuth provider), hardcoded as the `authorizeUrl`/
`tokenUrl`/`userinfoUrl`. This is genuinely Hack-Club-specific infra, not just a
branding string — a non-Hack-Club org forking this template cannot use it as-is,
they'd need their own OAuth identity provider wired in instead. Redesigning auth to
be provider-agnostic is out of scope for "genericize the branding" and would be a
much bigger change (new abstraction layer, different user/session shape depending
on provider). Leaving HCA as the default and flagging this clearly in SETUP.md as
"you need to either get HCA access for your program or swap this module" is the
realistic outcome, not rebuilding auth. Same likely applies to `hackatime` and
`hcb` integration modules — check those next tick, they may be genuinely optional
(config already has `hackatimeEnabled`/`hcbEnabled` flags) vs `auth` which is not
optional.

## Known risks / things to double check later

- Currency `formatCurrency()` helper is unused so far — nothing calls it yet.
  Verify it actually gets threaded through once genericization starts, don't let
  it become dead code.
- `YswsConfigService` looks for `ysws.config.json` relative to `process.cwd()` at
  two candidate paths (cwd and cwd/..) since local dev runs from `backend/` but the
  Vercel function's cwd will differ — revisit once task #6 defines the actual
  Vercel function entrypoint and confirm the path resolution actually works there.
