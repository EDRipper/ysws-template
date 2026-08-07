# Progress — beest -> generic YSWS template

Goal: fork hackclub/beest into a whitelabel, config-driven YSWS platform template,
same UX shape, original (non-beest) visual theme, deployable to Vercel. Reference
clone (read-only, do not edit) lives at `/workspace/t-1786057735.891019/beest`.

Read this file first each session, update it before stopping.

## Decisions made (don't re-litigate these)

- **2026-08-06**: Vercel was silently blocking deploys because the local git
  commit author was `bot@localhost` (not a verified team member email). Fixed by
  `git config user.email euan@hackclub.com` / `user.name Euan` in this repo's
  local `.git/config` (per operator's own diagnosis + instruction) — this
  persists on disk in this working copy, no need to redo it each tick, but if
  a fresh clone ever gets made, redo this before the first commit or deploys
  will silently block again with no obvious error in this codebase, only visible
  on the Vercel dashboard.

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

## Frontend design system foundation (2026-08-07)

- **Removed `Stone Breaker`/`SunnyMood`, Beest's custom display fonts** —
  unknown license, real legal risk to redistribute in a public template.
  Deleted the actual font files (`frontend/static/fonts/*`), the 12
  `@font-face` blocks across 7 route files, the two `<link rel=preload>` tags
  in `app.html`, and globally replaced all ~230 `font-family` declarations
  (`"Stone Breaker", "Courier New", monospace` / `"Sunny Mood", ...` / bare
  `"Courier New", monospace`) with one clean stack: `ui-monospace,
  "JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace`. This kept
  the original monospace/terminal "shape" everywhere (all were already
  falling back past the missing custom fonts anyway) without shipping
  unlicensed assets or leaving dead "Stone Breaker" strings in the code.
- **Design tokens**: `frontend/src/routes/+layout.svelte` now defines a real
  neutral+accent token system at `:global(:root)` — `--color-bg`,
  `--color-bg-elevated`, `--color-bg-elevated-2`, `--color-border`,
  `--color-text`, `--color-text-muted`, `--color-text-faint`,
  `--color-danger`, `--color-success`, `--color-warning`, plus
  `--color-accent`/`--color-accent-hover`/`--color-accent-text` derived from
  `theme.accentColor` in `ysws.config.json` via `color-mix()`. This is a deep
  ink neutral scale (`#14161b` bg, `#edf0f4` text) — deliberately NOT
  shadcn zinc/slate, NOT cream, NOT a purple/blue gradient. Body
  background/text and the focus-visible outline now use these tokens instead
  of Beest's hardcoded `#47453f`/`#e6f4fe`/`#93b4cd`.
- **Config reaches the frontend at runtime**: new
  `frontend/src/lib/server/ysws-config.ts` (mirrors the backend's
  `YswsConfigService` — reads `ysws.config.json`, falls back to
  `ysws.config.example.json`) + `frontend/src/routes/+layout.server.ts` loads
  it and exposes `program`/`currency`/`theme` as page data. `+layout.svelte`
  uses it for `<title>`/`<meta description>` and the accent color — no more
  hardcoded `<title>Beest</title>`. Needed `@types/node` added to
  `frontend/package.json` devDependencies (frontend had never directly
  imported a Node builtin before; `svelte-check` failed without it).
- Verified: `npm run build` and `npx svelte-check` both clean (one
  pre-existing `observer` reference error in `+page.svelte:76` is NOT from
  this work — was already broken before any of these changes, unrelated to
  theming, worth a separate fix).
- **NOT done yet, this is the bulk of task #5 remaining**: the actual
  per-component sweep. `home/+page.svelte` alone is ~8900 lines with
  hundreds of hardcoded hex colors in scoped `<style>` blocks (this was
  Beest's heavily custom-illustrated landing page) — same story across most
  of the other ~150 route/component files to a lesser degree. The tokens
  above exist now so that sweep has somewhere to point at:
  replace hardcoded hex colors with `var(--color-*)` equivalents (nearest
  match by role — background/elevated-surface/border/text/accent — not a
  literal find-replace since Beest's exact hex values won't map 1:1). Do
  this file-by-file, verify `npm run build` after each batch, watch for
  colors used for MEANING (status colors: approved/green,
  rejected/red, pending/yellow) vs decorative ones — don't accidentally
  recolor a status indicator to the accent color. Also still open: any
  Beest-mascot/pipe-themed SVG illustrations or images under
  `frontend/static/images` need inventory + a decision (generic replacement
  vs removal) — not yet scoped.

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

## Orchard (Hack Club's own infra) — 2026-08-07

Operator wants this hosted on Hack Club's own infra (Orchard,
`orchard.infra.hackclub.com`), not just Vercel — "vercel is okay but this
should really be on hack club infra." Vercel work stays (both targets
supported from one repo now), Orchard is the priority.

