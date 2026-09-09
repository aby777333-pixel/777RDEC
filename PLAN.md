# PLAN

Working record. Written before each phase, updated after.

## Scope

**This repository is the marketing website only.** The Raptor Terminal, EMIL
cockpit, CRM and client portal are supplied separately and will be linked or
embedded here later. Nothing in this repo simulates or reimplements them.

An earlier pass had built a simulated terminal and a sandbox; that was removed
on instruction. See DECISIONS.md §11 for exactly what came out and what is
still available to build on.

## Phase 1 — Foundation ✅

Next 14 App Router, `src/`, TypeScript strict (plus `noUnusedLocals` /
`noUnusedParameters`), Tailwind over a CSS-variable token layer, self-hosted
fonts via `next/font`, `lib/brand.ts`, UI primitives, Nav + mega-menu + mobile
drawer + footer + consent-gated cookie banner, `check-copy.ts` wired into
`npm run build`, and every route from the brief as a real page.

*Done when: every route exists with correct metadata, nav works on mobile,
copy guard passes.* ✅

## Phase 2 — Design system ✅

Two complete palettes (light and dark), three-state theme control, type scale,
hairline grid field, glass surfaces, tabular numerals, `/design-system` QA
page rendering every token and component in both themes.

*Done when: every component is visible in both themes on one page.* ✅

## Phase 3 — Homepage ✅

Nine sections: image-led hero with the ecosystem grid, "not another platform"
docking animation, ecosystem flow diagram, EMIL reveal, audience switcher,
cross-asset correlation matrix, risk visualisation, white-label re-skin demo,
API code panels, closing. First load 176 kB against the 350 kB budget.

## Phase 4 — Product pages ✅

Every page carries real copy and answers the five questions (what / who / why /
how it connects / what next). Live components on the homepage,
`/technology/architecture` (ecosystem diagram), `/platform/emil` (five pillars
with micro-visuals, the not-an-EA comparison, the operating-mode control),
`/technology/api` (code panels), `/brokers/white-label` (browser re-skin),
`/platform/risk` and `/intelligence/risk` (treemap, gauges),
`/intelligence/market` (correlation matrix).

## Phase 5 — Compliance and legal ✅

Technology-provider disclosure and legal entity block in the footer of every
page. Seven legal documents at `/legal/*` written in plain language. Copy guard
blocking forbidden claims. No certification badges anywhere.

## Phase 6 — Forms and content ✅

Supabase migration for `demo_requests`, `contact_messages` and
`newsletter_subscribers` with RLS on and no policies. Server Actions writing
through the service role; Zod validation; honeypot plus Turnstile behind an env
flag; swappable Resend/console email adapter. MDX pipeline for `/company/news`
and `/intelligence/research`, with three research notes and two news items
marked `draft: true`.

## Phase 7 — Polish ✅

`sitemap.ts`, `robots.ts`, OG image route at `/api/og` with the chrome
treatment, JSON-LD (Organization + SoftwareApplication), branded 404 and 500,
favicon from the wing mark, status page backed by `/api/status`.

## Verified

- `npm run verify` — typecheck, lint and copy guard all clean.
- Production build: 56 routes, homepage first load 176 kB.
- Zero console errors on `/`, `/platform/emil`, `/brokers/white-label` and
  mobile, in both themes.
- No horizontal scroll at 390 / 768 / 1440 (`window.scrollX` stays 0).

## Open items

- **Hero images.** Not in the repo — see `public/hero/README.md` for the three
  filenames. Presence is checked server-side, so a missing file makes no
  request and the hero falls back to the gradient and grid.
- **Logo.** `RaptorLogo` composes the lockup from type plus the abstracted
  wing. Drop `public/brand/raptor-logo.png` in and swap it in that one file.
- **Phone country code.** The supplied number is `+91 9698 000 999` — an
  Indian dialling code against a UK headquarters. Used exactly as given; worth
  confirming it is the intended public number.
- **Supabase migration applied.** Both migrations are live on project
  `ixpqkvyxqvmllottnvgi`: the three lead tables with RLS, plus the grant
  revocation. Forms still need `SUPABASE_SERVICE_ROLE_KEY` set in Netlify
  before they persist — `SUPABASE_URL` is already set.
- **Legal review.** Every `/legal/*` page carries a visible note that it is a
  draft prepared alongside the site and needs counsel.
- **Product links.** `/experience` currently redirects to `/request-demo`.
  Point it at the real terminal when it is available (one line in
  `next.config.mjs`).
- **Accessibility.** A full axe pass now runs clean: 35 routes × both themes
  against `wcag2a`/`wcag2aa`/`wcag21a`/`wcag21aa`/`best-practice`, **0
  violations**. Five findings were fixed to get there — see DECISIONS.md.
  Contrast pairs are still computed by hand for the tint system.
- **Cross-browser.** Chromium is swept on every change (both themes, plus a
  390px pass for horizontal scroll). iOS Safari has been *audited, not
  verified*: the Playwright WebKit download is blocked by this environment's
  egress proxy, so the known WebKit behaviours were addressed defensively
  (16px form controls on coarse pointers, `input[type=search]` appearance
  reset, tap-highlight). The `backdrop-filter` glass surfaces already carry
  their `-webkit-` prefixes. Worth one pass on a real device.
- **Session images.** Not in the repo — see `public/sessions/README.md` for
  the three filenames the globe on `/platform/markets` looks for. Same
  server-side presence check as the hero images, so a missing file makes no
  request.
- **Case studies.** `CASE_STUDIES` in `src/lib/copy/proof.ts` is deliberately
  empty. Add entries only once a client has approved the wording — the type
  carries an `approved` flag to make that explicit.
- **Integrations directory.** Every entry is marked `status: 'request'` and
  tagged TODO_CONFIRM. Promote to `available` or `live` only for venues and
  vendors that are genuinely connected.
- **Roles.** The six roles in `src/lib/copy/roles.ts` are marked TODO_CONFIRM.
  Confirm which are actually open before the careers page goes in front of
  candidates.
- **Newsletter delivery.** Signups land in `newsletter_subscribers`. There is
  no sending integration yet — the list is captured, nothing is mailed.