- **API**: bearer token auth (`Authorization: Bearer orch_...`), token stored
  locally at `/workspace/t-1786057735.891019/.secrets/orchard_token` (outside
  the repo, gitignored anyway). `GET /apiv1/auth/me` confirms identity
  (euan@hackclub.com). Real API base is `orchard.infra.hackclub.com` — the
  first snippet the operator pasted had a literal placeholder domain
  (`mcp.yourdomain.com`), correctly did NOT act on that, asked for the real
  one, got `orchard.infra.hackclub.com` back.
- **Model discovered** (all via read-only GETs before writing anything):
  Kubernetes-backed PaaS, org → project → resources (deployment/database/
  ingress), or a canned "template" that bundles those together.
  `GET /apiv1/organizations/17ca54bd-9a77-42ef-b19f-17aed9b6ea4e` = the
  `YSWS` org (slug `ysws`, enterprise plan) — operator already owns a project
  in it called "EPS project" (empty shell, unrelated to this template, did
  NOT touch it). `GET /apiv1/templates` lists built-ins: `nodejs-postgres`
  (exactly fits the backend — bundles Postgres, auto-provides `DATABASE_URL`),
  `static-site` (nginx, no server — does NOT fit the frontend, which is SSR
  via `+page.server.ts`/`+server.ts`, not a static SPA), `ghost`, `redis`,
  `wordpress`.
  **Key constraint**: templates/deployments take a pre-built **Docker image
  reference** (e.g. `ghcr.io/x/y:latest`), not a git repo to build from —
  Orchard does not build source itself. So the path is: CI builds + pushes
  the image, then Orchard pulls it.
- **CI**: `.github/workflows/docker-publish.yml` builds `backend/Dockerfile`
  and `frontend/Dockerfile` (both already existed, vendored from beest — its
  real prod deploy is container-based, NOT vercel, unsurprising for a
  stateful NestJS+Postgres app) and pushes to `ghcr.io/edripper/ysws-template-
  {backend,frontend}:latest` on every push to `master`. First run failed:
  `github.repository` interpolates as `EDRipper/ysws-template` (mixed case)
  and Docker tags must be lowercase — fixed by hardcoding the lowercase
  `edripper/ysws-template-*` tags instead of the dynamic expression.
- **Frontend adapter had to become dual-target**: swapping to
  `@sveltejs/adapter-vercel` unconditionally (task #6 work) would have
  silently broken `frontend/Dockerfile`, which expects adapter-node's
  `build/` output dir. Fixed in `svelte.config.js`: `process.env.VERCEL ?
  adapterVercel : adapterNode` — Vercel sets `VERCEL=1` during its own build,
  every other build (the Dockerfile, plain `npm run build`) gets adapter-node.
  Verified BOTH build outputs locally (`build/` for node, `.vercel/output/`
  for vercel) before pushing.
- **NOT done yet**: actually instantiating the Orchard resources (new
  project, `nodejs-postgres` template for the backend once an image is
  published, something equivalent for the frontend — probably a raw
  deployment+ingress pair via the generic `/apiv1/projects/:id/deployments`
  endpoint rather than a template, since no built-in template fits a
  Postgres-less Node SSR app). Blocked on: (1) the CI image actually
  publishing successfully post-fix, (2) a real domain/subdomain to put in
  the required `domain` ingress field — this is genuinely not my call, no
  existing ingress on this org to mirror a convention from, asked the
  operator rather than guessing a domain that might collide with something
  real on shared Hack Club infra.

## Known risks / things to double check later

- Currency `formatCurrency()` helper is unused so far — nothing calls it yet.
  Verify it actually gets threaded through once genericization starts, don't let
  it become dead code.
- `YswsConfigService` looks for `ysws.config.json` relative to `process.cwd()` at
  two candidate paths (cwd and cwd/..) since local dev runs from `backend/` but the
  Vercel function's cwd will differ — revisit once task #6 defines the actual
  Vercel function entrypoint and confirm the path resolution actually works there.
